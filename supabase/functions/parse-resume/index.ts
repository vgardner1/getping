import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
  location?: string;
}

interface ParsedResumeData {
  work_experience: WorkExperience[];
  skills: string[];
  interests: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, resumeUrl, fileName } = await req.json();
    
    if (!userId || !resumeUrl || !fileName) {
      throw new Error('Missing required parameters: userId, resumeUrl, or fileName');
    }

    console.log('=== Resume Parsing Started ===');
    console.log('User ID:', userId);
    console.log('Resume URL:', resumeUrl);
    console.log('File name:', fileName);

    // Download the resume file
    console.log('Downloading resume file...');
    const resumeResponse = await fetch(resumeUrl);
    if (!resumeResponse.ok) {
      throw new Error(`Failed to download resume: ${resumeResponse.status} ${resumeResponse.statusText}`);
    }

    const resumeBuffer = await resumeResponse.arrayBuffer();
    console.log('Resume downloaded, size:', resumeBuffer.byteLength, 'bytes');

    // Extract text from resume
    const resumeText = await extractTextFromResume(resumeBuffer, fileName);
    
    // Check if extraction was successful
    if (!resumeText || resumeText.length < 100) {
      console.warn('Resume text extraction yielded insufficient content');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Could not extract sufficient text from resume. Please ensure the file is a valid PDF with selectable text.',
        message: resumeText
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Text extracted successfully, length:', resumeText.length);

    // Parse with AI
    console.log('Sending to AI for structured parsing...');
    const parsedData = await parseResumeWithAI(resumeText);

    // Check if we got any meaningful data
    const hasData = 
      parsedData.work_experience.length > 0 || 
      parsedData.skills.length > 0 || 
      parsedData.interests.length > 0;

    if (!hasData) {
      console.warn('AI parsing returned no data');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Could not extract structured information from resume. The resume may not contain standard sections for work experience, skills, or interests.',
        data: parsedData
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update profile with extracted data
    console.log('Updating profile with parsed data...');
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        work_experience: parsedData.work_experience,
        experience: parsedData.work_experience, // Also update experience field
        skills: parsedData.skills,
        interests: parsedData.interests,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log('=== Resume Parsing Completed Successfully ===');
    console.log('Work experiences extracted:', parsedData.work_experience.length);
    console.log('Skills extracted:', parsedData.skills.length);
    console.log('Interests extracted:', parsedData.interests.length);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Resume parsed successfully',
      data: parsedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== Resume Parsing Error ===');
    console.error('Error details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function extractTextFromResume(buffer: ArrayBuffer, fileName: string): Promise<string> {
  console.log('Starting text extraction from:', fileName);
  
  // Use pdf.js for PDF parsing
  if (fileName.toLowerCase().endsWith('.pdf')) {
    try {
      console.log('Detected PDF file, using pdfjs-dist for parsing');
      // Import pdfjs-dist - use a stable CDN version
      const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm');
      
      // Configure worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
      
      // Load the PDF with proper configuration
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        isEvalSupported: false,
      });
      
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Join text items with proper spacing
          const pageText = textContent.items
            .map((item: any) => {
              // Handle text items with proper spacing
              if ('str' in item) {
                return item.str;
              }
              return '';
            })
            .filter(text => text.trim().length > 0)
            .join(' ');
          
          fullText += pageText + '\n\n';
          console.log(`Page ${pageNum} extracted: ${pageText.length} characters`);
        } catch (pageError) {
          console.error(`Error extracting page ${pageNum}:`, pageError);
          // Continue with other pages even if one fails
        }
      }
      
      const cleanedText = fullText.trim();
      console.log(`Total text extracted: ${cleanedText.length} characters`);
      
      if (cleanedText.length > 100) { // Ensure we got meaningful content
        return cleanedText;
      }
      
      console.warn('PDF parsed but content too short');
      return 'Resume content could not be extracted. The PDF may be image-based or password protected. Please ensure it contains selectable text.';
    } catch (error) {
      console.error('PDF parsing error:', error);
      return `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try a different file or ensure the PDF contains selectable text.`;
    }
  }
  
  // For Word docs (.doc, .docx) or other text formats
  if (fileName.toLowerCase().match(/\.(doc|docx|txt)$/)) {
    try {
      console.log('Attempting text extraction from non-PDF file');
      const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      
      // Try to extract readable text (printable ASCII and common Unicode)
      const readableText = text.match(/[\x20-\x7E\u00A0-\uFFFF\s]{10,}/g);
      
      if (readableText && readableText.length > 0) {
        const extracted = readableText.join(' ').trim();
        console.log(`Text extracted: ${extracted.length} characters`);
        
        if (extracted.length > 100) {
          return extracted;
        }
      }
    } catch (e) {
      console.error('Text extraction error:', e);
    }
  }
  
  console.error('Could not extract text from file');
  return 'Could not extract text from this file format. Please upload a PDF file with selectable text, or convert your document to PDF first.';
}

async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.error('OpenAI API key not configured');
    throw new Error('OpenAI API key not found in environment');
  }

  console.log('Preparing to parse resume with AI, text length:', resumeText.length);

  // Truncate text if too long to avoid token limits
  const maxLength = 15000; // Conservative limit for GPT-4o-mini
  const truncatedText = resumeText.length > maxLength 
    ? resumeText.substring(0, maxLength) + '\n\n[Text truncated due to length]'
    : resumeText;

  const systemPrompt = `You are an expert resume parser with the following capabilities:
- Extract work experience with complete details including company, position, dates, and descriptions
- Identify technical and professional skills
- Determine professional interests and areas of expertise
- Parse dates in various formats (MM/YYYY, Month Year, etc.)
- Handle incomplete or messy resume data gracefully

CRITICAL RULES:
1. ONLY extract information that is EXPLICITLY stated in the resume
2. DO NOT fabricate or infer companies, positions, or dates
3. DO NOT add generic placeholder companies like "BIND Solutions", "Republic 2.0", etc.
4. If information is unclear or missing, return an empty array for that section
5. Be extremely conservative - accuracy over completeness`;

  const userPrompt = `Analyze this resume and extract structured information:

RESUME TEXT:
${truncatedText}

Return a JSON object with this EXACT structure:
{
  "work_experience": [
    {
      "company": "Exact company name from resume",
      "position": "Exact job title from resume",
      "duration": "Start Date - End Date (or 'Start Date - Present')",
      "description": "Key responsibilities and achievements in 2-3 sentences",
      "location": "City, State/Country (if mentioned)"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "interests": ["interest1", "interest2"]
}

IMPORTANT:
- Extract work experience in reverse chronological order (most recent first)
- For skills, include technical skills, tools, and methodologies
- For interests, include hobbies, causes, or professional interests mentioned
- Return empty arrays if sections are not found
- Ensure valid JSON format`;

  try {
    console.log('Calling OpenAI API for resume parsing');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Low temperature for consistency
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error response:', JSON.stringify(data, null, 2));
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in OpenAI response');
      throw new Error('OpenAI returned empty response');
    }

    console.log('AI response received, parsing JSON');
    
    let parsed: ParsedResumeData;
    
    try {
      // Try direct parse first
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.log('Direct parse failed, trying to clean response');
      // Try cleaning markdown code blocks
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      
      try {
        parsed = JSON.parse(cleaned);
      } catch (cleanedParseError) {
        console.error('Failed to parse cleaned JSON:', cleanedParseError);
        console.error('Content was:', content);
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Validate and sanitize the parsed data
    const result: ParsedResumeData = {
      work_experience: [],
      skills: [],
      interests: []
    };

    // Validate work experience
    if (Array.isArray(parsed.work_experience)) {
      result.work_experience = parsed.work_experience
        .filter(exp => 
          exp && 
          typeof exp.company === 'string' && 
          typeof exp.position === 'string' &&
          exp.company.trim().length > 0 &&
          exp.position.trim().length > 0
        )
        .map(exp => ({
          company: exp.company.trim(),
          position: exp.position.trim(),
          duration: exp.duration?.trim() || 'Duration not specified',
          description: exp.description?.trim() || '',
          location: exp.location?.trim() || undefined
        }));
    }

    // Validate skills
    if (Array.isArray(parsed.skills)) {
      result.skills = parsed.skills
        .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
        .map(skill => skill.trim())
        .slice(0, 20); // Limit to 20 skills
    }

    // Validate interests
    if (Array.isArray(parsed.interests)) {
      result.interests = parsed.interests
        .filter(interest => typeof interest === 'string' && interest.trim().length > 0)
        .map(interest => interest.trim())
        .slice(0, 10); // Limit to 10 interests
    }

    console.log('Successfully parsed resume:', {
      work_experience_count: result.work_experience.length,
      skills_count: result.skills.length,
      interests_count: result.interests.length
    });

    return result;
    
  } catch (error) {
    console.error('Error in parseResumeWithAI:', error);
    
    // Return empty structure on error rather than throwing
    // This allows the process to complete even if AI parsing fails
    return {
      work_experience: [],
      skills: [],
      interests: []
    };
  }
}
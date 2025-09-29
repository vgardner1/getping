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
    console.log('Parsing resume for user:', userId);

    // Download the resume file
    const resumeResponse = await fetch(resumeUrl);
    if (!resumeResponse.ok) {
      throw new Error('Failed to download resume');
    }

    const resumeBuffer = await resumeResponse.arrayBuffer();
    const resumeText = await extractTextFromResume(resumeBuffer, fileName);

    // Parse with AI
    const parsedData = await parseResumeWithAI(resumeText);

    // Update profile with extracted data
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        work_experience: parsedData.work_experience,
        skills: parsedData.skills,
        interests: parsedData.interests,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error('Failed to update profile with resume data');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Resume parsed successfully',
      data: parsedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
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
  // For now, we'll use a simple text extraction approach
  // In a production environment, you'd want to use a proper PDF/DOC parser
  
  if (fileName.toLowerCase().endsWith('.pdf')) {
    // Simple PDF text extraction (basic approach)
    const uint8Array = new Uint8Array(buffer);
    const text = new TextDecoder().decode(uint8Array);
    
    // Extract readable text between stream objects (very basic)
    const textMatches = text.match(/stream(.*?)endstream/gs);
    if (textMatches) {
      return textMatches.join(' ').replace(/[^\x20-\x7E]/g, ' ').trim();
    }
    
    return 'Resume content could not be extracted. Please ensure the file is not password protected.';
  }
  
  // For Word docs, we'd need a proper parser
  return 'Please upload a PDF file for automatic text extraction.';
}

async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  const prompt = `
Analyze the following resume text and extract structured information. 
Focus on work experience, technical skills, and professional interests.

RESUME TEXT:
${resumeText}

Extract the information and return it as a JSON object with this exact structure:
{
  "work_experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "Start Date - End Date",
      "description": "Brief description of role and key achievements",
      "location": "City, State (if available)"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "interests": ["interest1", "interest2", "interest3"]
}

IMPORTANT GUIDELINES:
- Only extract actual work experience, do not make up companies like "BIND Solutions", "Republic 2.0", "Roots", etc.
- Only list skills explicitly mentioned or clearly demonstrated in the resume
- For interests, look for hobbies, personal projects, or professional interests mentioned
- If any section is empty or unclear, return an empty array
- Be conservative - only include information that is clearly stated in the resume
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume parser. Extract only accurate information that is explicitly stated in the resume. Do not infer or create information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('OpenAI API error:', data);
    throw new Error('Failed to parse resume with AI');
  }

  try {
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    let parsed: ParsedResumeData;
    
    try {
      parsed = JSON.parse(content);
    } catch (_e) {
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsed = JSON.parse(cleaned);
    }

    // Validate and ensure proper structure
    return {
      work_experience: Array.isArray(parsed.work_experience) ? parsed.work_experience : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      interests: Array.isArray(parsed.interests) ? parsed.interests : []
    };
    
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      work_experience: [],
      skills: [],
      interests: []
    };
  }
}
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, FileText, Download, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
  profile: any;
  onResumeUploaded: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ profile, onResumeUploaded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const processExistingResume = async () => {
    if (!user || !profile?.resume_url) return;

    setProcessing(true);
    try {
      const { data: processData, error: processError } = await supabase.functions.invoke('parse-resume', {
        body: { 
          userId: user.id,
          resumeUrl: profile.resume_url,
          fileName: profile.resume_filename || 'resume.pdf'
        }
      });

      if (processError) {
        throw processError;
      }

      toast({
        title: "Resume re-parsed!",
        description: "Work experience has been updated from your resume."
      });
      
      onResumeUploaded();
    } catch (error) {
      console.error('Error re-parsing resume:', error);
      toast({
        title: "Re-parsing failed",
        description: "Could not extract data from resume. Please try uploading again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-resume-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { 
          contentType: file.type, 
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Update profile with resume URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resume_url: data.publicUrl,
          resume_filename: file.name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Resume uploaded!",
        description: "Processing resume to extract work experience..."
      });

      // Process resume to extract work experience
      setProcessing(true);
      const { data: processData, error: processError } = await supabase.functions.invoke('parse-resume', {
        body: { 
          userId: user.id,
          resumeUrl: data.publicUrl,
          fileName: file.name
        }
      });

      if (processError) {
        console.error('Resume processing error:', processError);
        toast({
          title: "Resume uploaded",
          description: "Resume uploaded successfully, but automatic processing failed. You can manually add work experience.",
          variant: "default"
        });
      } else {
        toast({
          title: "Resume processed!",
          description: "Work experience extracted and added to your profile."
        });
      }

      onResumeUploaded();

    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const downloadResume = () => {
    if (profile?.resume_url) {
      const link = document.createElement('a');
      link.href = profile.resume_url;
      link.download = profile.resume_filename || 'resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      {profile?.resume_url ? (
        <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
          <FileText className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium">{profile.resume_filename || 'Resume uploaded'}</p>
            <p className="text-sm text-muted-foreground">
              Resume uploaded and processed for work experience
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={processExistingResume}
              variant="outline"
              size="sm"
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Re-parse
                </>
              )}
            </Button>
            <Button
              onClick={downloadResume}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Label htmlFor="resume-upload-replace">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Replace
                </span>
              </Button>
            </Label>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center bg-gradient-to-b from-primary/5 to-transparent">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold iridescent-text mb-2">Upload Your Resume</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your resume (PDF or Word) to automatically extract your work experience, skills, and make it easily shareable
          </p>
          <Label htmlFor="resume-upload">
            <Button 
              disabled={uploading || processing} 
              size="lg" 
              className="hover:scale-105 transition-transform duration-200"
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Resume File
                  </>
                )}
              </span>
            </Button>
          </Label>
          <p className="text-xs text-muted-foreground mt-3">
            PDF, DOC, and DOCX files supported • Max 10MB
          </p>
        </div>
      )}

      <input
        id="resume-upload"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleResumeUpload}
        disabled={uploading || processing}
        className="hidden"
      />
      
      <input
        id="resume-upload-replace"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleResumeUpload}
        disabled={uploading || processing}
        className="hidden"
      />
    </div>
  );
};
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
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
          <p className="text-muted-foreground mb-4">
            Upload your resume to automatically extract work experience and skills
          </p>
          <Label htmlFor="resume-upload">
            <Button disabled={uploading || processing} asChild>
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Resume
                  </>
                )}
              </span>
            </Button>
          </Label>
          <p className="text-xs text-muted-foreground mt-2">
            Supports PDF and Word documents
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
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import Model3DViewer from '@/components/Model3DViewer';
import { Link } from 'react-router-dom';

const Model3DUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validExtensions = ['.glb', '.gltf', '.obj', '.fbx'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a .glb, .gltf, .obj, or .fbx file',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setUploadedUrl(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a 3D model file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('3d-models')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('3d-models')
        .getPublicUrl(data.path);

      setUploadedUrl(publicUrl);
      setUploadProgress(100);
      
      toast({
        title: 'Upload successful!',
        description: 'Your 3D model has been uploaded',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold iridescent-text">3D Model Upload</h1>
            <p className="text-muted-foreground mt-2">
              Upload your 3D models to Supabase Storage
            </p>
          </div>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Model</CardTitle>
              <CardDescription>
                Supported formats: .glb, .gltf, .obj, .fbx
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-file">Select 3D Model File</Label>
                <Input
                  id="model-file"
                  type="file"
                  accept=".glb,.gltf,.obj,.fbx"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>

              {file && (
                <div className="p-3 bg-muted rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Model
                  </>
                )}
              </Button>

              {uploadedUrl && (
                <div className="p-3 bg-primary/10 border border-primary rounded-md space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Upload successful!</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Public URL:</p>
                    <Input
                      value={uploadedUrl}
                      readOnly
                      className="text-xs font-mono"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                View your uploaded 3D model
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedUrl ? (
                <Model3DViewer
                  modelUrl={uploadedUrl}
                  autoRotate={true}
                  height="400px"
                  width="100%"
                />
              ) : (
                <div className="h-[400px] rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Upload a model to see preview
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Upload Your Model</h3>
              <p className="text-sm text-muted-foreground">
                Select a 3D model file (.glb, .gltf, .obj, or .fbx) and click upload.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">2. Copy the Public URL</h3>
              <p className="text-sm text-muted-foreground">
                After upload, copy the public URL from the success message.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">3. Use in Your App</h3>
              <p className="text-sm text-muted-foreground">
                Use the Model3DViewer component anywhere in your app:
              </p>
              <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`import Model3DViewer from '@/components/Model3DViewer';

<Model3DViewer 
  modelUrl="YOUR_PUBLIC_URL_HERE"
  autoRotate={true}
  height="400px"
  width="100%"
/>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Model3DUpload;

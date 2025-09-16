import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Save, X, Camera, MapPin, Building2, Mail, Phone, ExternalLink, Plus, Trash2, Upload, Eye, EyeOff, LogOut } from 'lucide-react';
import { ResumeUpload } from './ResumeUpload';
import { useNavigate } from 'react-router-dom';


interface ProfileEditProps {
  profile: any;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onSave, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    company: profile?.company || '',
    job_title: profile?.job_title || '',
    phone_number: profile?.phone_number || '',
    website_url: profile?.website_url || '',
    avatar_url: profile?.avatar_url || '',
    is_public: profile?.is_public !== undefined ? profile.is_public : true
  });

  // Update form data when profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        company: profile.company || '',
        job_title: profile.job_title || '',
        phone_number: profile.phone_number || '',
        website_url: profile.website_url || '',
        avatar_url: profile.avatar_url || '',
        is_public: profile.is_public !== undefined ? profile.is_public : true
      });
    }
  }, [profile]);

  const [socialLinks, setSocialLinks] = useState(() => {
    const defaultLinks = [
      { platform: 'linkedin', label: 'LinkedIn', value: profile?.linkedin_url || '', icon: 'linkedin' },
      { platform: 'instagram', label: 'Instagram', value: profile?.instagram_handle || '', icon: 'instagram' },
      { platform: 'twitter', label: 'Twitter/X', value: '', icon: 'twitter' },
      { platform: 'website', label: 'Website', value: profile?.website_url || '', icon: 'globe' }
    ];

    // Add existing social links from profile
    if (profile?.social_links) {
      Object.entries(profile.social_links).forEach(([platform, linkData]: [string, any]) => {
        const existingIndex = defaultLinks.findIndex(link => link.platform === platform);
        if (existingIndex >= 0) {
          defaultLinks[existingIndex].value = typeof linkData === 'string' ? linkData : linkData.url || '';
        } else {
          defaultLinks.push({
            platform,
            label: typeof linkData === 'object' ? linkData.label : platform,
            value: typeof linkData === 'string' ? linkData : linkData.url || '',
            icon: 'external'
          });
        }
      });
    }

    return defaultLinks;
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks];
    updated[index].value = value;
    setSocialLinks(updated);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      // Get file extension and create file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data with new avatar URL
      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));

      toast({
        title: "success",
        description: "profile photo uploaded successfully!"
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "error",
        description: "failed to upload photo. please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, {
      platform: '',
      label: '',
      value: '',
      icon: 'external'
    }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialPlatform = (index: number, platform: string, label: string) => {
    const updated = [...socialLinks];
    updated[index].platform = platform.toLowerCase().replace(/\s+/g, '');
    updated[index].label = label;
    setSocialLinks(updated);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Prepare social links data
      const socialLinksData = socialLinks
        .filter(link => link.value.trim() !== '' && link.platform.trim() !== '')
        .reduce((acc, link) => {
          acc[link.platform] = {
            label: link.label,
            url: link.value,
            platform: link.platform
          };
          return acc;
        }, {} as Record<string, any>);

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          company: formData.company,
          job_title: formData.job_title,
          phone_number: formData.phone_number,
          website_url: formData.website_url,
          avatar_url: formData.avatar_url,
          is_public: formData.is_public,
          linkedin_url: socialLinks.find(link => link.platform === 'linkedin')?.value || '',
          instagram_handle: socialLinks.find(link => link.platform === 'instagram')?.value || '',
          social_links: socialLinksData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "success",
        description: "profile updated successfully!"
      });

      onSave();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "error",
        description: "failed to update profile. please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold iridescent-text">edit profile</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'saving...' : 'save changes'}
          </Button>
        </div>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            profile photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden">
              <img
                src={formData.avatar_url || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="photo-upload">upload photo</Label>
              <div className="mt-2">
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={uploadingPhoto}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingPhoto ? 'uploading...' : 'choose photo'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                upload your profile photo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {formData.is_public ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            profile privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is_public">public profile</Label>
              <p className="text-sm text-muted-foreground">
                {formData.is_public 
                  ? 'your profile is visible to everyone and will appear in search results'
                  : 'your profile is private and will only be visible to you'
                }
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => updateFormData('is_public', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>basic information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">display name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => updateFormData('display_name', e.target.value)}
                placeholder="your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">job title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => updateFormData('job_title', e.target.value)}
                placeholder="software engineer"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="your company"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="city, state"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => updateFormData('bio', e.target.value)}
              placeholder="tell people about yourself..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => updateFormData('phone_number', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">website</Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => updateFormData('website_url', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Interests */}
      <Card>
        <CardHeader>
          <CardTitle>skills & interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skills">skills</Label>
              <Textarea
                id="skills"
                value={profile?.skills?.join(', ') || ''}
                onChange={() => {}} // Read-only for now
                placeholder="Your skills will appear here after uploading your resume"
                rows={3}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">interests</Label>
              <Textarea
                id="interests"
                value={profile?.interests?.join(', ') || ''}
                onChange={() => {}} // Read-only for now
                placeholder="Your interests will appear here after uploading your resume"
                rows={3}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            resume upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUpload 
            profile={profile}
            onResumeUploaded={() => {
              // Refresh profile data
              onSave();
            }}
          />
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>social links</CardTitle>
            <Button onClick={addSocialLink} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              add link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <div className="grid md:grid-cols-3 gap-3 flex-1">
                <div className="space-y-1">
                  <Label className="text-xs">platform</Label>
                  <Input
                    value={link.label}
                    onChange={(e) => updateSocialPlatform(index, e.target.value, e.target.value)}
                    placeholder="linkedin"
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-xs">url or handle</Label>
                  <Input
                    value={link.value}
                    onChange={(e) => updateSocialLink(index, e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="text-sm"
                  />
                </div>
              </div>
              <Button
                onClick={() => removeSocialLink(index)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <LogOut className="w-5 h-5" />
            account actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">log out</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  sign out of your ping! account
                </p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                log out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
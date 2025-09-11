import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Save, X, Camera, MapPin, Building2, Mail, Phone, ExternalLink, Plus, Trash2, Upload } from 'lucide-react';
import { removeBackground, loadImage } from '@/lib/backgroundRemoval';

interface ProfileEditProps {
  profile: any;
  onSave: () => void;
  onCancel: () => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onSave, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
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
    avatar_url: profile?.avatar_url || ''
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
        avatar_url: profile.avatar_url || ''
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

  const updateFormData = (field: string, value: string) => {
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
      // Load the image
      const imageElement = await loadImage(file);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Upload to Supabase Storage
      const fileExt = 'png'; // Always PNG for transparency
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, processedBlob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data with new avatar URL
      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));

      toast({
        title: "Success",
        description: "Profile photo uploaded and background removed!"
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
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
          linkedin_url: socialLinks.find(link => link.platform === 'linkedin')?.value || '',
          instagram_handle: socialLinks.find(link => link.platform === 'instagram')?.value || '',
          social_links: socialLinksData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });

      onSave();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold iridescent-text">Edit Profile</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Change'}
          </Button>
        </div>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Profile Photo
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
              <Label htmlFor="photo-upload">Upload Photo</Label>
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
                  {uploadingPhoto ? 'Processing...' : 'Choose Photo'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Background will be automatically removed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => updateFormData('display_name', e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => updateFormData('job_title', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Your Company"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="City, State"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => updateFormData('bio', e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
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
              <Label htmlFor="website_url">Website</Label>
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

      {/* Social Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Social Links</CardTitle>
            <Button onClick={addSocialLink} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <div className="grid md:grid-cols-3 gap-3 flex-1">
                <div className="space-y-1">
                  <Label className="text-xs">Platform</Label>
                  <Input
                    value={link.label}
                    onChange={(e) => updateSocialPlatform(index, e.target.value, e.target.value)}
                    placeholder="LinkedIn"
                    className="text-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-xs">URL or Handle</Label>
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
    </div>
  );
};
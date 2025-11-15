import { useEffect, useState, useMemo } from 'react';
import SphereImageGrid, { ImageData } from '@/components/SphereImageGrid';
import { supabase } from '@/integrations/supabase/client';
import { ProfileDetailsModal } from '@/components/ProfileDetailsModal';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances' | 'network' | 'extended';
  angle: number;
  userId?: string;
  isConnected?: boolean;
}

interface Network3DWithSphereProps {
  people: NetworkPerson[];
  onPersonClick?: (person: NetworkPerson) => void;
  personHealth?: Record<string, number>;
  circleType?: 'my' | 'industry' | 'event';
  isDemoMode?: boolean;
}

export const Network3DWithSphere = ({
  people,
  onPersonClick,
  circleType = 'my',
  isDemoMode = false
}: Network3DWithSphereProps) => {
  const [profileImages, setProfileImages] = useState<ImageData[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileImages = async () => {
      setIsLoading(true);
      
      if (isDemoMode || !people.length) {
        // Demo mode: use placeholder images
        const demoImages: ImageData[] = people.map((person, index) => ({
          id: person.id,
          src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`,
          alt: person.name,
          title: person.name,
          description: `Circle: ${person.circle}`,
          profile: {
            display_name: person.name,
            bio: `Member of your ${person.circle} circle`,
            job_title: 'Connection',
            location: 'Unknown'
          }
        }));
        setProfileImages(demoImages);
        setIsLoading(false);
        return;
      }

      // Real mode: fetch actual profiles
      const userIds = people
        .filter(p => p.userId)
        .map(p => p.userId as string);

      if (userIds.length === 0) {
        setProfileImages([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        if (error) {
          console.error('Error loading profiles:', error);
          setIsLoading(false);
          return;
        }

        const images: ImageData[] = (profiles || []).map(profile => ({
          id: profile.user_id,
          src: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`,
          alt: profile.display_name || 'User',
          title: profile.display_name,
          description: profile.bio || '',
          profile: profile
        }));

        setProfileImages(images);
      } catch (err) {
        console.error('Error loading profile images:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileImages();
  }, [people, isDemoMode]);

  const handleImageClick = (image: ImageData) => {
    const person = people.find(p => p.userId === image.id || p.id === image.id);
    
    if (person && onPersonClick) {
      onPersonClick(person);
    }

    if (image.profile) {
      setSelectedProfile(image.profile);
      setShowProfileModal(true);
    }
  };

  const containerSize = typeof window !== 'undefined' 
    ? Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 800)
    : 600;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[600px]">
        <div className="text-muted-foreground animate-pulse">Loading your circle...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <SphereImageGrid
        images={profileImages}
        containerSize={containerSize}
        sphereRadius={containerSize * 0.4}
        dragSensitivity={0.6}
        momentumDecay={0.96}
        maxRotationSpeed={4}
        baseImageScale={0.15}
        hoverScale={1.3}
        perspective={1200}
        autoRotate={true}
        autoRotateSpeed={0.2}
        onImageClick={handleImageClick}
        className="mx-auto"
      />

      {showProfileModal && selectedProfile && (
        <ProfileDetailsModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfile(null);
          }}
          profile={selectedProfile}
        />
      )}
    </div>
  );
};

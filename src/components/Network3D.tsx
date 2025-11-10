import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import centerProfileImage from '@/assets/center-profile.jpeg';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronRight, X, User } from 'lucide-react';
import { FloatingProfilePreview } from './FloatingProfilePreview';
import { supabase } from '@/integrations/supabase/client';
interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances' | 'network' | 'extended';
  angle: number;
  userId?: string;
  isConnected?: boolean;
}
interface Network3DProps {
  people: NetworkPerson[];
  onPersonClick?: (person: NetworkPerson) => void;
  personHealth?: Record<string, number>;
  circleType?: 'my' | 'industry' | 'event';
  industries?: string[];
  events?: string[];
}
const CIRCLES = [{
  id: 'family',
  label: 'Family',
  radius: 3,
  color: 0x4ade80
}, {
  id: 'friends',
  label: 'Close friends',
  radius: 5.5,
  color: 0x4ade80
}, {
  id: 'business',
  label: 'Business partners',
  radius: 8,
  color: 0x4ade80
}, {
  id: 'acquaintances',
  label: 'Associates',
  radius: 10,
  color: 0x4ade80
}, {
  id: 'network',
  label: 'Network',
  radius: 12,
  color: 0x4ade80
}, {
  id: 'extended',
  label: 'Extended',
  radius: 14,
  color: 0x4ade80
}];
export const Network3D = ({
  people,
  onPersonClick,
  personHealth,
  circleType = 'my',
  industries,
  events
}: Network3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({
    x: 0,
    y: 0
  });
  const spheresRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const touchDistanceRef = useRef<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<NetworkPerson | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDemoNodes, setShowDemoNodes] = useState(false);
  const isZoomingRef = useRef(false);
  const zoomTargetRef = useRef<THREE.Vector3 | null>(null);
  const lastCameraPositionRef = useRef<THREE.Vector3 | null>(null);
  const [personBio, setPersonBio] = useState<string>('');
  const [isLoadingBio, setIsLoadingBio] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | undefined>();
  const [selectedPersonProfile, setSelectedPersonProfile] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!containerRef.current) return;

    // Define circles based on circleType
    let CIRCLES_TO_USE;
    if (circleType === 'industry' && industries) {
      CIRCLES_TO_USE = industries.map((industry, index) => ({
        id: industry.toLowerCase(),
        label: industry,
        radius: 2 + index * 2.5,
        color: 0x4ade80
      }));
    } else if (circleType === 'event' && events) {
      CIRCLES_TO_USE = events.map((event, index) => ({
        id: `event-${index}`,
        label: event,
        radius: 2 + index * 2.5,
        color: 0x4ade80
      }));
    } else {
      CIRCLES_TO_USE = CIRCLES;
    }

    // Add demo people to outer circles if showDemoNodes is enabled
    const demoPeople: NetworkPerson[] = [];
    if (showDemoNodes) {
      if (circleType === 'industry' && industries) {
        // Populate each industry circle with demo people
        industries.forEach((industry, circleIndex) => {
          const peopleCount = 6 + circleIndex * 2; // More people in outer circles
          for (let i = 0; i < peopleCount; i++) {
            demoPeople.push({
              id: `demo-${industry.toLowerCase()}-${i}`,
              name: `${industry} Contact ${i + 1}`,
              circle: industry.toLowerCase() as any,
              angle: 360 / peopleCount * i
            });
          }
        });
      } else if (circleType === 'event' && events) {
        // Populate each event circle with demo people
        events.forEach((event, circleIndex) => {
          const peopleCount = 6 + circleIndex * 2; // More people in outer circles
          for (let i = 0; i < peopleCount; i++) {
            demoPeople.push({
              id: `demo-event-${circleIndex}-${i}`,
              name: `${event.substring(0, 20)} Attendee ${i + 1}`,
              circle: `event-${circleIndex}` as any,
              angle: 360 / peopleCount * i
            });
          }
        });
      } else {
        // Default "my circle" demo behavior
        const hasNetwork = people.some(p => p.circle === 'network');
        const hasExtended = people.some(p => p.circle === 'extended');
        if (!hasNetwork) {
          // Add 8 demo dots to network circle
          for (let i = 0; i < 8; i++) {
            demoPeople.push({
              id: `demo-network-${i}`,
              name: `Network ${i + 1}`,
              circle: 'network',
              angle: 360 / 8 * i
            });
          }
        }
        if (!hasExtended) {
          // Add 12 demo dots to extended circle
          for (let i = 0; i < 12; i++) {
            demoPeople.push({
              id: `demo-extended-${i}`,
              name: `Extended ${i + 1}`,
              circle: 'extended',
              angle: 360 / 12 * i
            });
          }
        }
      }
    }
    const allPeople = [...people, ...demoPeople];

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    // Strong initial tilt so it never starts flat
    scene.rotation.x = -0.55;
    scene.rotation.y = 0.25;
    sceneRef.current = scene;

    // Camera setup - start at a high, top-down angle (~55°)
    const CAMERA_ANGLE_RATIO = 1.4; // y = ratio * z
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    // Start further back on mobile to show all circles
    const isMobile = window.innerWidth < 768;
    const initialZ = isMobile ? 28 : 18;
    camera.position.set(0, CAMERA_ANGLE_RATIO * initialZ, initialZ);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.domElement.style.touchAction = 'none'; // Prevent default touch behaviors
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Center sphere (represents the user)
    const centerGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    
    // Load profile texture
    const textureLoader = new THREE.TextureLoader();
    const profileTexture = textureLoader.load(centerProfileImage);
    profileTexture.colorSpace = THREE.SRGBColorSpace;
    
    const centerMaterial = new THREE.MeshPhongMaterial({
      map: profileTexture,
      emissive: 0x4ade80,
      emissiveIntensity: 0.3
    });
    const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
    centerSphere.userData.isUserCharacter = true;
    // Rotate sphere to face camera from top diagonal angle
    centerSphere.rotation.x = -0.4;
    centerSphere.rotation.y = 0.3;
    scene.add(centerSphere);


    // Create horizontal concentric circles (torus rings) with labels
    CIRCLES_TO_USE.forEach((circle, index) => {
      const isOutermost = index === CIRCLES_TO_USE.length - 1;
      
      if (isOutermost) {
        // Load the uploaded GLB model for the outer ring
        // Outer ring with iridescent green effect
        const ringGeometry = new THREE.TorusGeometry(circle.radius, 0.15, 16, 128);
        const ringMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x064e3b,
          metalness: 0.95,
          roughness: 0.1,
          envMapIntensity: 2.0,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        
        // Add green directional lights for iridescent effect
        const directionalLight1 = new THREE.DirectionalLight(0x10b981, 1.5);
        directionalLight1.position.set(5, 5, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x34d399, 1.2);
        directionalLight2.position.set(-5, -3, -2);
        scene.add(directionalLight2);

        const directionalLight3 = new THREE.DirectionalLight(0x6ee7b7, 0.8);
        directionalLight3.position.set(0, -5, 3);
        scene.add(directionalLight3);

        const rimLight = new THREE.DirectionalLight(0x059669, 1.0);
        rimLight.position.set(-3, 0, -5);
        scene.add(rimLight);
      } else {
        // Regular thin green rings for inner circles
        const torusGeometry = new THREE.TorusGeometry(circle.radius, 0.02, 16, 100);
        const torusMaterial = new THREE.MeshBasicMaterial({
          color: circle.color,
          transparent: true,
          opacity: 0.4
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.rotation.x = Math.PI / 2; // Make horizontal
        scene.add(torus);
      }

      // Create text label for each circle
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 512;
        canvas.height = 128;
        context.fillStyle = '#4ade80';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText(circle.label, 256, 80);
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0.8
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        // Position on the outside of the ring
        sprite.position.set(0, 0, circle.radius + 0.8);
        sprite.scale.set(2, 0.5, 1);
        scene.add(sprite);
      }
    });

    // Background floating dots for depth
    const backgroundDots: THREE.Mesh[] = [];
    for (let i = 0; i < 120; i++) {
      const dotGeometry = new THREE.SphereGeometry(0.04, 8, 8);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.35
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      const r = Math.random() * 18 + 4; // distance from center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      dot.position.set(r * Math.sin(phi) * Math.cos(theta), (Math.random() - 0.5) * 6,
      // near the ring plane but varied
      r * Math.sin(phi) * Math.sin(theta));
      dot.userData.velocity = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      };
      scene.add(dot);
      backgroundDots.push(dot);
    }

    // Helper function to calculate health score for color
    const getHealthScore = (person: NetworkPerson): number => {
      // Randomly assign some relationships as needing attention (red)
      const needsAttention = Math.random() < 0.15; // 15% chance of being red

      if (needsAttention) {
        return 15 + Math.random() * 25; // 15-40 (red - needs attention)
      }

      // Mock health score based on person's circle - start with healthier relationships
      const baseScores: Record<string, number> = {
        'family': 85 + Math.random() * 15,
        // 85-100 (very healthy)
        'friends': 75 + Math.random() * 20,
        // 75-95 (healthy)
        'business': 70 + Math.random() * 25,
        // 70-95 (mostly healthy)
        'acquaintances': 65 + Math.random() * 25,
        // 65-90 (good)
        'network': 60 + Math.random() * 30,
        // 60-90 (decent)
        'extended': 55 + Math.random() * 30 // 55-85 (fair)
      };
      return baseScores[person.circle] || 70;
    };
    const getHealthColor = (score: number): number => {
      if (score >= 70) return 0x22c55e; // vibrant green
      if (score >= 40) return 0xeab308; // vibrant yellow
      return 0xef4444; // vibrant red
    };

    // Create people spheres and connections
    const spheres = new Map<string, THREE.Mesh>();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.3
    });
    const interConnectionMaterial = new THREE.LineBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.15
    });
    const peopleByCircle = new Map<string, Array<{
      person: NetworkPerson;
      position: THREE.Vector3;
    }>>();
    allPeople.forEach(person => {
      const circle = CIRCLES_TO_USE.find(c => c.id === person.circle);
      if (!circle) return;
      const radius = circle.radius;
      const angle = person.angle * Math.PI / 180;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = 0; // Keep on horizontal plane

      const position = new THREE.Vector3(x, y, z);

      // Calculate health score and color (use provided map if available)
      const initialScore = personHealth && personHealth[person.id] !== undefined ? personHealth[person.id]! : getHealthScore(person);
      const healthColor = getHealthColor(initialScore);

      // Create person sphere with health-based color and pulsing glow
      const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x4ade80,
        emissive: healthColor,
        emissiveIntensity: 0.5
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(x, y, z);
      sphere.userData = {
        person,
        baseEmissive: 0.5,
        healthScore: initialScore,
        healthColor
      };
      scene.add(sphere);
      spheres.set(person.id, sphere);

      // Track people by circle for interconnections
      if (!peopleByCircle.has(person.circle)) {
        peopleByCircle.set(person.circle, []);
      }
      peopleByCircle.get(person.circle)!.push({
        person,
        position
      });

      // Create connection line to center with health-based color
      // Only draw line if person is connected (or if it's "my circle" mode)
      if (person.isConnected !== false) {
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(x, y, z));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const healthLineMaterial = new THREE.LineBasicMaterial({
          color: healthColor,
          transparent: true,
          opacity: 0.4
        });
        const line = new THREE.Line(lineGeometry, healthLineMaterial);
        scene.add(line);
      }
    });

    // Create interconnections between people on different circles
    allPeople.forEach(person => {
      const circle = CIRCLES_TO_USE.find(c => c.id === person.circle);
      if (!circle) return;
      const personSphere = spheres.get(person.id);
      if (!personSphere) return;

      // For friends circle, create more interconnections
      if (person.circle === 'friends') {
        // Connect to some people in business circle
        const businessPeople = peopleByCircle.get('business') || [];
        businessPeople.slice(0, 2).forEach(bp => {
          const points = [personSphere.position.clone(), bp.position.clone()];
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeometry, interConnectionMaterial);
          scene.add(line);
        });

        // Connect to other friends (create a web within the circle)
        const friendsPeople = peopleByCircle.get('friends') || [];
        const currentIndex = friendsPeople.findIndex(f => f.person.id === person.id);
        if (currentIndex !== -1) {
          // Connect to next 2 friends in the circle
          const nextIndex = (currentIndex + 1) % friendsPeople.length;
          const next2Index = (currentIndex + 2) % friendsPeople.length;
          if (friendsPeople[nextIndex]) {
            const points = [personSphere.position.clone(), friendsPeople[nextIndex].position.clone()];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, interConnectionMaterial);
            scene.add(line);
          }
          if (friendsPeople[next2Index] && friendsPeople.length > 2) {
            const points = [personSphere.position.clone(), friendsPeople[next2Index].position.clone()];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, interConnectionMaterial);
            scene.add(line);
          }
        }
      }

      // Create some random interconnections between adjacent circles
      if (Math.random() > 0.6) {
        const circleIndex = CIRCLES_TO_USE.findIndex(c => c.id === person.circle);
        if (circleIndex > 0) {
          const prevCircle = CIRCLES_TO_USE[circleIndex - 1];
          const prevPeople = peopleByCircle.get(prevCircle.id) || [];
          if (prevPeople.length > 0) {
            const randomPerson = prevPeople[Math.floor(Math.random() * prevPeople.length)];
            const points = [personSphere.position.clone(), randomPerson.position.clone()];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, interConnectionMaterial);
            scene.add(line);
          }
        }
      }
    });
    spheresRef.current = spheres;

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse events
    const onMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY
      };
    };
    const onMouseMove = (event: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = event.clientX - previousMousePositionRef.current.x;
        const deltaY = event.clientY - previousMousePositionRef.current.y;
        scene.rotation.y += deltaX * 0.005;
        scene.rotation.x += deltaY * 0.005;
        previousMousePositionRef.current = {
          x: event.clientX,
          y: event.clientY
        };
      }
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };
    const onClick = async (event: MouseEvent) => {
      if (!containerRef.current || !camera || !scene) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      
      // Check for character model click first
      const allObjects = scene.children.filter(child => child instanceof THREE.Mesh || child.type === 'Group');
      const allIntersects = raycaster.intersectObjects(allObjects, true);
      
      if (allIntersects.length > 0) {
        const clickedObject = allIntersects[0].object;
        
        // Check if clicked on character model
        if (clickedObject.userData.isUserCharacter || clickedObject.parent?.userData.isUserCharacter) {
          // Zoom in to character and show profile popup
          isZoomingRef.current = true;
          const startCameraPosition = camera.position.clone();
          const targetZ = 3; // Closer zoom
          const targetCameraPosition = new THREE.Vector3(0, CAMERA_ANGLE_RATIO * targetZ, targetZ);
          
          let zoomProgress = 0;
          const zoomDuration = 60; // frames
          
          const zoomAnimation = () => {
            zoomProgress++;
            const t = zoomProgress / zoomDuration;
            const eased = 1 - Math.pow(1 - t, 3); // Ease out cubic
            
            camera.position.lerpVectors(startCameraPosition, targetCameraPosition, eased);
            camera.lookAt(0, 0, 0);
            
            if (zoomProgress < zoomDuration) {
              requestAnimationFrame(zoomAnimation);
            } else {
              isZoomingRef.current = false;
              // Show profile popup
              setSelectedPerson({
                id: 'user',
                name: 'You',
                circle: 'family',
                angle: 0,
                userId: 'current-user'
              });
              setShowMenu(true);
            }
          };
          
          zoomAnimation();
          return;
        }
      }
      
      const intersects = raycaster.intersectObjects(Array.from(spheres.values()));
      if (intersects.length > 0) {
        const clickedSphere = intersects[0].object as THREE.Mesh;
        const person = clickedSphere.userData.person as NetworkPerson;

        // Calculate 2D screen position of the clicked sphere
        const sphereWorldPos = clickedSphere.position.clone();
        const sphereScreenPos = sphereWorldPos.project(camera);
        
        const canvasRect = containerRef.current!.getBoundingClientRect();
        const screenX = ((sphereScreenPos.x + 1) / 2) * canvasRect.width + canvasRect.left;
        const screenY = ((-sphereScreenPos.y + 1) / 2) * canvasRect.height + canvasRect.top;
        
        setPopupPosition({ top: screenY, left: screenX });

        // Show popup with person details
        setSelectedPerson(person);
        setShowMenu(true);

        // Fetch real profile data for this person
        if (person.userId) {
          setIsLoadingBio(true);
          
          // Fetch profile from Supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, job_title, company, location, phone_number')
            .eq('user_id', person.userId)
            .single();

          if (profileData) {
            setSelectedPersonProfile(profileData);
            
            // Generate AI bio with real data
            fetch(`https://ahksxziueqkacyaqtgeu.supabase.co/functions/v1/generate-person-bio`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoa3N4eml1ZXFrYWN5YXF0Z2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMjAzMzUsImV4cCI6MjA2OTU5NjMzNX0.V3UV58ZhQPrsXanRKHZbbJdJq_smXvh4jtAC1cFK6tw`,
              },
              body: JSON.stringify({
                name: profileData.display_name || person.name,
                title: profileData.job_title,
                company: profileData.company,
                location: profileData.location,
                circle: person.circle,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                setPersonBio(data.bio || '');
                setIsLoadingBio(false);
              })
              .catch((err) => {
                console.error('Error generating bio:', err);
                setIsLoadingBio(false);
              });
          } else {
            setIsLoadingBio(false);
          }
        } else {
          setIsLoadingBio(false);
        }

        // Always zoom in while maintaining the top-down viewing angle
        isZoomingRef.current = true;
        const targetPosition = clickedSphere.position.clone();
        const startCameraPosition = camera.position.clone();
        const startSceneRotation = {
          x: scene.rotation.x,
          y: scene.rotation.y
        };

        // Calculate target camera position - zoom in but maintain the angle ratio
        const targetZ = 4;
        const targetCameraPosition = new THREE.Vector3(0, CAMERA_ANGLE_RATIO * targetZ, targetZ);

        // Calculate target scene rotation to center the sphere horizontally
        const targetSceneRotation = {
          x: startSceneRotation.x,
          // Keep the same tilt
          y: -Math.atan2(targetPosition.x, targetPosition.z) // Rotate horizontally to center
        };
        let progress = 0;
        const duration = 1000;
        const startTime = Date.now();
        const animateZoom = () => {
          const elapsed = Date.now() - startTime;
          progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          camera.position.lerpVectors(startCameraPosition, targetCameraPosition, eased);
          camera.lookAt(0, 0, 0);
          scene.rotation.x = startSceneRotation.x;
          scene.rotation.y = startSceneRotation.y + (targetSceneRotation.y - startSceneRotation.y) * eased;
          if (progress < 1) {
            requestAnimationFrame(animateZoom);
          } else {
            isZoomingRef.current = false;
          }
        };
        animateZoom();
        if (onPersonClick) {
          onPersonClick(person);
        }
      }
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      // Store current position for stable zooming - wider range for better control
      const currentZ = camera.position.z;
      const newZ = Math.max(3, Math.min(35, currentZ + event.deltaY * 0.015));
      
      camera.position.z = newZ;
      camera.position.y = newZ * CAMERA_ANGLE_RATIO;
      camera.lookAt(0, 0, 0);
    };

    // Touch events for pinch-to-zoom
    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const onTouchStart = (event: TouchEvent) => {
      event.preventDefault(); // Prevent scrolling
      if (event.touches.length === 1) {
        // Single finger drag
        isDraggingRef.current = true;
        previousMousePositionRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      } else if (event.touches.length === 2) {
        touchDistanceRef.current = getTouchDistance(event.touches);
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault(); // Prevent scrolling and default behaviors
      
      if (event.touches.length === 1 && isDraggingRef.current) {
        // Single finger rotation - more sensitive on mobile
        const deltaX = event.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = event.touches[0].clientY - previousMousePositionRef.current.y;
        scene.rotation.y += deltaX * 0.008;
        scene.rotation.x += deltaY * 0.008;
        previousMousePositionRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      } else if (event.touches.length === 2 && touchDistanceRef.current !== null) {
        // Pinch-to-zoom with stable positioning
        const currentDistance = getTouchDistance(event.touches);
        const delta = currentDistance - touchDistanceRef.current;

        // Calculate zoom center point in screen space
        const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
        const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        
        // Store the current camera position before zoom
        const beforeZ = camera.position.z;
        
        // Apply zoom with smoother scaling - wider range for better control
        const zoomFactor = delta * 0.025;
        const newZ = Math.max(3, Math.min(35, beforeZ - zoomFactor));
        
        camera.position.z = newZ;
        camera.position.y = newZ * CAMERA_ANGLE_RATIO;
        camera.lookAt(0, 0, 0);
        
        // Update stored distance for next iteration
        touchDistanceRef.current = currentDistance;
      }
    };
    const onTouchEnd = (event: TouchEvent) => {
      event.preventDefault(); // Prevent default behaviors
      
      // Reset dragging state
      if (event.touches.length < 1) {
        isDraggingRef.current = false;
      }
      
      // Reset zoom tracking
      if (event.touches.length < 2) {
        touchDistanceRef.current = null;
      }
      
      // Store final camera position to prevent reorientation
      if (event.touches.length === 0) {
        lastCameraPositionRef.current = camera.position.clone();
      }
    };
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.addEventListener('touchstart', onTouchStart, {
      passive: false
    });
    renderer.domElement.addEventListener('touchmove', onTouchMove, {
      passive: false
    });
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Gentle rotation when not dragging and not zooming
      if (!isDraggingRef.current && !isZoomingRef.current) {
        scene.rotation.y += 0.001;
      }


      // Pulsing glow effect for all spheres
      const time = Date.now() * 0.001;
      spheres.forEach(sphere => {
        const material = sphere.material as THREE.MeshPhongMaterial;
        const baseEmissive = sphere.userData.baseEmissive || 0.5;
        material.emissiveIntensity = baseEmissive + Math.sin(time * 2) * 0.3;
      });

      // Subtle motion for background dots
      backgroundDots.forEach(dot => {
        dot.position.x += dot.userData.velocity.x;
        dot.position.y += dot.userData.velocity.y;
        dot.position.z += dot.userData.velocity.z;
        const limit = 25;
        if (Math.abs(dot.position.x) > limit) dot.userData.velocity.x *= -1;
        if (Math.abs(dot.position.y) > limit) dot.userData.velocity.y *= -1;
        if (Math.abs(dot.position.z) > limit) dot.userData.velocity.z *= -1;
      });
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [people, onPersonClick, personHealth, showDemoNodes]);

  // Update node colors live when health scores change
  useEffect(() => {
    if (!personHealth || !spheresRef.current) return;
    spheresRef.current.forEach((sphere, id) => {
      const score = personHealth[id as string];
      if (score === undefined) return;
      const color = score >= 70 ? 0x22c55e : score >= 40 ? 0xeab308 : 0xef4444;
      const mat = sphere.material as THREE.MeshPhongMaterial;
      mat.color.setHex(color);
      mat.emissive.setHex(color);
      mat.needsUpdate = true;
    });
  }, [personHealth]);
  const handleViewProfile = () => {
    if (selectedPerson?.userId) {
      navigate(`/u/${selectedPerson.userId}`);
    } else {
      navigate('/profile');
    }
  };
  return <div className="relative w-full h-full">
      {/* View mode toggle */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <ToggleGroup type="single" value={showDemoNodes ? 'demo' : 'real'} onValueChange={v => {
        if (!v) return;
        setShowDemoNodes(v === 'demo');
      }} className="bg-background/80 backdrop-blur px-1 py-1 rounded-lg border border-border flex" aria-label="View mode">
          <ToggleGroupItem value="real" className="px-3 py-1 text-sm rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" aria-label="My circle">
            My circle
          </ToggleGroupItem>
          <ToggleGroupItem value="demo" className="px-3 py-1 text-sm rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" aria-label="Demo">
            Demo
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div ref={containerRef} className="w-full h-screen" />

      {/* Floating profile preview */}
      {showMenu && selectedPerson && (
        <FloatingProfilePreview
          name={selectedPersonProfile?.display_name || selectedPerson.name}
          title={selectedPersonProfile?.job_title || 'Member'}
          company={selectedPersonProfile?.company || 'Ping!'}
          location={selectedPersonProfile?.location || 'Unknown'}
          email={selectedPersonProfile?.email}
          phone={selectedPersonProfile?.phone_number}
          bio={personBio}
          isLoadingBio={isLoadingBio}
          position={popupPosition}
          onClose={() => {
            setShowMenu(false);
            setSelectedPerson(null);
            setPersonBio('');
            setSelectedPersonProfile(null);
          }}
          onViewProfile={handleViewProfile}
          onMessage={() => {
            console.log('Message clicked');
            // Add message functionality
          }}
        />
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground">
        <p>🖱️ Click & drag to rotate • Scroll to zoom • Click spheres for details</p>
      </div>
    </div>;
};
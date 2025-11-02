import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, X, User } from 'lucide-react';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances' | 'network' | 'extended';
  angle: number;
  userId?: string;
}

interface Network3DProps {
  people: NetworkPerson[];
  onPersonClick?: (person: NetworkPerson) => void;
}

const CIRCLES = [
  { id: 'family', label: 'Family', radius: 2, color: 0x4ade80 },
  { id: 'friends', label: 'Close friends', radius: 3.5, color: 0x4ade80 },
  { id: 'business', label: 'Business partners', radius: 5, color: 0x4ade80 },
  { id: 'acquaintances', label: 'Associates', radius: 6.5, color: 0x4ade80 },
  { id: 'network', label: 'Network', radius: 8, color: 0x4ade80 },
  { id: 'extended', label: 'Extended', radius: 9.5, color: 0x4ade80 },
];

export const Network3D = ({ people, onPersonClick }: Network3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const spheresRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const touchDistanceRef = useRef<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<NetworkPerson | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const isZoomingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;

    // Add demo people to outer circles if not already present
    const demoPeople: NetworkPerson[] = [];
    const hasNetwork = people.some(p => p.circle === 'network');
    const hasExtended = people.some(p => p.circle === 'extended');
    
    if (!hasNetwork) {
      // Add 8 demo dots to network circle
      for (let i = 0; i < 8; i++) {
        demoPeople.push({
          id: `demo-network-${i}`,
          name: `Network ${i + 1}`,
          circle: 'network',
          angle: (360 / 8) * i
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
          angle: (360 / 12) * i
        });
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
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    // Start further back on mobile to avoid cutoff
    const isMobile = window.innerWidth < 768;
    const initialZ = isMobile ? 15 : 10;
    camera.position.set(0, CAMERA_ANGLE_RATIO * initialZ, initialZ);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Center sphere (user) with glow
    const centerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: 0x4ade80,
      emissive: 0x4ade80,
      emissiveIntensity: 0.8,
    });
    const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(centerSphere);

    // Create horizontal concentric circles (torus rings) with labels
    CIRCLES.forEach((circle) => {
      const torusGeometry = new THREE.TorusGeometry(circle.radius, 0.02, 16, 100);
      const torusMaterial = new THREE.MeshBasicMaterial({
        color: circle.color,
        transparent: true,
        opacity: 0.4,
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.rotation.x = Math.PI / 2; // Make horizontal
      scene.add(torus);

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
        opacity: 0.35,
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      const r = Math.random() * 18 + 4; // distance from center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      dot.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        (Math.random() - 0.5) * 6, // near the ring plane but varied
        r * Math.sin(phi) * Math.sin(theta)
      );
      dot.userData.velocity = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      };
      scene.add(dot);
      backgroundDots.push(dot);
    }

    // Create people spheres and connections
    const spheres = new Map<string, THREE.Mesh>();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.3 });
    const interConnectionMaterial = new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.15 });

    const peopleByCircle = new Map<string, Array<{person: NetworkPerson, position: THREE.Vector3}>>();

    allPeople.forEach((person) => {
      const circle = CIRCLES.find((c) => c.id === person.circle);
      if (!circle) return;

      const radius = circle.radius;
      const angle = (person.angle * Math.PI) / 180;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = 0; // Keep on horizontal plane

      const position = new THREE.Vector3(x, y, z);

      // Create person sphere with pulsing glow
      const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x4ade80,
        emissive: 0x4ade80,
        emissiveIntensity: 0.5,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(x, y, z);
      sphere.userData = { person, baseEmissive: 0.5 };
      scene.add(sphere);
      spheres.set(person.id, sphere);

      // Track people by circle for interconnections
      if (!peopleByCircle.has(person.circle)) {
        peopleByCircle.set(person.circle, []);
      }
      peopleByCircle.get(person.circle)!.push({ person, position });

      // Create connection line to center
      const points = [];
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(x, y, z));
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    });

    // Create interconnections between people on different circles
    allPeople.forEach((person) => {
      const circle = CIRCLES.find((c) => c.id === person.circle);
      if (!circle) return;

      const personSphere = spheres.get(person.id);
      if (!personSphere) return;

      // For friends circle, create more interconnections
      if (person.circle === 'friends') {
        // Connect to some people in business circle
        const businessPeople = peopleByCircle.get('business') || [];
        businessPeople.slice(0, 2).forEach((bp) => {
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
        const circleIndex = CIRCLES.findIndex(c => c.id === person.circle);
        if (circleIndex > 0) {
          const prevCircle = CIRCLES[circleIndex - 1];
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
      previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = event.clientX - previousMousePositionRef.current.x;
        const deltaY = event.clientY - previousMousePositionRef.current.y;

        scene.rotation.y += deltaX * 0.005;
        scene.rotation.x += deltaY * 0.005;

        previousMousePositionRef.current = { x: event.clientX, y: event.clientY };
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onClick = (event: MouseEvent) => {
      if (!containerRef.current || !camera) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(spheres.values()));

      if (intersects.length > 0) {
        const clickedSphere = intersects[0].object as THREE.Mesh;
        const person = clickedSphere.userData.person as NetworkPerson;
        
        // Get the sphere's world position
        const targetWorldPos = new THREE.Vector3();
        clickedSphere.getWorldPosition(targetWorldPos);
        
        // Calculate camera target position to focus on the dot
        const startPosition = camera.position.clone();
        const distance = 3; // Distance from the dot
        const direction = targetWorldPos.clone().normalize();
        const targetPosition = targetWorldPos.clone().add(
          new THREE.Vector3(direction.x * distance, distance * 1.5, direction.z * distance)
        );
        
        // Animate camera zoom to the clicked sphere
        isZoomingRef.current = true;
        
        let animationProgress = 0;
        const animationDuration = 1000; // 1 second
        const startTime = Date.now();
        
        const animateZoom = () => {
          const elapsed = Date.now() - startTime;
          animationProgress = Math.min(elapsed / animationDuration, 1);
          
          // Smooth easing function
          const easeProgress = 1 - Math.pow(1 - animationProgress, 3);
          
          // Interpolate camera position
          camera.position.lerp(targetPosition, easeProgress * 0.1);
          camera.lookAt(targetWorldPos);
          
          if (animationProgress < 1) {
            requestAnimationFrame(animateZoom);
          } else {
            isZoomingRef.current = false;
            setSelectedPerson(person);
            setShowMenu(true);
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
      camera.position.z += event.deltaY * 0.01;
      camera.position.y = camera.position.z * CAMERA_ANGLE_RATIO;
      camera.position.z = Math.max(5, Math.min(20, camera.position.z));
      camera.position.y = Math.max(5 * CAMERA_ANGLE_RATIO, Math.min(20 * CAMERA_ANGLE_RATIO, camera.position.y));
    };

    // Touch events for pinch-to-zoom
    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        // Single finger drag
        isDraggingRef.current = true;
        previousMousePositionRef.current = { 
          x: event.touches[0].clientX, 
          y: event.touches[0].clientY 
        };
      } else if (event.touches.length === 2) {
        event.preventDefault();
        touchDistanceRef.current = getTouchDistance(event.touches);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && isDraggingRef.current) {
        // Single finger rotation
        const deltaX = event.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = event.touches[0].clientY - previousMousePositionRef.current.y;

        scene.rotation.y += deltaX * 0.005;
        scene.rotation.x += deltaY * 0.005;

        previousMousePositionRef.current = { 
          x: event.touches[0].clientX, 
          y: event.touches[0].clientY 
        };
      } else if (event.touches.length === 2 && touchDistanceRef.current !== null) {
        event.preventDefault();
        const currentDistance = getTouchDistance(event.touches);
        const delta = currentDistance - touchDistanceRef.current;
        
        camera.position.z -= delta * 0.02;
        camera.position.y = camera.position.z * CAMERA_ANGLE_RATIO;
        camera.position.z = Math.max(5, Math.min(20, camera.position.z));
        camera.position.y = Math.max(5 * CAMERA_ANGLE_RATIO, Math.min(20 * CAMERA_ANGLE_RATIO, camera.position.y));
        
        touchDistanceRef.current = currentDistance;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 1) {
        isDraggingRef.current = false;
      }
      if (event.touches.length < 2) {
        touchDistanceRef.current = null;
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
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
      spheres.forEach((sphere) => {
        const material = sphere.material as THREE.MeshPhongMaterial;
        const baseEmissive = sphere.userData.baseEmissive || 0.5;
        material.emissiveIntensity = baseEmissive + Math.sin(time * 2) * 0.3;
      });

      // Subtle motion for background dots
      backgroundDots.forEach((dot) => {
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
  }, [people, onPersonClick]);

  const handleViewProfile = () => {
    if (selectedPerson?.userId) {
      navigate(`/u/${selectedPerson.userId}`);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-screen" />

      {/* Side menu toggle */}
      {!showMenu && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-1/2 right-4 -translate-y-1/2 bg-card/90 backdrop-blur border border-border hover:bg-card"
          onClick={() => setShowMenu(true)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Side menu */}
      {showMenu && (
        <Card className="fixed top-1/2 right-4 -translate-y-1/2 w-64 bg-card/95 backdrop-blur border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Network Info</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedPerson ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{selectedPerson.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedPerson.circle.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleViewProfile}
                className="w-full"
                size="sm"
              >
                View Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Total connections: {people.length}</p>
              <div className="space-y-1 text-xs">
                {CIRCLES.map((circle) => {
                  const count = people.filter((p) => p.circle === circle.id).length;
                  return (
                    <div key={circle.id} className="flex justify-between">
                      <span>{circle.label}:</span>
                      <span className="text-primary">{count}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 pt-4 border-t border-border">
                Click on a green sphere to view details
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground">
        <p>🖱️ Click & drag to rotate • Scroll to zoom • Click spheres for details</p>
      </div>
    </div>
  );
};

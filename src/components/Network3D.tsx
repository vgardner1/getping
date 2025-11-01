import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, X, User } from 'lucide-react';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances';
  angle: number;
  userId?: string;
}

interface Network3DProps {
  people: NetworkPerson[];
  onPersonClick?: (person: NetworkPerson) => void;
}

const CIRCLES = [
  { id: 'family', label: 'Family', radius: 2, color: 0x4ade80 },
  { id: 'friends', label: 'Close Friends', radius: 3.5, color: 0x4ade80 },
  { id: 'business', label: 'Business Partners', radius: 5, color: 0x4ade80 },
  { id: 'acquaintances', label: 'Acquaintances', radius: 6.5, color: 0x4ade80 },
];

export const Network3D = ({ people, onPersonClick }: Network3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const spheresRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const [selectedPerson, setSelectedPerson] = useState<NetworkPerson | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 12;
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

    // Create horizontal concentric circles (torus rings)
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
    });

    // Create people spheres and connections
    const spheres = new Map<string, THREE.Mesh>();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.3 });

    people.forEach((person) => {
      const circle = CIRCLES.find((c) => c.id === person.circle);
      if (!circle) return;

      const radius = circle.radius;
      const angle = (person.angle * Math.PI) / 180;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = 0; // Keep on horizontal plane

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

      // Create connection line to center
      const points = [];
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(x, y, z));
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
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
        setSelectedPerson(person);
        setShowMenu(true);
        if (onPersonClick) {
          onPersonClick(person);
        }
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(5, Math.min(20, camera.position.z));
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('wheel', onWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Gentle rotation when not dragging
      if (!isDraggingRef.current) {
        scene.rotation.y += 0.001;
      }

      // Pulsing glow effect for all spheres
      const time = Date.now() * 0.001;
      spheres.forEach((sphere) => {
        const material = sphere.material as THREE.MeshPhongMaterial;
        const baseEmissive = sphere.userData.baseEmissive || 0.5;
        material.emissiveIntensity = baseEmissive + Math.sin(time * 2) * 0.3;
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
      <div ref={containerRef} className="w-full h-full min-h-[600px]" />

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

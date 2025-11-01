import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import worldMap from '@/assets/world-map.png';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, X, User } from 'lucide-react';

interface NetworkPerson {
  id: string;
  name: string;
  circle: 'family' | 'friends' | 'business' | 'acquaintances';
  lat: number;
  lng: number;
  userId?: string;
}

interface NetworkGlobeProps {
  people: NetworkPerson[];
  onPersonClick?: (person: NetworkPerson) => void;
}

export const NetworkGlobe = ({ people, onPersonClick }: NetworkGlobeProps) => {
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

    // Camera setup - positioned at 45-degree angle looking down
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 12); // High angle, looking down at 45 degrees
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create Earth globe - clean black sphere
    const globeRadius = 5;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x000000,
      shininess: 10,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Add subtle green edge glow using a slightly larger transparent sphere
    const glowGeometry = new THREE.SphereGeometry(globeRadius + 0.05, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.4 },
        p: { value: 4.5 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float c;
        uniform float p;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
          gl_FragColor = vec4(0.29, 0.87, 0.5, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    globe.add(glow);

    // World map overlay slightly above the globe surface (green tint, no black lines)
    const textureLoader = new THREE.TextureLoader();
    const mapTexture = textureLoader.load(worldMap);
    // @ts-ignore - colorSpace available in this three version
    (mapTexture as any).colorSpace = (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding;
    const mapMaterial = new THREE.MeshBasicMaterial({
      map: mapTexture,
      color: new THREE.Color(0x4ade80),
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mapSphere = new THREE.Mesh(new THREE.SphereGeometry(globeRadius + 0.06, 64, 64), mapMaterial);
    mapSphere.rotation.y = Math.PI; // align texture
    globe.add(mapSphere);

    // Create a group for all markers and connections that will rotate with the globe
    const globeGroup = new THREE.Group();
    globe.add(globeGroup);

    // Convert lat/lng to 3D position
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      return new THREE.Vector3(x, y, z);
    };

    // Create people markers and connections
    const spheres = new Map<string, THREE.Mesh>();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.8,
      linewidth: 2,
    });

    // Helper to generate great-circle arc points elevated above the surface
    const createArcGeometry = (
      start: THREE.Vector3,
      end: THREE.Vector3,
      segments = 72,
      heightFactor = 0.15
    ) => {
      const vStart = start.clone().normalize();
      const vEnd = end.clone().normalize();
      let axis = new THREE.Vector3().crossVectors(vStart, vEnd);
      const axisLen = axis.length();
      if (axisLen < 1e-6) axis = new THREE.Vector3(0, 1, 0);
      else axis.normalize();
      const angle = vStart.angleTo(vEnd);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const v = vStart.clone().applyAxisAngle(axis, angle * t).normalize();
        const altitude = Math.sin(Math.PI * t) * (globeRadius * heightFactor);
        const r = globeRadius + 0.2 + altitude; // closer to globe
        pts.push(v.multiplyScalar(r));
      }
      return new THREE.BufferGeometry().setFromPoints(pts);
    };

    people.forEach((person, index) => {
      // Position markers slightly above globe surface
      const position = latLngToVector3(person.lat, person.lng, globeRadius + 0.2);

      // Create person marker
      const markerGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const markerMaterial = new THREE.MeshPhongMaterial({
        color: 0x4ade80,
        emissive: 0x4ade80,
        emissiveIntensity: 1.2,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      marker.userData = { person, baseEmissive: 1.2 };
      marker.renderOrder = 2;
      globeGroup.add(marker);
      spheres.set(person.id, marker);

      // Connect to previous person (ensures all dots are connected)
      if (index > 0) {
        const prevPerson = people[index - 1];
        const prevPosition = latLngToVector3(prevPerson.lat, prevPerson.lng, globeRadius + 0.2);
        const lineGeometry = createArcGeometry(position, prevPosition, 80, 0.18);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.renderOrder = 3;
        globeGroup.add(line);
      }

      // Add 1-2 random connections for network density
      const numConnections = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numConnections && index > 2; i++) {
        const randomIndex = Math.floor(Math.random() * index);
        const randomPerson = people[randomIndex];
        const randomPosition = latLngToVector3(randomPerson.lat, randomPerson.lng, globeRadius + 0.2);
        const lineGeometry = createArcGeometry(position, randomPosition, 72, 0.15);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.renderOrder = 3;
        globeGroup.add(line);
      }
    });

    // Add floating background dots - more dots closer to the globe area
    const floatingDots: THREE.Mesh[] = [];
    for (let i = 0; i < 150; i++) {
      const dotGeometry = new THREE.SphereGeometry(0.04, 8, 8);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.4,
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      
      // Distribute dots both close to globe and in far background
      const distance = i < 100 ? (Math.random() * 8 + 6) : (Math.random() * 20 + 10);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      dot.position.set(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.sin(phi) * Math.sin(theta),
        distance * Math.cos(phi)
      );
      dot.userData.velocity = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      };
      scene.add(dot);
      floatingDots.push(dot);
    }

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

        // Rotate the entire globe (markers and connections will rotate with it)
        globe.rotation.y += deltaX * 0.005;
        globe.rotation.x += deltaY * 0.005;

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
      camera.position.z = Math.max(8, Math.min(25, camera.position.z));
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
        globe.rotation.y += 0.002; // Rotate globe and everything on it
      }

      // Pulsing glow effect for markers
      const time = Date.now() * 0.001;
      spheres.forEach((sphere) => {
        const material = sphere.material as THREE.MeshPhongMaterial;
        const baseEmissive = sphere.userData.baseEmissive || 0.8;
        material.emissiveIntensity = baseEmissive + Math.sin(time * 2 + sphere.position.x) * 0.2;
      });

      // Animate floating dots
      floatingDots.forEach((dot) => {
        dot.position.x += dot.userData.velocity.x;
        dot.position.y += dot.userData.velocity.y;
        dot.position.z += dot.userData.velocity.z;

        // Wrap around with larger boundaries
        if (Math.abs(dot.position.x) > 25) dot.userData.velocity.x *= -1;
        if (Math.abs(dot.position.y) > 25) dot.userData.velocity.y *= -1;
        if (Math.abs(dot.position.z) > 25) dot.userData.velocity.z *= -1;
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
              <p className="mt-4 pt-4 border-t border-border">
                Click on a green marker to view details
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Instructions */}
      <div className="absolute bottom-20 left-4 bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground">
        <p>🌍 Click & drag to rotate • Scroll to zoom • Click markers for details</p>
      </div>
    </div>
  );
};

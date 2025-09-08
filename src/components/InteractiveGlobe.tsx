import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import PingerOverlay from "./PingerOverlay";
import { useNavigate } from "react-router-dom";

interface InteractiveGlobeProps {
  className?: string;
  selectedPerson?: {
    name: string;
    lat: number;
    lng: number;
    role?: string;
    city?: string;
    bio?: string;
    avatarUrl?: string;
  } | null;
}

// Base radius for the globe and related calculations - optimized for iPhone
const BASE_RADIUS = 1.6; // Balanced for mobile interaction and visibility

const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({ className, selectedPerson }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPinger, setSelectedPinger] = useState<{
    name: string;
    city?: string;
    lat: number;
    lng: number;
    role?: string;
    bio?: string;
    avatarUrl?: string;
  } | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [popoverPlacement, setPopoverPlacement] = useState<"top" | "right" | "left">("top");
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  const navigate = useNavigate();


  // Sample pinger data with coordinates
  const pingers = [
    { name: "Alex Chen", lat: 37.7749, lng: -122.4194, city: "San Francisco", role: "Product Designer", bio: "Designing delightful human-centered products.", avatarUrl: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png" },
    { name: "Maya Patel", lat: 42.3601, lng: -71.0589, city: "Boston", role: "Data Scientist", bio: "Turning data into decisions with empathy.", avatarUrl: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png" },
    { name: "Sam Rivera", lat: 40.7128, lng: -74.006, city: "New York", role: "Founder", bio: "Building communities around impactful tech.", avatarUrl: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png" },
    { name: "Jordan Kim", lat: 34.0522, lng: -118.2437, city: "Los Angeles", role: "Engineer", bio: "Scalable systems and accessible UX.", avatarUrl: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png" },
    { name: "Taylor Swift", lat: 51.5074, lng: -0.1278, city: "London", role: "Creative Director", bio: "Storytelling through sound and visuals.", avatarUrl: "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png" },
    { name: "Sarah Johnson", lat: 35.6762, lng: 139.6503, city: "Tokyo", role: "Researcher", bio: "Human-computer interaction and future of work.", avatarUrl: "/lovable-uploads/9ee1d542-a2fe-4a76-8fef-8094c127a879.png" },
    { name: "Emily Davis", lat: 48.8566, lng: 2.3522, city: "Paris", role: "Product Manager", bio: "Aligning teams to ship with purpose.", avatarUrl: "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png" },
    { name: "David Park", lat: 52.52, lng: 13.405, city: "Berlin", role: "Community Lead", bio: "Creating spaces where builders thrive.", avatarUrl: "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png" },
    { name: "Lisa Wang", lat: 39.9042, lng: 116.4074, city: "Beijing", role: "Marketing", bio: "Bridging brands and communities.", avatarUrl: "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png" },
    { name: "Tom Wilson", lat: -33.8688, lng: 151.2093, city: "Sydney", role: "Designer", bio: "Sustainable design for everyday life.", avatarUrl: "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png" },
  ];

  // Add 20 more random dots with synthetic profiles
  const firstNames = ["Avery","Riley","Kai","Quinn","Rowan","Sage","Logan","Parker","Reese","Skye"];
  const lastNames = ["Johnson","Lee","Garcia","Martinez","Nguyen","Patel","Kim","Brown","Davis","Wilson"];
  const cityList = ["Toronto","Austin","Denver","Seattle","Chicago","Barcelona","Seoul","Cape Town","Singapore","Dubai"];
  const roleList = ["Engineer","Product Manager","Founder","Designer","Researcher","Community Lead","Data Scientist","Marketer","Ops","Strategist"];
  const avatarList = [
    "/lovable-uploads/048c22a0-4b6c-4593-89ce-49d2f78449c2.png",
    "/lovable-uploads/0b122861-6f47-4ba6-85a3-8a6db847c0f6.png",
    "/lovable-uploads/1754b949-8d55-41e0-ae70-436edf9b7018.png",
    "/lovable-uploads/82b70768-a7f7-433b-aa7c-250bf6b72151.png",
    "/lovable-uploads/9330d76c-abaf-4b58-a5d8-ef1efd49f1ba.png",
    "/lovable-uploads/9ee1d542-a2fe-4a76-8fef-8094c127a879.png",
    "/lovable-uploads/5cfc116f-36f7-4ba8-9859-4fdb89227406.png",
  ];
  const extraPingers = Array.from({ length: 20 }, (_, i) => {
    const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;
    const city = cityList[(i * 2) % cityList.length];
    const role = roleList[(i * 5) % roleList.length];
    const avatarUrl = avatarList[i % avatarList.length];
    const lat = Math.random() * 160 - 80;
    const lng = Math.random() * 360 - 180;
    const bio = `${role} interested in meaningful connections and collaboration.`;
    return { name, city, lat, lng, role, bio, avatarUrl };
  });


  const allPingers = [...pingers, ...extraPingers];

  // Convert lat/lng to 3D coordinates on sphere
const latLngToVector3 = (lat: number, lng: number, radius = BASE_RADIUS) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent to blend with page

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5.5); // Positioned for optimal mobile viewing

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    setContainerSize({ width: container.clientWidth, height: container.clientHeight });

    // Main globe group (contains globe, wireframe, and pingers)
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

// Globe creation
const globeGeometry = new THREE.SphereGeometry(BASE_RADIUS, 64, 64);
const globeMaterial = new THREE.MeshPhongMaterial({
  color: 0x1a1a1a,
  transparent: true,
  opacity: 0.8,
  wireframe: false,
});
const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
mainGroup.add(globeMesh);

// (Wireframe border removed)

    // Pinger group
    const pingerGroup = new THREE.Group();
    mainGroup.add(pingerGroup);
    const pingerMeshes: THREE.Mesh[] = [];

    // Create pingers and pulses
    const pingerPositions: THREE.Vector3[] = [];
allPingers.forEach((pinger, index) => {
  const position = latLngToVector3(pinger.lat, pinger.lng);
  pingerPositions.push(position);

  const pingerGeometry = new THREE.SphereGeometry(0.08, 16, 16); // Larger for easier mobile touch
  const pingerMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.9,
  });
  const pingerMesh = new THREE.Mesh(pingerGeometry, pingerMaterial);
  pingerMesh.position.copy(position);
  (pingerMesh as any).userData = pinger;
  pingerGroup.add(pingerMesh);
  pingerMeshes.push(pingerMesh);

  const pulseGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.3,
  });
  const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
  pulseMesh.position.copy(position);
  pingerGroup.add(pulseMesh);

  const animatePulse = () => {
    const time = Date.now() * 0.005;
    const scale = 1 + Math.sin(time + index) * 0.3;
    pulseMesh.scale.setScalar(scale);
    pulseMaterial.opacity = 0.2 + Math.sin(time + index) * 0.1;
  };
  // attach per-frame animator
  (pulseMesh.userData as any).animate = animatePulse;
});

    // Connections
    const connectionLines: { line: THREE.Line; material: THREE.LineBasicMaterial }[] = [];
    for (let i = 0; i < pingerPositions.length; i++) {
      for (let j = i + 1; j < pingerPositions.length; j++) {
        const start = pingerPositions[i];
        const end = pingerPositions[j];

        const distance = start.distanceTo(end);
        const numPoints = Math.max(20, Math.floor(distance * 30));
        const points: THREE.Vector3[] = [];
        for (let k = 0; k <= numPoints; k++) {
          const t = k / numPoints;
          const angle = start.angleTo(end);
          const sinAngle = Math.sin(angle);
          if (sinAngle === 0) {
            points.push(start.clone());
            continue;
          }
          const a = Math.sin((1 - t) * angle) / sinAngle;
          const b = Math.sin(t * angle) / sinAngle;
          const point = new THREE.Vector3()
            .addScaledVector(start, a)
            .addScaledVector(end, b);
          const height = Math.sin(t * Math.PI) * 0.2; // lift arc
          point.normalize().multiplyScalar(BASE_RADIUS + height);
          points.push(point);
        }
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.15,
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        pingerGroup.add(line);
        connectionLines.push({ line, material: lineMaterial });
      }
    }

    const animateConnections = () => {
      const time = Date.now() * 0.003;
      connectionLines.forEach((connection, index) => {
        const opacity = 0.15 + Math.sin(time + index * 0.5) * 0.1;
        connection.material.opacity = Math.max(0.05, opacity);
      });
    };

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0x00ff88 as unknown as number, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

    // Interaction state
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    const damping = 0.95;
    
    // Touch tracking for tap detection
    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };
    let totalTouchMovement = 0;

    // Raycaster for picking pingers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Helper function to handle pinger selection
    const handlePingerClick = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(ndcX, ndcY);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pingerMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const pinger = (hit as any).userData as {
          name: string; city?: string; lat: number; lng: number; role?: string; bio?: string; avatarUrl?: string;
        };
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;
        // If click is near the top, position popover to the side to avoid header overlap
        let placement: "top" | "right" | "left" = "top";
        if (localY < 170) {
          placement = localX > rect.width * 0.66 ? "left" : "right";
        }
        setSelectedPinger(pinger);
        setPopoverPos({ x: localX, y: localY });
        setPopoverPlacement(placement);
        return true;
      }
      return false;
    };

    const onClick = (event: MouseEvent) => {
      handlePingerClick(event.clientX, event.clientY);
    };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      setSelectedPinger(null);
      const rect = container.getBoundingClientRect();
      previousMousePosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      rotationVelocity = { x: 0, y: 0 };
      container.style.cursor = "grabbing";
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mousePosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (isDragging) {
        const deltaMove = { x: mousePosition.x - previousMousePosition.x, y: mousePosition.y - previousMousePosition.y };
        const rotationSpeed = 0.01;
        const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(deltaMove.y * rotationSpeed, deltaMove.x * rotationSpeed, 0, "XYZ")
        );
        mainGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, mainGroup.quaternion);
        rotationVelocity.x = deltaMove.x * rotationSpeed;
        rotationVelocity.y = deltaMove.y * rotationSpeed;
      }
      previousMousePosition = mousePosition;
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.cursor = "grab";
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        setSelectedPinger(null);
        const rect = container.getBoundingClientRect();
        const touch = event.touches[0];
        touchStartTime = Date.now();
        touchStartPos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        totalTouchMovement = 0;
        previousMousePosition = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        isDragging = false; // Don't start dragging immediately
        rotationVelocity = { x: 0, y: 0 };
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const rect = container.getBoundingClientRect();
        const touch = event.touches[0];
        const touchPosition = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        
        // Track total movement for tap detection
        const movementX = Math.abs(touchPosition.x - touchStartPos.x);
        const movementY = Math.abs(touchPosition.y - touchStartPos.y);
        totalTouchMovement = Math.max(totalTouchMovement, movementX + movementY);
        
        // Start dragging if movement exceeds threshold
        if (totalTouchMovement > 10 && !isDragging) {
          isDragging = true;
        }
        
        if (isDragging) {
          event.preventDefault();
          const deltaMove = { x: touchPosition.x - previousMousePosition.x, y: touchPosition.y - previousMousePosition.y };
          const rotationSpeed = 0.01;
          const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(deltaMove.y * rotationSpeed, deltaMove.x * rotationSpeed, 0, "XYZ")
          );
          mainGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, mainGroup.quaternion);
          rotationVelocity.x = deltaMove.x * rotationSpeed;
          rotationVelocity.y = deltaMove.y * rotationSpeed;
        }
        
        previousMousePosition = touchPosition;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime;
      
      // If it was a short touch with minimal movement, treat as tap
      if (!isDragging && touchDuration < 300 && totalTouchMovement < 10) {
        const touch = event.changedTouches[0];
        handlePingerClick(touch.clientX, touch.clientY);
      }
      
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mouseleave", onMouseUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);
    container.addEventListener("click", onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isDragging) {
        if (Math.abs(rotationVelocity.x) > 0.001 || Math.abs(rotationVelocity.y) > 0.001) {
          const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(rotationVelocity.y, rotationVelocity.x, 0, "XYZ")
          );
          mainGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, mainGroup.quaternion);
          rotationVelocity.x *= damping;
          rotationVelocity.y *= damping;
        } else {
          mainGroup.rotation.y += 0.002;
        }
      }

      pingerGroup.children.forEach((child) => {
        const fn = (child.userData as any).animate as (() => void) | undefined;
        if (fn) fn();
      });

      animateConnections();
      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    const handleResize = () => {
      if (!rendererRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      setContainerSize({ width, height });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mouseleave", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("click", onClick);
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Handle selectedPerson prop changes for search integration
  useEffect(() => {
    if (selectedPerson && rendererRef.current) {
      // Find the pinger that matches the selected person
      const matchingPinger = allPingers.find(p => 
        p.name === selectedPerson.name || 
        (p.lat === selectedPerson.lat && p.lng === selectedPerson.lng)
      );
      
      if (matchingPinger) {
        // Auto-select the pinger to show overlay
        setSelectedPinger({
          name: matchingPinger.name,
          lat: matchingPinger.lat,
          lng: matchingPinger.lng,
          city: matchingPinger.city,
          role: matchingPinger.role,
          bio: matchingPinger.bio,
          avatarUrl: matchingPinger.avatarUrl
        });
        
        // Set popover position to center of container
        const container = rendererRef.current.domElement;
        const rect = container.getBoundingClientRect();
        setPopoverPos({ 
          x: rect.width / 2, 
          y: rect.height / 2 
        });
        setPopoverPlacement("top");
      }
    }
  }, [selectedPerson]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div ref={mountRef} className="w-full h-full cursor-grab" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-primary text-sm">Loading globe…</div>
        </div>
      )}
      {selectedPinger && popoverPos && (
        <PingerOverlay
          pinger={selectedPinger}
          position={popoverPos}
          placement={popoverPlacement}
          containerSize={containerSize ?? undefined}
          onClose={() => setSelectedPinger(null)}
          onPing={() => {
            if (!selectedPinger) return;
            const slug = selectedPinger.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            toast({
              title: "Opening chat…",
              description: `Generating questions for ${selectedPinger.name}`,
            });
            setSelectedPinger(null);
            navigate(`/chat/thread/${slug}`, {
              state: {
                name: selectedPinger.name,
                avatar: selectedPinger.avatarUrl,
                role: selectedPinger.role,
                city: selectedPinger.city,
                bio: selectedPinger.bio,
              },
            });
          }}
        />
      )}
    </div>
  );
};

export default InteractiveGlobe;

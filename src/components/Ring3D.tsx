import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Ring3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x10b981, 0.8, 100);
    pointLight.position.set(-1, -1, 2);
    scene.add(pointLight);

    // Create ring geometry - make it bigger
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.15, 8, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x1a1a1a,
      shininess: 100,
      specular: 0x10b981
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ringRef.current = ring;
    scene.add(ring);

    // Add a metallic chip on the ring
    const chipGeometry = new THREE.BoxGeometry(0.4, 0.07, 0.15);
    const chipMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x10b981,
      shininess: 150,
      specular: 0x34d399
    });
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.position.set(1.5, 0, 0);
    ring.add(chip);

    // Mouse interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let userInteracting = false;

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      userInteracting = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging && ring) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };

        ring.rotation.y += deltaMove.x * 0.01;
        ring.rotation.x += deltaMove.y * 0.01;

        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => {
        userInteracting = false;
      }, 1000);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (ring && !userInteracting) {
        ring.rotation.y += 0.005;
        ring.rotation.x += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div 
        ref={mountRef} 
        className="w-[400px] h-[400px] cursor-grab active:cursor-grabbing"
        style={{ userSelect: 'none' }}
      />
    </div>
  );
};

export default Ring3D;
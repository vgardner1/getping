import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Model3DViewerProps {
  modelUrl?: string;
  autoRotate?: boolean;
  backgroundColor?: number;
  height?: string;
  width?: string;
  scale?: number;
  onRingClick?: () => void;
}

const Model3DViewer = ({ 
  modelUrl,
  autoRotate = true,
  backgroundColor = 0x0a0a0a,
  height = '200px',
  width = '200px',
  scale = 1,
  onRingClick
}: Model3DViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!modelUrl) {
      setIsLoading(false);
      return;
    }

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(backgroundColor, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    camera.position.z = 5;

    let model: THREE.Group | null = null;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        model = gltf.scene;
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const modelScale = (2 / maxDim) * scale;
        
        model.scale.setScalar(modelScale);
        model.position.sub(center.multiplyScalar(modelScale));
        
        scene.add(model);
        setIsLoading(false);
      },
      (progress) => {
        // Loading progress
        console.log((progress.loaded / progress.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading model:', error);
        setError('Failed to load 3D model');
        setIsLoading(false);
      }
    );

    // Mouse/Touch controls
    const handleStart = (clientX: number, clientY: number) => {
      isDragging = true;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !model) return;

      const deltaMove = {
        x: clientX - previousMousePosition.x,
        y: clientY - previousMousePosition.y
      };

      model.rotation.y += deltaMove.x * 0.01;
      model.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handleEnd = () => {
      isDragging = false;
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    const onClick = () => {
      if (onRingClick) {
        onRingClick();
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart);
    container.addEventListener('touchmove', onTouchMove);
    container.addEventListener('touchend', onTouchEnd);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (model && autoRotate && !isDragging) {
        model.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (model) {
        scene.remove(model);
      }
    };
  }, [modelUrl, autoRotate, backgroundColor, scale, onRingClick]);

  if (!modelUrl) {
    return (
      <div 
        ref={containerRef}
        style={{ width, height }}
        className="rounded-lg flex items-center justify-center text-muted-foreground text-sm"
      >
        No model loaded
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ width, height }}
      className="rounded-lg relative"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading 3D model...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Model3DViewer;

import { useEffect, useRef } from "react";

const CESIUM_VER = "1.115";
const CESIUM_JS  = `https://unpkg.com/cesium@${CESIUM_VER}/Build/Cesium/Cesium.js`;
const CESIUM_CSS = `https://unpkg.com/cesium@${CESIUM_VER}/Build/Cesium/Widgets/widgets.css`;

function loadOnce(tag: string, attrs: Record<string, string>) {
  return new Promise((resolve, reject) => {
    // check if already loaded
    if (tag === "script" && document.querySelector(`script[src="${attrs.src}"]`)) return resolve(undefined);
    if (tag === "link"   && document.querySelector(`link[href="${attrs.href}"]`)) return resolve(undefined);

    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.onload = () => resolve(undefined);
    el.onerror = (e) => reject(e);
    document.head.appendChild(el);
  });
}

interface GlobePin {
  lng: number;
  lat: number;
  height?: number;
  label?: string;
  id?: string;
  onClick?: () => void;
}

interface Globe3DProps {
  // start zoomed out like Apple Earth, change if you want to begin over Boston
  start?: { lng: number; lat: number; height: number };
  showPins?: GlobePin[];
  className?: string;
  onPinClick?: (pin: GlobePin) => void;
  apiKey?: string; // TEMP: pass your Google Map Tiles API key here if you can't use env/secrets yet
}

export default function Globe3D({
  start = { lng: -71.0589, lat: 42.3601, height: 20000000 },
  showPins = [],
  className = "",
  onPinClick,
  apiKey
}: Globe3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    let destroyed = false;

    async function boot() {
      try {
        // 1) load Cesium CSS/JS dynamically
        await loadOnce("link", { rel: "stylesheet", href: CESIUM_CSS });
        await loadOnce("script", { src: CESIUM_JS });

        const Cesium = (window as any).Cesium;
        if (!Cesium || !hostRef.current) return;

        // 2) Figure out API key source
        const KEY =
          apiKey ||
          (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
          (window as any).GOOGLE_MAPS_API_KEY;

        if (!KEY) {
          console.error("Google Map Tiles API key missing. Pass apiKey prop or set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
          return;
        }

        // 3) performance for Google 3D tiles
        Cesium.RequestScheduler.requestsByServer["tile.googleapis.com:443"] = 18;

        // 4) create viewer (no default imagery/globe)
        const viewer = new Cesium.Viewer(hostRef.current, {
          imageryProvider: false,
          globe: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          requestRenderMode: true
        });
        viewerRef.current = viewer;

        // 5) add Google Photorealistic 3D Tiles
        const tileset = viewer.scene.primitives.add(
          new Cesium.Cesium3DTileset({
            url: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${KEY}`,
            showCreditsOnScreen: true
          })
        );

        await tileset.readyPromise;

        if (destroyed) return;

        // 6) fly camera
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(start.lng, start.lat, start.height),
          duration: 1.2
        });

        // 7) optional pins
        if (showPins?.length) {
          showPins.forEach((p, index) => {
            const entity = viewer.entities.add({
              id: p.id || `pin-${index}`,
              position: Cesium.Cartesian3.fromDegrees(p.lng, p.lat, p.height || 20),
              point: { 
                pixelSize: 12,
                color: Cesium.Color.fromCssColorString('#22c55e'),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
              },
              label: p.label
                ? {
                    text: p.label,
                    font: "14px Inter, system-ui, sans-serif",
                    pixelOffset: new Cesium.Cartesian2(0, -25),
                    showBackground: true,
                    backgroundColor: Cesium.Color.fromCssColorString('rgba(0, 0, 0, 0.7)'),
                    fillColor: Cesium.Color.WHITE,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER
                  }
                : undefined
            });

            // Store pin data for click handling
            (entity as any).pinData = p;
          });

          // Handle pin clicks
          viewer.cesiumWidget.screenSpaceEventHandler.setInputAction((event: any) => {
            const pickedObject = viewer.scene.pick(event.position);
            if (pickedObject && pickedObject.id && (pickedObject.id as any).pinData) {
              const pin = (pickedObject.id as any).pinData;
              if (pin.onClick) {
                pin.onClick();
              } else if (onPinClick) {
                onPinClick(pin);
              }
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      } catch (error) {
        console.error("Error initializing Globe3D:", error);
      }
    }

    boot();

    return () => {
      destroyed = true;
      try { 
        viewerRef.current?.destroy(); 
      } catch(_) {
        // Ignore cleanup errors
      }
    };
  }, [start.lng, start.lat, start.height, showPins, onPinClick, apiKey]);

  return (
    <div
      ref={hostRef}
      className={`w-full ${className}`}
      style={{ height: "80vh", borderRadius: "16px", overflow: "hidden" }}
    />
  );
}

// Expose a helper to fly camera from outside (e.g., search)
export function flyTo(viewer: any, lng: number, lat: number, height = 15000, duration = 1.2) {
  if (!viewer || !(window as any).Cesium) return;
  const Cesium = (window as any).Cesium;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
    duration
  });
}

export { type GlobePin };
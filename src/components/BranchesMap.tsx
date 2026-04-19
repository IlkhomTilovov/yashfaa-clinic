import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Phone } from "lucide-react";
import { CLINIC_BRANCHES } from "@/lib/contact";
import { useLang } from "@/hooks/useLang";

export function BranchesMap() {
  const lang = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      // @ts-ignore
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current || mapRef.current) return;

      const center: [number, number] = [
        (CLINIC_BRANCHES[0].lat + CLINIC_BRANCHES[1].lat) / 2,
        (CLINIC_BRANCHES[0].lng + CLINIC_BRANCHES[1].lng) / 2,
      ];

      const map = L.map(containerRef.current, {
        center,
        zoom: 11,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="background:hsl(var(--primary));width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;background:white;border-radius:50%;transform:rotate(45deg);"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      CLINIC_BRANCHES.forEach((b, idx) => {
        const marker = L.marker([b.lat, b.lng], { icon }).addTo(map);
        const isRu = lang === "ru";
        marker.bindPopup(
          `<div style="font-family:inherit;min-width:180px;"><strong style="font-size:14px;">${isRu ? b.name_ru : b.name}</strong><br/><span style="color:#666;font-size:12px;">${isRu ? b.address_ru : b.address}</span><br/><a href="tel:${b.phoneTel}" style="color:hsl(var(--primary));font-size:12px;font-weight:600;">${b.phone}</a></div>`
        );
        marker.on("click", () => setActiveIdx(idx));
        markersRef.current.push(marker);
      });

      mapRef.current = map;
      setMapReady(true);
    };

    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, [lang]);

  const focusBranch = (idx: number) => {
    setActiveIdx(idx);
    if (mapRef.current && markersRef.current[idx]) {
      const b = CLINIC_BRANCHES[idx];
      mapRef.current.flyTo([b.lat, b.lng], 15, { duration: 1 });
      markersRef.current[idx].openPopup();
    }
  };

  const isRu = lang === "ru";

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        {CLINIC_BRANCHES.map((b, idx) => (
          <button
            key={idx}
            onClick={() => focusBranch(idx)}
            className={`w-full rounded-xl border p-4 text-left transition-all ${
              activeIdx === idx
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activeIdx === idx ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold">{isRu ? b.name_ru : b.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{isRu ? b.address_ru : b.address}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Phone className="h-3 w-3" /> {b.phone}
                </div>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <Navigation className="h-3 w-3" /> {isRu ? "Маршрут" : "Yo'l ko'rsatish"}
            </a>
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border bg-muted">
        <div ref={containerRef} className="h-[400px] w-full md:h-[450px]" />
        {!mapReady && (
          <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground md:h-[450px]">
            {isRu ? "Загрузка карты..." : "Xarita yuklanmoqda..."}
          </div>
        )}
      </div>
    </div>
  );
}

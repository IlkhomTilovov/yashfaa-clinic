import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Phone } from "lucide-react";
import { CLINIC_BRANCHES } from "@/lib/contact";
import { useLang } from "@/hooks/useLang";

declare global {
  interface Window {
    ymaps?: any;
  }
}

const YMAPS_SRC = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";

function loadYandexMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject("no window");
  if (window.ymaps) return Promise.resolve(window.ymaps);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${YMAPS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => window.ymaps?.ready(() => resolve(window.ymaps)));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = YMAPS_SRC;
    script.async = true;
    script.onload = () => window.ymaps?.ready(() => resolve(window.ymaps));
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function BranchesMap() {
  const lang = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const placemarksRef = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const ymaps = await loadYandexMaps();
        if (cancelled || !containerRef.current || mapRef.current) return;

        const center: [number, number] = [
          (CLINIC_BRANCHES[0].lat + CLINIC_BRANCHES[1].lat) / 2,
          (CLINIC_BRANCHES[0].lng + CLINIC_BRANCHES[1].lng) / 2,
        ];

        const map = new ymaps.Map(containerRef.current, {
          center,
          zoom: 12,
          controls: ["zoomControl", "fullscreenControl", "typeSelector"],
        });

        const isRu = lang === "ru";

        CLINIC_BRANCHES.forEach((b, idx) => {
          const placemark = new ymaps.Placemark(
            [b.lat, b.lng],
            {
              hintContent: isRu ? b.name_ru : b.name,
              balloonContentHeader: `<strong>${isRu ? b.name_ru : b.name}</strong>`,
              balloonContentBody: `<div style="font-size:13px;color:#333;">${isRu ? b.address_ru : b.address}</div>`,
              balloonContentFooter: `<a href="tel:${b.phoneTel}" style="color:#0066cc;font-weight:600;">${b.phone}</a>`,
            },
            {
              preset: idx === 0 ? "islands#blueMedicalIcon" : "islands#redMedicalIcon",
            }
          );
          placemark.events.add("click", () => setActiveIdx(idx));
          map.geoObjects.add(placemark);
          placemarksRef.current.push(placemark);
        });

        mapRef.current = map;
        setMapReady(true);
      } catch (err) {
        console.error("Yandex Maps load failed:", err);
      }
    };

    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
        placemarksRef.current = [];
      }
    };
  }, [lang]);

  const focusBranch = (idx: number) => {
    setActiveIdx(idx);
    if (mapRef.current && placemarksRef.current[idx]) {
      const b = CLINIC_BRANCHES[idx];
      mapRef.current.setCenter([b.lat, b.lng], 16, { duration: 600 });
      placemarksRef.current[idx].balloon.open();
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
              href={`https://yandex.com/maps/?rtext=~${b.lat},${b.lng}&rtt=auto`}
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
      <div className="relative overflow-hidden rounded-xl border bg-muted">
        <div ref={containerRef} className="h-[400px] w-full md:h-[450px]" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {isRu ? "Загрузка карты..." : "Xarita yuklanmoqda..."}
          </div>
        )}
      </div>
    </div>
  );
}

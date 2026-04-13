import { icons, type LucideProps } from "lucide-react";
import { FolderOpen } from "lucide-react";

// Convert kebab-case icon name to PascalCase to match lucide-react exports
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

interface DynamicIconProps extends Omit<LucideProps, "name"> {
  name: string | null | undefined;
  fallback?: keyof typeof icons;
}

/**
 * Renders a Lucide icon dynamically by its kebab-case name (e.g. "flask-conical", "heart", "microscope").
 * Falls back to FolderOpen if the icon is not found.
 */
export function DynamicIcon({ name, fallback, ...props }: DynamicIconProps) {
  if (!name) {
    const FallbackIcon = fallback ? icons[fallback] : FolderOpen;
    return <FallbackIcon {...props} />;
  }

  // Try direct PascalCase lookup
  const pascalName = toPascalCase(name) as keyof typeof icons;
  const IconComponent = icons[pascalName];

  if (IconComponent) {
    return <IconComponent {...props} />;
  }

  // Try the name as-is (already PascalCase)
  const directIcon = icons[name as keyof typeof icons];
  if (directIcon) {
    const DirectIcon = directIcon;
    return <DirectIcon {...props} />;
  }

  // Fallback
  const FallbackIcon = fallback ? icons[fallback] : FolderOpen;
  return <FallbackIcon {...props} />;
}

/**
 * Curated list of popular icons for medical/clinic context.
 * Each entry is { name: kebab-case key, label: display name }.
 */
export const POPULAR_ICONS = [
  { name: "heart", label: "Yurak" },
  { name: "heart-pulse", label: "Yurak urishi" },
  { name: "stethoscope", label: "Stetoskop" },
  { name: "flask-conical", label: "Laboratoriya" },
  { name: "microscope", label: "Mikroskop" },
  { name: "syringe", label: "Shprits" },
  { name: "pill", label: "Tabletka" },
  { name: "thermometer", label: "Termometr" },
  { name: "baby", label: "Bolalar" },
  { name: "brain", label: "Miya" },
  { name: "eye", label: "Ko'z" },
  { name: "ear", label: "Quloq" },
  { name: "bone", label: "Suyak" },
  { name: "activity", label: "Faoliyat" },
  { name: "sparkles", label: "Kosmetologiya" },
  { name: "scan", label: "Skanerlash" },
  { name: "radiation", label: "Radiologiya" },
  { name: "clipboard-list", label: "Ro'yxat" },
  { name: "test-tubes", label: "Sinov naychalari" },
  { name: "droplets", label: "Tomchilar" },
  { name: "shield-check", label: "Himoya" },
  { name: "user", label: "Foydalanuvchi" },
  { name: "users", label: "Foydalanuvchilar" },
  { name: "calendar", label: "Kalendar" },
  { name: "clock", label: "Soat" },
  { name: "phone", label: "Telefon" },
  { name: "map-pin", label: "Joylashuv" },
  { name: "building-2", label: "Bino" },
  { name: "package", label: "Paket" },
  { name: "folder-open", label: "Papka" },
  { name: "star", label: "Yulduz" },
  { name: "zap", label: "Tezkor" },
  { name: "award", label: "Mukofot" },
  { name: "briefcase-medical", label: "Tibbiy sumka" },
  { name: "ambulance", label: "Tez yordam" },
  { name: "bed-double", label: "Karavot" },
  { name: "hand-heart", label: "G'amxo'rlik" },
  { name: "ribbon", label: "Lenta" },
  { name: "dna", label: "DNK" },
  { name: "scan-line", label: "Skanerlash chizig'i" },
];

/** Get all available lucide icon names as kebab-case */
export function getAllIconNames(): string[] {
  return Object.keys(icons).map((name) =>
    name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")
  );
}

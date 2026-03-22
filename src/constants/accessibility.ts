import type { ClinicAccessibility } from "@/types";

type AccessibilityDetail = { icon: string; label: string };

export const ACCESSIBILITY_DETAILS: Record<
  ClinicAccessibility,
  AccessibilityDetail
> = {
  stepFreeEntry: { icon: "🚪", label: "Entrada sem degrau" },
  wheelchairRamp: { icon: "♿", label: "Rampa de acesso" },
  elevator: { icon: "🛗", label: "Elevador" },
  adaptedRestroom: { icon: "🚻", label: "Banheiro adaptado" },
  supportHandrails: { icon: "🔩", label: "Barras de apoio" },
  accessibleParking: { icon: "🅿️", label: "Vaga para PCD" },
  wideCirculation: { icon: "↔️", label: "Portas e corredores largos" },
  tactileVisualSignage: { icon: "👁️", label: "Sinalização tátil ou visual" },
  brailleAudioInfo: { icon: "🔊", label: "Informação em Braille ou áudio" },
};

const ACCESSIBILITY_ORDER: ClinicAccessibility[] = [
  "stepFreeEntry",
  "wheelchairRamp",
  "elevator",
  "adaptedRestroom",
  "supportHandrails",
  "accessibleParking",
  "wideCirculation",
  "tactileVisualSignage",
  "brailleAudioInfo",
];

const ACCESSIBILITY_VALUE_SET = new Set<string>(ACCESSIBILITY_ORDER);

export const ALL_ACCESSIBILITY_OPTIONS: {
  value: ClinicAccessibility;
  label: string;
}[] = ACCESSIBILITY_ORDER.map((value) => ({
  value,
  label: ACCESSIBILITY_DETAILS[value].label,
}));

export const getAccessibilityInfo = (
  key: ClinicAccessibility,
): AccessibilityDetail => ACCESSIBILITY_DETAILS[key];

export const normalizeAccessibilityFeatures = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string =>
      typeof item === "string" && ACCESSIBILITY_VALUE_SET.has(item),
  );
};

export const ACCESSIBILITY_SECTION_BAR_GRADIENT =
  "bg-[linear-gradient(180deg,#E53935_0%,#FDD835_33%,#1E88E5_66%,#00897B_100%)]";

import type { SublocationPlus } from "@/types";

type FeatureDetail = { icon: string; label: string };

export const FEATURE_DETAILS: Record<SublocationPlus, FeatureDetail> = {
  wifi: { icon: "📶", label: "WiFi" },
  airConditioning: { icon: "❄️", label: "Ar Condicionado" },
  desk: { icon: "🪑", label: "Mesa" },
  bathroom: { icon: "🚿", label: "Banheiro" },
  parking: { icon: "🅿️", label: "Estacionamento fácil" },
  microwave: { icon: "📱", label: "Microondas" },
  refrigerator: { icon: "🧊", label: "Refrigerador" },
  guardVolume: { icon: "📦", label: "Guarde volume" },
  receptionist: { icon: "🛎️", label: "Recepcionista" },
  treatmentBed: { icon: "🛏️", label: "Maca ou camilla" },
  waitingArea: { icon: "🛋️", label: "Sala de espera" },
  projectorTv: { icon: "📺", label: "TV ou projetor" },
  whiteboard: { icon: "📋", label: "Quadro branco" },
  printer: { icon: "🖨️", label: "Impressora ou scanner" },
  professionalLighting: { icon: "💡", label: "Iluminação profissional" },
  soundTreated: { icon: "🎙️", label: "Acústica tratada" },
  foodPrepSink: { icon: "🚰", label: "Pia / preparo de alimentos" },
  changingShower: { icon: "🧴", label: "Vestiário com chuveiro" },
  accessibleRamp: { icon: "♿", label: "Acesso acessível" },
  ventilationSystem: { icon: "💨", label: "Ventilação / exaustão" },
  petWashArea: { icon: "🐕", label: "Área de banho pet" },
  outdoorSpace: { icon: "🌿", label: "Área externa ou varanda" },
  coffeeStation: { icon: "☕", label: "Água, café ou copa" },
  meetingTable: { icon: "🤝", label: "Mesa de reunião" },
  securityCameras: { icon: "📹", label: "Câmeras de segurança" },
  trainingEquipment: { icon: "🏋️", label: "Equipamentos de treino" },
};

const FEATURE_ORDER: SublocationPlus[] = [
  "wifi",
  "airConditioning",
  "desk",
  "meetingTable",
  "bathroom",
  "parking",
  "waitingArea",
  "receptionist",
  "treatmentBed",
  "accessibleRamp",
  "coffeeStation",
  "microwave",
  "refrigerator",
  "foodPrepSink",
  "ventilationSystem",
  "guardVolume",
  "projectorTv",
  "whiteboard",
  "printer",
  "professionalLighting",
  "soundTreated",
  "changingShower",
  "trainingEquipment",
  "petWashArea",
  "outdoorSpace",
  "securityCameras",
];

export const getFeatureInfo = (feature: SublocationPlus): FeatureDetail =>
  FEATURE_DETAILS[feature];

export const ALL_FEATURES: { value: SublocationPlus; label: string }[] =
  FEATURE_ORDER.map((value) => ({
    value,
    label: FEATURE_DETAILS[value].label,
  }));

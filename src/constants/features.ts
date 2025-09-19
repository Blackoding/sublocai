import { SublocationPlus } from '@/types';

export const getFeatureInfo = (feature: SublocationPlus) => {
  const features = {
    wifi: { icon: '📶', label: 'WiFi' },
    airConditioning: { icon: '❄️', label: 'Ar Cond.' },
    desk: { icon: '🪑', label: 'Mesa' },
    bathroom: { icon: '🚿', label: 'Banheiro' },
    parking: { icon: '🅿️', label: 'Estacionamento Fácil' },
    microwave: { icon: '📱', label: 'Microondas' },
    refrigerator: { icon: '🧊', label: 'Refrigerador' }
  };
  return features[feature];
};

export const ALL_FEATURES = [
  { value: 'wifi' as SublocationPlus, label: 'WiFi' },
  { value: 'airConditioning' as SublocationPlus, label: 'Ar Condicionado' },
  { value: 'desk' as SublocationPlus, label: 'Mesa' },
  { value: 'bathroom' as SublocationPlus, label: 'Banheiro' },
  { value: 'parking' as SublocationPlus, label: 'Estacionamento Fácil' },
  { value: 'microwave' as SublocationPlus, label: 'Microondas' },
  { value: 'refrigerator' as SublocationPlus, label: 'Refrigerador' }
] as const;

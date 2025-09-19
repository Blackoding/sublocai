export type SublocationPlus = 'wifi' | 'airConditioning' | 'desk' | 'bathroom' | 'parking' | 'microwave' | 'refrigerator';

export interface User {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  phone: string;
  birthDate: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  birthDate: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface Comment {
  id: string;
  clinic_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CommentFormData {
  content: string;
  rating?: number;
}

export interface ProfileUpdateData {
  fullName: string;
  cpf: string;
  phone: string;
  birthDate: string;
  avatar?: string;
}

export interface Clinic {
  id?: string; // Opcional para compatibilidade com clinicService
  title: string;
  // Campos de endereço detalhado
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  city: string;
  state: string;
  zip_code?: string; // Campo legado - pode ser removido no futuro
  price: number;
  description?: string;
  specialty: string; // Campo legado - manter para compatibilidade
  specialties: string[]; // Novo campo para múltiplas especialidades
  images: string[];
  features: string[];
  google_maps_url?: string; // URL do Google Maps
  availability?: { id: string; day: string; startTime: string; endTime: string }[]; // Horários de disponibilidade
  status?: 'pending' | 'active' | 'inactive';
  views?: number;
  bookings?: number;
  rating?: number; // Média de rating dos comentários
  created_at?: string;
  updated_at?: string;
  user_id: string;
  // Campos adicionais para compatibilidade com a UI
  stamp?: 'new' | 'hot';
  plus?: SublocationPlus[];
}

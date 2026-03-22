import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import MultiSelect from "@/components/MultiSelect";
import Checkbox from "@/components/Checkbox";
import Loading from "@/components/Loading";
// import { SublocationPlus } from '@/types';
import {
  ACCESSIBILITY_SECTION_BAR_GRADIENT,
  ALL_ACCESSIBILITY_OPTIONS,
  normalizeAccessibilityFeatures,
} from "@/constants/accessibility";
import { ALL_FEATURES } from "@/constants/features";
import { SPECIALTIES } from "@/constants/specialties";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import {
  consultarCep,
  formatarCep,
  validarCep,
} from "@/services/public/cepService";
import { createAnonSupabaseClient } from "@/config/supabase";
import {
  CLINIC_PRICING_FIELD_HINTS,
  formatPriceBrl,
  parseOptionalPriceField,
} from "@/constants/clinicPricing";
import type { ClinicAccessibility } from "@/types";

const HOURLY_BUSINESS_PATTERN_SLOTS = Array.from({ length: 10 }, (_, i) => {
  const h = 8 + i;
  return {
    startTime: `${String(h).padStart(2, "0")}:00`,
    endTime: `${String(h + 1).padStart(2, "0")}:00`,
  };
});

interface Consultorio {
  id: string;
  title: string;
  // Campos de endereço detalhado
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  city: string;
  state: string;
  zip_code?: string; // Campo legado
  price: number;
  price_per_shift?: number | null;
  price_per_day?: number | null;
  price_per_month?: number | null;
  description: string;
  images: string[];
  features: string[];
  specialty: string; // Legacy field
  specialties: string[]; // New field
  google_maps_url?: string; // URL do Google Maps
  rules?: string | null;
  included_equipment?: string[];
  accessibility_features?: string[];
  availability?: {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
  }[]; // Horários de disponibilidade
  hasappointment?: boolean; // Campo do banco (minúsculo) - Se true, permite agendamento na plataforma; se false, redireciona para WhatsApp
  hasAppointment?: boolean; // Campo mapeado (camelCase) - Se true, permite agendamento na plataforma; se false, redireciona para WhatsApp
  status: "pending" | "active" | "inactive";
  views: number;
  bookings: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface EditClinicPageProps {
  consultorio: Consultorio;
}

const EditClinicPage = ({ consultorio }: EditClinicPageProps) => {
  const router = useRouter();
  // const { id: _id } = router.query;
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    getCurrentUser,
  } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);

  const [formData, setFormData] = useState({
    // Basic information
    title: "",
    // Endereço detalhado
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    city: "",
    state: "",
    priceHour: "",
    priceShift: "",
    priceDay: "",
    priceMonth: "",
    description: "",
    rules: "",
    includedEquipmentItems: [] as { id: string; value: string }[],
    googleMapsUrl: "",

    // Images
    images: [] as {
      id: string;
      file: File | null;
      preview: string;
      order: number;
    }[],

    // Features
    features: [] as string[],

    accessibilityFeatures: [] as ClinicAccessibility[],

    // Specialties
    specialties: [] as string[],

    // Availability
    availability: [] as {
      id: string;
      day: string;
      startTime: string;
      endTime: string;
    }[],

    // Configuração de agendamento
    hasAppointment: true, // Por padrão, permite agendamento na plataforma
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [, setIsFormLoaded] = useState(false);
  const [isConsultingCep, setIsConsultingCep] = useState(false);

  // Opções de estados brasileiros
  const stateOptions = [
    { value: "", label: "Selecione o estado" },
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];

  const dayOptions = [
    { value: "segunda", label: "Segunda-feira" },
    { value: "terca", label: "Terça-feira" },
    { value: "quarta", label: "Quarta-feira" },
    { value: "quinta", label: "Quinta-feira" },
    { value: "sexta", label: "Sexta-feira" },
    { value: "sabado", label: "Sábado" },
    { value: "domingo", label: "Domingo" },
  ];

  const dayShortLabel: Record<string, string> = {
    segunda: "Seg",
    terca: "Ter",
    quarta: "Qua",
    quinta: "Qui",
    sexta: "Sex",
    sabado: "Sáb",
    domingo: "Dom",
  };

  // Refs para os campos do formulário
  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    cep: useRef<HTMLInputElement>(null),
    street: useRef<HTMLInputElement>(null),
    number: useRef<HTMLInputElement>(null),
    neighborhood: useRef<HTMLInputElement>(null),
    complement: useRef<HTMLInputElement>(null),
    city: useRef<HTMLInputElement>(null),
    state: useRef<HTMLInputElement>(null),
    googleMapsUrl: useRef<HTMLInputElement>(null),
    priceHour: useRef<HTMLInputElement>(null),
    priceShift: useRef<HTMLInputElement>(null),
    priceDay: useRef<HTMLInputElement>(null),
    priceMonth: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
    specialties: useRef<HTMLDivElement>(null),
    availability: useRef<HTMLDivElement>(null),
  };

  // Load clinic data
  useEffect(() => {
    if (consultorio) {
      // Convert existing images to the expected format
      const existingImages = (consultorio.images || []).map(
        (imageUrl, index) => ({
          id: `existing-${index}`,
          file: null as File | null, // No file object for existing images
          preview: imageUrl,
          order: index,
        }),
      );

      // Filtrar e limpar dados de disponibilidade
      const cleanAvailability = (consultorio.availability || []).map(
        (item) => ({
          ...item,
          // Se o dia estiver vazio, definir como string vazia (será validado)
          day: item.day || "",
          startTime: item.startTime || "",
          endTime: item.endTime || "",
        }),
      );

      const formDataToSet = {
        title: consultorio.title || "",
        // Endereço detalhado
        cep: consultorio.cep || "",
        street: consultorio.street || "",
        number: consultorio.number || "",
        neighborhood: consultorio.neighborhood || "",
        complement: consultorio.complement || "",
        city: consultorio.city || "",
        state: consultorio.state || "",
        priceHour: consultorio.price
          ? formatPriceBrl(consultorio.price)
          : "",
        priceShift:
          consultorio.price_per_shift != null && consultorio.price_per_shift > 0
            ? formatPriceBrl(consultorio.price_per_shift)
            : "",
        priceDay:
          consultorio.price_per_day != null && consultorio.price_per_day > 0
            ? formatPriceBrl(consultorio.price_per_day)
            : "",
        priceMonth:
          consultorio.price_per_month != null && consultorio.price_per_month > 0
            ? formatPriceBrl(consultorio.price_per_month)
            : "",
        description: consultorio.description || "",
        rules: consultorio.rules || "",
        includedEquipmentItems: (consultorio.included_equipment || []).map(
          (value) => ({
            id: Math.random().toString(36).substr(2, 9),
            value,
          }),
        ),
        googleMapsUrl: consultorio.google_maps_url || "",
        images: existingImages,
        features: consultorio.features || [],
        accessibilityFeatures: normalizeAccessibilityFeatures(
          consultorio.accessibility_features,
        ) as ClinicAccessibility[],
        specialties: consultorio.specialties || [],
        availability: cleanAvailability,
        hasAppointment:
          consultorio.hasappointment !== undefined
            ? consultorio.hasappointment
            : true,
      };

      setFormData(formDataToSet);
    }
  }, [consultorio]);

  useEffect(() => {
    if (typeof window !== "undefined" && router.isReady && !isAuthenticated) {
      getCurrentUser();
    }
  }, [isAuthenticated, router.isReady, getCurrentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Função para consultar CEP e preencher automaticamente os campos
  const handleCepChange = async (cep: string) => {
    // Formatar CEP enquanto digita
    const formattedCep = formatarCep(cep);
    handleInputChange("cep", formattedCep);

    // Consultar CEP se tiver 8 dígitos
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8 && validarCep(cleanCep)) {
      setIsConsultingCep(true);

      try {
        const result = await consultarCep(cleanCep);

        if (!result.erro) {
          // Preencher campos automaticamente
          const cepData = result as {
            logradouro: string;
            bairro: string;
            localidade: string;
            uf: string;
          };
          setFormData((prev) => ({
            ...prev,
            cep: formattedCep,
            street: cepData.logradouro || "",
            neighborhood: cepData.bairro || "",
            city: cepData.localidade || "",
            state: cepData.uf || "",
          }));

          // Limpar erros dos campos preenchidos
          setErrors((prev) => ({
            ...prev,
            cep: "",
            street: "",
            neighborhood: "",
            city: "",
            state: "",
          }));
        } else {
          // CEP não encontrado
          setErrors((prev) => ({
            ...prev,
            cep: "CEP não encontrado",
          }));
        }
      } catch (error) {
        console.error("Erro ao consultar CEP:", error);
        setErrors((prev) => ({
          ...prev,
          cep: "Erro ao consultar CEP",
        }));
      } finally {
        setIsConsultingCep(false);
      }
    }
  };

  const addAvailabilityForDay = (day: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setFormData((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { id, day, startTime: "", endTime: "" },
      ],
    }));
  };

  const applyHourlyPatternForDay = (day: string) => {
    setFormData((prev) => {
      const rest = prev.availability.filter((item) => item.day !== day);
      const additions = HOURLY_BUSINESS_PATTERN_SLOTS.map(
        ({ startTime, endTime }) => ({
          id: Math.random().toString(36).substr(2, 9),
          day,
          startTime,
          endTime,
        }),
      );
      return { ...prev, availability: [...rest, ...additions] };
    });
  };

  const removeAvailability = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((item) => item.id !== id),
    }));
  };

  const updateAvailability = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, feature]
        : prev.features.filter((f) => f !== feature),
    }));
  };

  const handleAccessibilityChange = (
    key: ClinicAccessibility,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      accessibilityFeatures: checked
        ? [...prev.accessibilityFeatures, key]
        : prev.accessibilityFeatures.filter((k) => k !== key),
    }));
  };

  const addIncludedEquipmentItem = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setFormData((prev) => ({
      ...prev,
      includedEquipmentItems: [
        ...prev.includedEquipmentItems,
        { id, value: "" },
      ],
    }));
  };

  const updateIncludedEquipmentItem = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      includedEquipmentItems: prev.includedEquipmentItems.map((item) =>
        item.id === id ? { ...item, value } : item,
      ),
    }));
  };

  const removeIncludedEquipmentItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      includedEquipmentItems: prev.includedEquipmentItems.filter(
        (item) => item.id !== id,
      ),
    }));
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const input = e.target;

    if (errors.images) {
      setErrors((prev) => ({
        ...prev,
        images: "",
      }));
    }

    const maxImages = 6;
    const maxSizeBytes = 10 * 1024 * 1024;

    const allowedFiles = files.filter((file) => file.type.startsWith("image/"));
    const remainingSlots = Math.max(0, maxImages - formData.images.length);
    if (allowedFiles.length > remainingSlots) {
      setErrors((prev) => ({
        ...prev,
        images: "Você pode adicionar no máximo 6 fotos.",
      }));
      return;
    }

    const selectedFiles = allowedFiles.slice(0, remainingSlots);
    const oversized = selectedFiles.find((file) => file.size > maxSizeBytes);

    if (oversized) {
      setErrors((prev) => ({
        ...prev,
        images: "A foto é muito grande. Tamanho máximo: 10MB por imagem.",
      }));
      return;
    }

    const newImages = await Promise.all(
      selectedFiles.map(async (file) => {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = await readFileAsDataUrl(file);
        return { id, file, preview };
      }),
    );

    setFormData((prev) => {
      const startIndex = prev.images.length;
      return {
        ...prev,
        images: [
          ...prev.images,
          ...newImages.map((img, index) => ({
            ...img,
            order: startIndex + index,
          })),
        ],
      };
    });

    input.value = "";
  };

  const removeImage = (imageId: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const moveImage = (imageId: string, direction: "up" | "down") => {
    setFormData((prev) => {
      const images = [...prev.images];
      const currentIndex = images.findIndex((img) => img.id === imageId);

      if (currentIndex === -1) return prev;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= images.length) return prev;

      // Troca as posições
      [images[currentIndex], images[newIndex]] = [
        images[newIndex],
        images[currentIndex],
      ];

      // Atualiza a ordem
      images.forEach((img, index) => {
        img.order = index;
      });

      return { ...prev, images };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    // Validação dos campos de endereço
    if (!formData.cep.trim()) {
      newErrors.cep = "CEP é obrigatório";
    } else if (!/^\d{5}-?\d{3}$/.test(formData.cep.replace(/\D/g, ""))) {
      newErrors.cep = "CEP deve ter o formato 12345-678";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Rua é obrigatória";
    }

    if (!formData.number.trim()) {
      newErrors.number = "Número é obrigatório";
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = "Bairro é obrigatório";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Cidade é obrigatória";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Estado é obrigatório";
    }

    if (!formData.priceHour.trim()) {
      newErrors.priceHour = "Valor por hora é obrigatório";
    } else {
      const numericHour = parseFloat(
        formData.priceHour.replace(/[^\d,.-]/g, "").replace(",", "."),
      );
      if (isNaN(numericHour) || numericHour <= 0) {
        newErrors.priceHour =
          "Valor por hora deve ser um número válido maior que zero";
      }
    }

    const addOptionalPriceError = (raw: string, key: string) => {
      if (!raw.trim()) return;
      if (parseOptionalPriceField(raw) === null) {
        newErrors[key] =
          "Informe um valor válido maior que zero ou deixe em branco";
      }
    };
    addOptionalPriceError(formData.priceShift, "priceShift");
    addOptionalPriceError(formData.priceDay, "priceDay");
    addOptionalPriceError(formData.priceMonth, "priceMonth");

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    } else if (formData.description.length < 20) {
      newErrors.description = "Descrição deve ter pelo menos 20 caracteres";
    }

    // Validação da URL do Google Maps
    if (!formData.googleMapsUrl.trim()) {
      newErrors.googleMapsUrl = "URL do Google Maps é obrigatória";
    } else if (
      !/^https:\/\/maps\.google\.com\/.*/.test(formData.googleMapsUrl) &&
      !/^https:\/\/goo\.gl\/maps\/.*/.test(formData.googleMapsUrl) &&
      !/^https:\/\/www\.google\.com\/maps\/.*/.test(formData.googleMapsUrl) &&
      !/^https:\/\/maps\.app\.goo\.gl\/.*/.test(formData.googleMapsUrl)
    ) {
      newErrors.googleMapsUrl = "Digite uma URL válida do Google Maps";
    }

    if (formData.specialties.length === 0) {
      newErrors.specialties = "Selecione pelo menos uma categoria";
    }

    if (formData.availability.length === 0) {
      newErrors.availability =
        "Pelo menos um horário de disponibilidade é obrigatório";
    } else {
      const incompleteAvailability = formData.availability.find(
        (item) => !item.day || !item.startTime || !item.endTime,
      );

      if (incompleteAvailability) {
        newErrors.availability =
          "Todos os campos de disponibilidade devem ser preenchidos (dia, hora inicial e hora final)";
      } else {
        const invalidTimeFormat = formData.availability.find((item) => {
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          return (
            !timeRegex.test(item.startTime) || !timeRegex.test(item.endTime)
          );
        });

        if (invalidTimeFormat) {
          newErrors.availability =
            "Os horários devem estar no formato HH:MM (ex: 13:00, 09:30)";
        } else {
          const invalidTimeOrder = formData.availability.find((item) => {
            const startTime = item.startTime.split(":").map(Number);
            const endTime = item.endTime.split(":").map(Number);
            const startMinutes = startTime[0] * 60 + startTime[1];
            const endMinutes = endTime[0] * 60 + endTime[1];
            return endMinutes <= startMinutes;
          });

          if (invalidTimeOrder) {
            newErrors.availability =
              "A hora final deve ser maior que a hora inicial";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!isAuthenticated || !user) {
      showToast("Você precisa estar logado para editar um espaço.", "error");
      return;
    }

    // Check if user owns the clinic
    if (consultorio.user_id !== user.id) {
      showToast("Você não tem permissão para editar este espaço.", "error");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Process price
      const cleanPrice = formData.priceHour
        .replace(/[^\d,.-]/g, "")
        .replace(",", ".");
      const numericPrice = parseFloat(cleanPrice) || 0;

      if (numericPrice <= 0) {
        showToast("Por favor, insira um preço válido maior que zero.", "error");
        setIsLoading(false);
        return;
      }

      // Import clinicUtils dynamically
      const { clinicUtils } = await import("@/services/clinicService");

      const updateData = {
        title: formData.title,
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        complement: formData.complement,
        city: formData.city,
        state: formData.state,
        zip_code: formData.cep.replace(/\D/g, ""), // CEP sem formatação
        price: numericPrice,
        price_per_shift: parseOptionalPriceField(formData.priceShift),
        price_per_day: parseOptionalPriceField(formData.priceDay),
        price_per_month: parseOptionalPriceField(formData.priceMonth),
        description: formData.description,
        rules: formData.rules.trim() || null,
        included_equipment: formData.includedEquipmentItems
          .map((row) => row.value.trim())
          .filter((s) => s.length > 0),
        google_maps_url: formData.googleMapsUrl,
        specialty: formData.specialties.join(", "), // Legacy field
        specialties: formData.specialties, // New field
        features: formData.features,
        accessibility_features: formData.accessibilityFeatures,
        availability: formData.availability, // Horários de disponibilidade
        hasappointment: true,
        images: formData.images
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((img) => img.preview),
        status: consultorio.status, // Manter o status atual
      };

      const result = await clinicUtils.updateClinic(consultorio.id, updateData);

      if (result.success) {
        showToast("Espaço atualizado com sucesso!", "success");
        router.push("/painel-de-controle");
      } else {
        setError(result.error || "Erro ao atualizar espaço.");
      }
    } catch (error) {
      console.error("Error updating clinic:", error);
      setError("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm(
        "Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.",
      )
    ) {
      router.push("/painel-de-controle");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <Loading message="Carregando..." />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Editar {consultorio.title} - Sublease</title>
        <meta
          name="description"
          content={`Editar espaço ${consultorio.title}`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Voltar
            </Button>
          </div>

          {/* Page header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Editar espaço
            </h1>
            <p className="text-gray-600">
              Atualize as informações do seu espaço
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section: Basic Information */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="hidden h-10 w-1.5 shrink-0 rounded-full bg-[#2b9af3] sm:block"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Informações Básicas
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Título do espaço"
                      value={formData.title}
                      onChange={(value) => handleInputChange("title", value)}
                      placeholder="Ex: Espaço moderno, 3 salas"
                      required
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Seção de Endereço Detalhado */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Endereço do espaço
                    </h3>
                  </div>

                  <div className="md:col-span-1">
                    <Input
                      ref={fieldRefs.cep}
                      label="CEP"
                      value={formData.cep}
                      onChange={handleCepChange}
                      placeholder="12345-678"
                      mask="cep"
                      required
                      disabled={isConsultingCep}
                    />
                    {isConsultingCep && (
                      <p className="text-blue-500 text-sm mt-1 flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Consultando CEP...
                      </p>
                    )}
                    {errors.cep && (
                      <p className="text-red-500 text-sm mt-1">{errors.cep}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Digite o CEP para preenchimento automático do endereço
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      ref={fieldRefs.street}
                      label="Rua/Avenida"
                      value={formData.street}
                      onChange={(value) => handleInputChange("street", value)}
                      placeholder="Nome da rua ou avenida"
                      required
                    />
                    {errors.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.street}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <Input
                      ref={fieldRefs.number}
                      label="Número"
                      value={formData.number}
                      onChange={(value) => handleInputChange("number", value)}
                      placeholder="123"
                      required
                    />
                    {errors.number && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.number}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <Input
                      ref={fieldRefs.neighborhood}
                      label="Bairro"
                      value={formData.neighborhood}
                      onChange={(value) =>
                        handleInputChange("neighborhood", value)
                      }
                      placeholder="Nome do bairro"
                      required
                    />
                    {errors.neighborhood && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.neighborhood}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <Input
                      ref={fieldRefs.complement}
                      label="Complemento"
                      value={formData.complement}
                      onChange={(value) =>
                        handleInputChange("complement", value)
                      }
                      placeholder="Sala, andar, etc."
                    />
                    {errors.complement && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.complement}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <Input
                      ref={fieldRefs.city}
                      label="Cidade"
                      value={formData.city}
                      onChange={(value) => handleInputChange("city", value)}
                      placeholder="Nome da cidade"
                      required
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <Select
                      label="Estado"
                      value={formData.state}
                      onChange={(value) => handleInputChange("state", value)}
                      placeholder="Selecione o estado"
                      options={stateOptions}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className="hidden h-10 w-1.5 shrink-0 rounded-full bg-green-600 sm:block"
                        aria-hidden
                      />
                      <h2 className="text-xl font-semibold text-[#0c4a6e]">
                        Valores
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Input
                          ref={fieldRefs.priceHour}
                          label="Por hora"
                          value={formData.priceHour}
                          onChange={(value) =>
                            handleInputChange("priceHour", value)
                          }
                          placeholder="R$ 0,00"
                          mask="currency"
                          required
                        />
                        {errors.priceHour && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.priceHour}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-600">
                          {CLINIC_PRICING_FIELD_HINTS.priceHour}
                        </p>
                      </div>
                      <div>
                        <Input
                          ref={fieldRefs.priceShift}
                          label="Por turno"
                          value={formData.priceShift}
                          onChange={(value) =>
                            handleInputChange("priceShift", value)
                          }
                          placeholder="R$ 0,00"
                          mask="currency"
                        />
                        {errors.priceShift && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.priceShift}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-600">
                          {CLINIC_PRICING_FIELD_HINTS.priceShift}
                        </p>
                      </div>
                      <div>
                        <Input
                          ref={fieldRefs.priceDay}
                          label="Por diária"
                          value={formData.priceDay}
                          onChange={(value) =>
                            handleInputChange("priceDay", value)
                          }
                          placeholder="R$ 0,00"
                          mask="currency"
                        />
                        {errors.priceDay && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.priceDay}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-600">
                          {CLINIC_PRICING_FIELD_HINTS.priceDay}
                        </p>
                      </div>
                      <div>
                        <Input
                          ref={fieldRefs.priceMonth}
                          label="Mensal"
                          value={formData.priceMonth}
                          onChange={(value) =>
                            handleInputChange("priceMonth", value)
                          }
                          placeholder="R$ 0,00"
                          mask="currency"
                        />
                        {errors.priceMonth && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.priceMonth}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-600">
                          {CLINIC_PRICING_FIELD_HINTS.priceMonth}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="URL do Google Maps"
                      value={formData.googleMapsUrl}
                      onChange={(value) =>
                        handleInputChange("googleMapsUrl", value)
                      }
                      placeholder="https://maps.google.com/..."
                      required
                    />
                    {errors.googleMapsUrl && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.googleMapsUrl}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Cole aqui o link do Google Maps do espaço
                    </p>
                  </div>
                </div>
              </div>

              {/* Section: Images */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="hidden h-10 w-1.5 shrink-0 rounded-full bg-[#2b9af3] sm:block"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Fotos do espaço
                  </h2>
                </div>

                {/* Image upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Adicionar fotos
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg
                        className="w-12 h-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-600 mb-2">
                        Clique para adicionar fotos
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG até 10MB cada
                      </p>
                    </label>
                  </div>
                </div>

                {/* Image preview */}
                {formData.images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Fotos adicionadas ({formData.images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((image, index) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                              <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Image controls */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <div className="flex gap-2">
                                {/* Move up button */}
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => moveImage(image.id, "up")}
                                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                                    title="Mover para cima"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 15l7-7 7 7"
                                      />
                                    </svg>
                                  </button>
                                )}

                                {/* Move down button */}
                                {index < formData.images.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => moveImage(image.id, "down")}
                                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                                    title="Mover para baixo"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                )}

                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => removeImage(image.id)}
                                  className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                  title="Remover foto"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Order number */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                    </div>

                    <p className="text-sm text-gray-500">
                      A primeira foto será a foto principal. Use as setas para
                      reordenar as fotos.
                    </p>
                  </div>
                )}
              </div>

              {/* Section: Description */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="hidden h-10 w-1.5 shrink-0 rounded-full bg-[#2b9af3] sm:block"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Descrição
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Descrição detalhada
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Descreva o espaço, suas características, localização, facilidades..."
                    rows={6}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#2b9af3] focus:border-[#2b9af3] shadow-sm hover:border-gray-300 transition-colors duration-200 cursor-pointer text-[#333] placeholder-gray-500"
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.description.length}/20 caracteres mínimos
                  </p>
                </div>
              </div>

              {/* Section: Features */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="hidden h-10 w-1.5 shrink-0 rounded-full bg-[#2b9af3] sm:block"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Comodidades
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ALL_FEATURES.map((feature) => (
                    <Checkbox
                      key={feature.value}
                      label={feature.label}
                      checked={formData.features.includes(feature.value)}
                      onChange={(checked) =>
                        handleFeatureChange(feature.value, checked)
                      }
                      value={feature.value}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="hidden h-10 w-1.5 shrink-0 rounded-full bg-[#2b9af3] sm:block"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Equipamentos inclusos
                  </h2>
                </div>
                <p className="mb-4 text-sm text-gray-600">
                  Itens que já ficam disponíveis para quem aluga (um por linha).
                </p>
                <div className="space-y-3">
                  {formData.includedEquipmentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-2 sm:flex-nowrap"
                    >
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) =>
                          updateIncludedEquipmentItem(item.id, e.target.value)
                        }
                        placeholder="Ex.: Maca elétrica, autoclave, kit de luz…"
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-[#333] shadow-sm transition-colors placeholder:text-gray-500 hover:border-gray-300 focus:border-[#2b9af3] focus:outline-none focus:ring-2 focus:ring-[#2b9af3]"
                      />
                      <button
                        type="button"
                        onClick={() => removeIncludedEquipmentItem(item.id)}
                        className="shrink-0 rounded-lg border border-gray-200 p-3 text-red-500 transition-colors hover:border-red-200 hover:bg-red-50"
                        title="Remover item"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 border-[#2b9af3]/50 text-[#1e7ce6] hover:border-[#2b9af3] hover:bg-[#2b9af3]/10"
                  onClick={addIncludedEquipmentItem}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Adicionar equipamento
                </Button>
              </div>

              {/* Section: Specialties */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="hidden h-10 w-1.5 shrink-0 rounded-full bg-[#2b9af3] sm:block"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Categorias
                  </h2>
                </div>
                <div>
                  <MultiSelect
                    label="Categorias"
                    value={formData.specialties}
                    onChange={(values) =>
                      setFormData((prev) => ({ ...prev, specialties: values }))
                    }
                    placeholder="Selecione uma ou mais categorias"
                    options={SPECIALTIES}
                    maxSelections={5}
                  />
                  {errors.specialties && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.specialties}
                    </p>
                  )}

                  {/* Contact link */}
                  <div className="mt-3 text-center">
                    <div className="text-sm text-gray-600">
                      Sua categoria não está aqui?{" "}
                      <Link
                        href="/contato"
                        className="text-[#2b9af3] hover:text-[#1e7ce6] underline transition-colors duration-200 font-medium"
                      >
                        Contate-nos!
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className={`hidden h-10 w-1.5 shrink-0 rounded-full sm:block ${ACCESSIBILITY_SECTION_BAR_GRADIENT}`}
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Acessibilidade
                  </h2>
                </div>
                <p className="mb-4 text-sm text-gray-600">
                  Marque o que o espaço oferece. Apenas opções pré-definidas.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ALL_ACCESSIBILITY_OPTIONS.map((option) => (
                    <Checkbox
                      key={option.value}
                      label={option.label}
                      checked={formData.accessibilityFeatures.includes(
                        option.value,
                      )}
                      onChange={(checked) =>
                        handleAccessibilityChange(option.value, checked)
                      }
                      value={option.value}
                    />
                  ))}
                </div>
              </div>

              <div ref={fieldRefs.availability} className="relative z-30">
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="hidden h-10 w-1.5 shrink-0 rounded-full bg-[#2b9af3] sm:block"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Disponibilidade
                  </h2>
                </div>

                <div className="relative z-20 overflow-hidden rounded-xl border border-[#2b9af3]/25 bg-gradient-to-br from-[#2b9af3]/[0.07] via-white to-white shadow-sm ring-1 ring-[#2b9af3]/10">
                  <div className="divide-y divide-[#2b9af3]/12">
                    {dayOptions.map(({ value, label }) => {
                      const slots = formData.availability.filter(
                        (item) => item.day === value,
                      );
                      const hasSlots = slots.length > 0;
                      return (
                        <div
                          key={value}
                          className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-4 sm:pl-3 ${
                            hasSlots
                              ? "bg-[#2b9af3]/[0.08] sm:border-l-[3px] sm:border-l-[#2b9af3]"
                              : ""
                          }`}
                        >
                          <div className="flex shrink-0 items-center justify-between gap-3 sm:w-52">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <span
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2b9af3]/15 text-xs font-bold uppercase tracking-wide text-[#1e7ce6] ring-1 ring-inset ring-[#2b9af3]/25"
                                aria-hidden
                              >
                                {dayShortLabel[value] ?? "—"}
                              </span>
                              <span className="truncate text-sm font-semibold text-gray-900">
                                {label}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => addAvailabilityForDay(value)}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#2b9af3]/45 text-[#1e7ce6] transition-colors hover:border-[#2b9af3] hover:bg-[#2b9af3] hover:text-white"
                              title="Adicionar horário"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="min-h-[2.25rem] flex-1 space-y-3">
                            {slots.length === 0 && (
                              <div className="rounded-lg border border-dashed border-[#2b9af3]/40 bg-[#2b9af3]/[0.08] px-3 py-3 sm:px-4">
                                <p className="mb-2 text-xs font-semibold text-[#0c4a6e]">
                                  Sugestão: blocos de 1 hora, das 8h às 18h
                                </p>
                                <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] tabular-nums text-[#1e7ce6] sm:grid-cols-3 sm:text-xs">
                                  {HOURLY_BUSINESS_PATTERN_SLOTS.map((slot) => (
                                    <span key={slot.startTime}>
                                      {slot.startTime} – {slot.endTime}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => applyHourlyPatternForDay(value)}
                                  className="w-full rounded-lg border border-[#2b9af3]/50 bg-white px-3 py-2 text-center text-xs font-semibold text-[#1e7ce6] transition-colors hover:border-[#2b9af3] hover:bg-[#2b9af3]/10 sm:w-auto sm:px-4"
                                >
                                  Aplicar este padrão neste dia
                                </button>
                              </div>
                            )}
                            {slots.map((item) => (
                              <div
                                key={item.id}
                                className="flex flex-wrap items-end gap-2 sm:gap-3"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    De
                                  </span>
                                  <Input
                                    label=""
                                    type="time"
                                    value={item.startTime}
                                    onChange={(v) =>
                                      updateAvailability(
                                        item.id,
                                        "startTime",
                                        v,
                                      )
                                    }
                                    placeholder=""
                                    className="mb-0 w-[7.25rem]"
                                  />
                                  <span className="text-xs text-gray-500">
                                    Até
                                  </span>
                                  <Input
                                    label=""
                                    type="time"
                                    value={item.endTime}
                                    onChange={(v) =>
                                      updateAvailability(item.id, "endTime", v)
                                    }
                                    placeholder=""
                                    className="mb-0 w-[7.25rem]"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeAvailability(item.id)}
                                  className="mb-1 text-red-500 transition-colors hover:text-red-700"
                                  title="Remover horário"
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {formData.availability.some(
                    (item) => !dayOptions.some((d) => d.value === item.day),
                  ) && (
                    <div className="space-y-4 border-t border-[#2b9af3]/15 bg-[#2b9af3]/[0.06] px-4 py-4">
                      {formData.availability
                        .filter(
                          (item) =>
                            !dayOptions.some((d) => d.value === item.day),
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-end gap-2 sm:gap-3"
                          >
                            <Select
                              label=""
                              value={item.day}
                              onChange={(v) =>
                                updateAvailability(item.id, "day", v)
                              }
                              placeholder="Selecione o dia"
                              options={[
                                { value: "", label: "Selecione o dia" },
                                ...dayOptions,
                              ]}
                              className="mb-0 min-w-[11rem]"
                            />
                            <span className="text-xs text-gray-500">De</span>
                            <Input
                              label=""
                              type="time"
                              value={item.startTime}
                              onChange={(v) =>
                                updateAvailability(item.id, "startTime", v)
                              }
                              placeholder=""
                              className="mb-0 w-[7.25rem]"
                            />
                            <span className="text-xs text-gray-500">Até</span>
                            <Input
                              label=""
                              type="time"
                              value={item.endTime}
                              onChange={(v) =>
                                updateAvailability(item.id, "endTime", v)
                              }
                              placeholder=""
                              className="mb-0 w-[7.25rem]"
                            />
                            <button
                              type="button"
                              onClick={() => removeAvailability(item.id)}
                              className="mb-1 text-red-500 transition-colors hover:text-red-700"
                              title="Remover horário"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {errors.availability && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.availability}
                  </p>
                )}

                <p className="mt-4 text-sm text-gray-500">
                  Adicione os horários de disponibilidade do espaço. Você pode
                  adicionar múltiplos horários para o mesmo dia.
                </p>
              </div>

              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span
                    className="hidden h-10 w-1.5 shrink-0 rounded-full bg-red-600 sm:block"
                    aria-hidden
                  />
                  <h2 className="text-xl font-semibold text-[#0c4a6e]">
                    Regras do espaço
                  </h2>
                </div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Orientações para quem aluga (opcional)
                </label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => handleInputChange("rules", e.target.value)}
                  placeholder="Ex.: chegada com alguns minutos de antecedência; deixar o ambiente como encontrou; uso de equipamentos só com combinação prévia; limpeza e descarte de resíduos; nível de som permitido."
                  rows={5}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#2b9af3] focus:border-[#2b9af3] shadow-sm hover:border-gray-300 transition-colors duration-200 cursor-pointer text-[#333] placeholder-gray-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Inclua o que fizer sentido: horários de uso, limpeza,
                  equipamentos, convivência e restrições.
                </p>
              </div>

              {/* Global error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  if (!id) return { notFound: true };

  type ClinicRow = {
    id: string;
    user_id: string;
    title: string;
    description: string;
    cep?: string | null;
    street?: string | null;
    number?: string | null;
    neighborhood?: string | null;
    complement?: string | null;
    city: string;
    state: string;
    zip_code?: string | null;
    price: number | string;
    price_per_shift?: number | string | null;
    price_per_day?: number | string | null;
    price_per_month?: number | string | null;
    specialty?: string | null;
    specialties?: string[] | null;
    images?: string[] | null;
    features?: string[] | null;
    google_maps_url?: string | null;
    availability?: unknown;
    hasappointment?: boolean | null;
    status?: string | null;
    views?: number | null;
    bookings?: number | null;
    rating?: number | string | null;
    created_at?: string | null;
    updated_at?: string | null;
    rules?: string | null;
    included_equipment?: string[] | null;
    accessibility_features?: string[] | null;
  };

  const parseNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const normalized = value.replace(",", ".");
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const parseOptionalClinicPrice = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    const n = parseNumber(value);
    return n > 0 ? n : null;
  };

  const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string");
  };

  const normalizeAvailability = (
    value: unknown,
  ): Consultorio["availability"] => {
    if (!Array.isArray(value)) return undefined;

    const normalized = value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const obj = item as {
          id?: string;
          day?: string;
          startTime?: string;
          endTime?: string;
        };

        if (!obj.day || !obj.startTime || !obj.endTime) return null;

        return {
          id: obj.id || "",
          day: obj.day,
          startTime: obj.startTime,
          endTime: obj.endTime,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return normalized.length > 0 ? normalized : undefined;
  };

  try {
    const supabase = createAnonSupabaseClient();

    const { data, error } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return { notFound: true };
    }

    const row = data as ClinicRow;

    const images = normalizeStringArray(row.images);
    const features = normalizeStringArray(row.features);
    const specialties = normalizeStringArray(row.specialties);
    const included_equipment = normalizeStringArray(row.included_equipment)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const accessibility_features = normalizeAccessibilityFeatures(
      row.accessibility_features,
    );

    const availability = normalizeAvailability(row.availability) || [];

    const hasappointment =
      typeof row.hasappointment === "boolean" ? row.hasappointment : true;

    const nowIso = new Date().toISOString();
    const consultorio = {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      description: row.description,
      rules: row.rules ?? null,
      included_equipment,
      accessibility_features,
      cep: row.cep ?? null,
      street: row.street ?? null,
      number: row.number ?? null,
      neighborhood: row.neighborhood ?? null,
      complement: row.complement ?? null,
      city: row.city,
      state: row.state,
      zip_code: row.zip_code ?? null,
      price: parseNumber(row.price),
      price_per_shift: parseOptionalClinicPrice(row.price_per_shift),
      price_per_day: parseOptionalClinicPrice(row.price_per_day),
      price_per_month: parseOptionalClinicPrice(row.price_per_month),
      specialty: row.specialty || "",
      specialties,
      images,
      features,
      google_maps_url: row.google_maps_url ?? null,
      availability,
      hasappointment,
      hasAppointment: hasappointment,
      status: (row.status as Consultorio["status"]) || "pending",
      views: typeof row.views === "number" ? row.views : 0,
      bookings: typeof row.bookings === "number" ? row.bookings : 0,
      created_at: row.created_at || nowIso,
      updated_at: row.updated_at || nowIso,
    } as unknown as Consultorio;

    return {
      props: {
        consultorio,
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default EditClinicPage;

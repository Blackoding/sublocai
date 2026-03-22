export type Specialty = {
  value: string;
  label: string;
  registrationCode: string;
  registrationRequired: boolean;
};

const SPECIALTY_LIST: Specialty[] = [
  {
    value: "acupuncture",
    label: "Acupuntura (médico)",
    registrationCode: "CRM",
    registrationRequired: true,
  },
  {
    value: "law",
    label: "Advocacia / escritório jurídico",
    registrationCode: "OAB",
    registrationRequired: true,
  },
  {
    value: "architecture",
    label: "Arquitetura",
    registrationCode: "CAU",
    registrationRequired: true,
  },
  {
    value: "art_studio",
    label: "Arte / ateliê criativo",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "audiovisual_production",
    label: "Audiovisual / produção",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "driving_school",
    label: "Autoescola (sala de aula)",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "barbershop",
    label: "Barbearia",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "beauty_salon",
    label: "Beleza / salão de beleza",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "biomedicine",
    label: "Biomedicina",
    registrationCode: "CRBM",
    registrationRequired: true,
  },
  {
    value: "aesthetic_non_medical",
    label: "Bronzeamento / depilação (estética)",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "country_venue",
    label: "Chácara / sítio / área rural para eventos",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "chiropractic",
    label: "Quiropraxia",
    registrationCode: "CREFITO",
    registrationRequired: true,
  },
  {
    value: "accounting",
    label: "Contabilidade / escritório contábil",
    registrationCode: "CRC",
    registrationRequired: true,
  },
  {
    value: "corporate_events",
    label: "Corporate / eventos empresariais",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "coworking",
    label: "Coworking / sala compartilhada",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "crossfit_box",
    label: "Crossfit / box de treino",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "dance_studio",
    label: "Dança / estúdio de dança",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "dentistry",
    label: "Odontologia",
    registrationCode: "CRO",
    registrationRequired: true,
  },
  {
    value: "engineering",
    label: "Engenharia (escritório / consultoria)",
    registrationCode: "CREA",
    registrationRequired: true,
  },
  {
    value: "aesthetics_clinic",
    label: "Estética (cabine / clínica de estética)",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "photography_studio",
    label: "Estúdio de fotografia",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "recording_studio",
    label: "Estúdio de gravação / podcast",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "music_lessons",
    label: "Aulas de música / ensaios",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "events_party_venue",
    label: "Festas e eventos (espaço para locação)",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "kids_party_venue",
    label: "Festas infantis",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "pharmacy",
    label: "Farmácia / drogaria",
    registrationCode: "CRF",
    registrationRequired: true,
  },
  {
    value: "physiotherapy",
    label: "Fisioterapia",
    registrationCode: "CREFITO",
    registrationRequired: true,
  },
  {
    value: "speech_therapy",
    label: "Fonoaudiologia",
    registrationCode: "CRFa",
    registrationRequired: true,
  },
  {
    value: "gastronomy_kitchen",
    label: "Gastronomia / cozinha / dark kitchen",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "gym_fitness",
    label: "Academia / musculação / fitness",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "language_school",
    label: "Idiomas / curso de idiomas",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "makeup_studio",
    label: "Maquiagem / cabine de maquiagem",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "nail_studio",
    label: "Manicure / nail design",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "martial_arts",
    label: "Artes marciais / lutas",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "massage_wellness",
    label: "Massagem / bem-estar (não médico)",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "general_medicine",
    label: "Medicina / consultório médico",
    registrationCode: "CRM",
    registrationRequired: true,
  },
  {
    value: "makers_workshop",
    label: "Oficina / makers / artesanato",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "nutrition",
    label: "Nutrição",
    registrationCode: "CRN",
    registrationRequired: true,
  },
  {
    value: "occupational_therapy",
    label: "Terapia ocupacional",
    registrationCode: "CREFITO",
    registrationRequired: true,
  },
  {
    value: "personal_training",
    label: "Personal trainer / educação física",
    registrationCode: "CREFITO",
    registrationRequired: true,
  },
  {
    value: "pet_grooming",
    label: "Pet shop / banho e tosa",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "pilates_studio",
    label: "Pilates / estúdio de pilates",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "psychology",
    label: "Psicologia / terapia",
    registrationCode: "CRP",
    registrationRequired: true,
  },
  {
    value: "retail_popup",
    label: "Pop-up / showroom / vitrine",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "social_work",
    label: "Serviço social",
    registrationCode: "CRESS",
    registrationRequired: true,
  },
  {
    value: "spa_wellness",
    label: "Spa / day spa",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "tattoo_studio",
    label: "Tatuagem / piercing",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "tutoring",
    label: "Reforço escolar / aulas particulares",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "veterinary",
    label: "Veterinária / clínica veterinária",
    registrationCode: "CRMV",
    registrationRequired: true,
  },
  {
    value: "wedding_venue",
    label: "Casamentos / cerimônias",
    registrationCode: "Registro",
    registrationRequired: false,
  },
  {
    value: "yoga_studio",
    label: "Yoga / meditação / mindfulness",
    registrationCode: "Registro",
    registrationRequired: false,
  },
];

export const SPECIALTIES: readonly Specialty[] = [...SPECIALTY_LIST].sort(
  (a, b) => a.label.localeCompare(b.label, "pt-BR"),
);

export type SpecialtyValue = (typeof SPECIALTIES)[number]["value"];
export type SpecialtyLabel = (typeof SPECIALTIES)[number]["label"];
export type SpecialtyRegistrationCode =
  (typeof SPECIALTIES)[number]["registrationCode"];

export const getSpecialtyLabel = (specialtyValue: string): string => {
  const specialty = SPECIALTIES.find((s) => s.value === specialtyValue);
  return specialty ? specialty.label : specialtyValue;
};

export const getSpecialtyLabels = (specialtyValues: string[]): string[] => {
  return specialtyValues.map((value) => getSpecialtyLabel(value));
};

export const getSpecialtyRegistrationCode = (
  specialtyValue: string,
): string => {
  const specialty = SPECIALTIES.find((s) => s.value === specialtyValue);
  return specialty ? specialty.registrationCode : "CRM";
};

export const isSpecialtyRegistrationRequired = (
  specialtyValue: string,
): boolean => {
  const specialty = SPECIALTIES.find((s) => s.value === specialtyValue);
  return specialty ? specialty.registrationRequired : true;
};

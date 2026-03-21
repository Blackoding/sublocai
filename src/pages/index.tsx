import Hero from "@/components/Hero";
import AdSense from "@/components/AdSense";
import MightLike from "@/components/MightLike";
import Link from "next/link";
import Button from "@/components/Button";
import { GetServerSideProps } from 'next';
import { Clinic } from '@/types';
import { createAnonSupabaseClient } from '@/config/supabase';

// Usar a interface Clinic centralizada dos tipos

interface HomeProps {
  featuredClinics: Clinic[];
}

export default function Home({ featuredClinics }: HomeProps) {
  return (
    <>
      <Hero />
      <AdSense />
      {/* Seção: Você pode gostar */}
      <section className="py-16 bg-white">
        <MightLike featuredClinics={featuredClinics} />
      </section>

      {/* Seção: Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#2b9af3] to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para encontrar seu consultório ideal?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de profissionais que já encontraram o espaço perfeito para atender seus pacientes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sublocar" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white text-[#2b9af3] hover:bg-gray-50 border-white"
              >
                Buscar Consultórios
              </Button>
            </Link>
            
            <Link href="/anunciar" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-transparent text-white border-white hover:bg-white hover:text-[#2b9af3]"
              >
                Anunciar Consultório
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
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
    specialty?: string | null;
    specialties?: string[] | null;
    images?: string[] | null;
    features?: string[] | null;
    google_maps_url?: string | null;
    availability?: unknown;
    hasappointment?: boolean | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };

  const parseNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const normalized = value.replace(',', '.');
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string');
  };

  try {
    const supabase = createAnonSupabaseClient();

    const { data } = await supabase
      .from('clinics')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6);

    const rows = (data as ClinicRow[] | null) || [];

    const featuredClinics = rows.map((row) => {
      const images = normalizeStringArray(row.images);
      const features = normalizeStringArray(row.features);
      const specialties = normalizeStringArray(row.specialties);

      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        cep: row.cep ?? null,
        street: row.street ?? null,
        number: row.number ?? null,
        neighborhood: row.neighborhood ?? null,
        complement: row.complement ?? null,
        city: row.city,
        state: row.state,
        zip_code: row.zip_code ?? null,
        price: parseNumber(row.price),
        specialty: row.specialty || '',
        specialties,
        images,
        features,
        google_maps_url: row.google_maps_url ?? null,
        availability: [],
        hasAppointment:
          typeof row.hasappointment === 'boolean' ? row.hasappointment : null,
        status: row.status as Clinic['status'],
        created_at: row.created_at ?? null,
        updated_at: row.updated_at ?? null
      } as unknown as Clinic;
    });

    return {
      props: {
        featuredClinics
      }
    };
  } catch {
    return {
      props: {
        featuredClinics: []
      }
    };
  }
};
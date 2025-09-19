import { useState, useCallback } from 'react';
import { getSupabaseClient } from './supabase';
import { Clinic } from '@/types';

export interface ClinicResponse {
  success: boolean;
  clinic?: Clinic;
  error?: string;
}

export interface ClinicsResponse {
  success: boolean;
  clinics?: Clinic[];
  error?: string;
}

// Hook to manage clinics
export const useClinic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClinic = useCallback(async (data: Omit<Clinic, 'id' | 'created_at' | 'updated_at' | 'views' | 'bookings'>): Promise<ClinicResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Create clinic using fetch direto
      const createResponse = await fetch('https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: data.user_id,
          title: data.title,
          description: data.description,
          cep: data.cep,
          street: data.street,
          number: data.number,
          neighborhood: data.neighborhood,
          complement: data.complement,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code, // Campo legado
          price: data.price,
          specialty: data.specialty, // Campo legado
          specialties: data.specialties || [], // Novo campo
          images: data.images,
          features: data.features,
          google_maps_url: data.google_maps_url,
          availability: data.availability || [],
          status: data.status || 'pending'
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        setError(errorData.message || 'Failed to create clinic');
        return { success: false, error: errorData.message || 'Failed to create clinic' };
      }

      const clinicDataArray = await createResponse.json();
      const clinicData = clinicDataArray[0];

      if (!clinicData) {
        setError('Clinic not created');
        return { success: false, error: 'Clinic not created' };
      }

      return { 
        success: true, 
        clinic: clinicData
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getClinicsByUser = useCallback(async (userId: string): Promise<ClinicsResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Get clinics by user using fetch direto
      const clinicsResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?user_id=eq.${userId}&select=*&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!clinicsResponse.ok) {
        const errorData = await clinicsResponse.json();
        setError(errorData.message || 'Failed to fetch clinics');
        return { success: false, error: errorData.message || 'Failed to fetch clinics' };
      }

      const clinics = await clinicsResponse.json();
      return { success: true, clinics: clinics || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getClinicById = useCallback(async (id: string): Promise<ClinicResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Get clinic by ID using fetch direto
      const clinicResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?id=eq.${id}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!clinicResponse.ok) {
        const errorData = await clinicResponse.json();
        setError(errorData.message || 'Failed to fetch clinic');
        return { success: false, error: errorData.message || 'Failed to fetch clinic' };
      }

      const clinicArray = await clinicResponse.json();
      const clinic = clinicArray[0];

      if (!clinic) {
        setError('Clinic not found');
        return { success: false, error: 'Clinic not found' };
      }

      return { success: true, clinic };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClinic = useCallback(async (id: string, updates: Partial<Omit<Clinic, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ClinicResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Update clinic using fetch direto
      const updateResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        setError(errorData.message || 'Failed to update clinic');
        return { success: false, error: errorData.message || 'Failed to update clinic' };
      }

      const clinicArray = await updateResponse.json();
      const clinic = clinicArray[0];

      if (!clinic) {
        setError('Clinic not found after update');
        return { success: false, error: 'Clinic not found after update' };
      }

      return { success: true, clinic };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteClinic = useCallback(async (id: string): Promise<ClinicResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Delete clinic using fetch direto
      const deleteResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        setError(errorData.message || 'Failed to delete clinic');
        return { success: false, error: errorData.message || 'Failed to delete clinic' };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createClinic,
    getClinicsByUser,
    getClinicById,
    updateClinic,
    deleteClinic,
    isLoading,
    error
  };
};

// Utility functions for direct use (without hooks)
export const clinicUtils = {
  async createClinic(data: Omit<Clinic, 'id' | 'created_at' | 'updated_at' | 'views' | 'bookings'>): Promise<ClinicResponse> {
    try {
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      const supabase = getSupabaseClient();
      const { data: clinicData, error: insertError } = await supabase
        .from('clinics')
        .insert({
          user_id: data.user_id,
          title: data.title,
          description: data.description,
          cep: data.cep,
          street: data.street,
          number: data.number,
          neighborhood: data.neighborhood,
          complement: data.complement,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code, // Campo legado
          price: data.price,
          specialty: data.specialty, // Campo legado
          specialties: data.specialties || [], // Novo campo
          images: data.images,
          features: data.features,
          google_maps_url: data.google_maps_url,
          availability: data.availability || [],
          status: data.status || 'pending'
        })
        .select()
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }
      return { 
        success: true, 
        clinic: clinicData
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  },

  async getClinicsByUser(userId: string): Promise<ClinicsResponse> {
    try {
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Get clinics by user using fetch direto
      const clinicsResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?user_id=eq.${userId}&select=*&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!clinicsResponse.ok) {
        const errorData = await clinicsResponse.json();
        return { success: false, error: errorData.message || 'Failed to fetch clinics' };
      }

      const clinics = await clinicsResponse.json();
      return { success: true, clinics: clinics || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  },


  async getActiveClinics(): Promise<ClinicsResponse> {
    try {
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Get all clinics using fetch direto
      const clinicsResponse = await fetch('https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?select=*', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!clinicsResponse.ok) {
        const errorData = await clinicsResponse.json();
        return { success: false, error: errorData.message || 'Failed to fetch clinics' };
      }

      const allClinics = await clinicsResponse.json();

      if (!allClinics || allClinics.length === 0) {
        return { success: true, clinics: [] };
      }

      // Filtrar consultórios ativos no JavaScript
      const activeClinics = allClinics.filter((clinic: Clinic) => clinic.status === 'active');
      
      return { success: true, clinics: activeClinics };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  },

  async getClinicById(id: string): Promise<ClinicResponse> {
    try {
      // Only execute on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Server side execution not allowed' };
      }

      // Get clinic by ID using fetch direto
      const clinicResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?id=eq.${id}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!clinicResponse.ok) {
        const errorData = await clinicResponse.json();
        return { success: false, error: errorData.message || 'Failed to fetch clinic' };
      }

      const clinicArray = await clinicResponse.json();
      const clinic = clinicArray[0];

      if (!clinic) {
        return { success: false, error: 'Clinic not found' };
      }

      return { success: true, clinic };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  },

  async updateClinic(id: string, updates: Partial<Omit<Clinic, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ClinicResponse> {
    try {
      // Update clinic using fetch direto
      const updateResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        return { success: false, error: errorData.message || 'Failed to update clinic' };
      }

      const clinicArray = await updateResponse.json();
      const clinic = clinicArray[0];

      if (!clinic) {
        return { success: false, error: 'Clinic not found after update' };
      }

      return { success: true, clinic };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  },

  async deleteClinic(id: string): Promise<ClinicResponse> {
    try {
      // Delete clinic using fetch direto
      const deleteResponse = await fetch(`https://nmxcqiwslkuvdydlsolm.supabase.co/rest/v1/clinics?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0',
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        return { success: false, error: errorData.message || 'Failed to delete clinic' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }
};
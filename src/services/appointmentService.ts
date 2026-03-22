import { Appointment } from "@/types";

type ApiError = {
  error?: string;
};

type ApiResponse<T> = {
  data?: T;
} & ApiError;

type CreateAppointmentsInput = {
  clinicId: string;
  userId: string;
  date: string;
  selectedTimes: string[];
  notes?: string;
  valuePerSession?: number;
  totalBookingValue?: number;
};

const fetchJson = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  const json = (await response.json()) as T;

  if (!response.ok) {
    const message = (json as unknown as ApiError).error || "Request failed";
    throw new Error(message);
  }

  return json;
};

export class AppointmentService {
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  static async getAllUserAppointments(userId: string): Promise<{
    data: Appointment[] | null;
    error: string | null;
  }> {
    try {
      const json = await fetchJson<ApiResponse<Appointment[]>>(
        "/api/appointments/by-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );
      return { data: json.data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar agendamentos",
      };
    }
  }

  static async getAppointmentsByClinic(clinicId: string): Promise<{
    data: Appointment[] | null;
    error: string | null;
  }> {
    try {
      const json = await fetchJson<ApiResponse<Appointment[]>>(
        "/api/appointments/by-clinic",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clinicId }),
        },
      );
      return { data: json.data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar agendamentos do espaço",
      };
    }
  }

  static async updateAppointmentStatus(
    appointmentId: string,
    status: "pending" | "confirmed" | "cancelled" | "completed",
  ): Promise<{
    data: Appointment | null;
    error: string | null;
  }> {
    try {
      const json = await fetchJson<ApiResponse<Appointment>>(
        "/api/appointments/update-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appointmentId, status }),
        },
      );
      return { data: json.data || null, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar status do agendamento",
      };
    }
  }

  static async getAppointmentStats(userId: string): Promise<{
    data: {
      total: number;
      pending: number;
      confirmed: number;
      cancelled: number;
      completed: number;
    } | null;
    error: string | null;
  }> {
    const result = await this.getAllUserAppointments(userId);
    const appointments = result.data || [];

    if (result.error) {
      return { data: null, error: result.error };
    }

    return {
      data: {
        total: appointments.length,
        pending: appointments.filter((a) => a.status === "pending").length,
        confirmed: appointments.filter((a) => a.status === "confirmed").length,
        cancelled: appointments.filter((a) => a.status === "cancelled").length,
        completed: appointments.filter((a) => a.status === "completed").length,
      },
      error: null,
    };
  }

  static async createAppointments(input: CreateAppointmentsInput): Promise<{
    data: Appointment[] | null;
    error: string | null;
  }> {
    try {
      const json = await fetchJson<ApiResponse<Appointment[]>>(
        "/api/appointments/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clinicId: input.clinicId,
            userId: input.userId,
            date: input.date,
            selectedTimes: input.selectedTimes,
            notes: input.notes,
            ...(input.totalBookingValue != null && input.totalBookingValue > 0
              ? { totalBookingValue: input.totalBookingValue }
              : { valuePerSession: input.valuePerSession }),
          }),
        },
      );
      return { data: json.data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Erro ao criar agendamentos",
      };
    }
  }

  static async createAppointment(
    clinicId: string,
    userId: string,
    date: string,
    time: string,
    value: number,
    notes?: string,
  ): Promise<{
    data: Appointment | null;
    error: string | null;
  }> {
    const result = await this.createAppointments({
      clinicId,
      userId,
      date,
      selectedTimes: [time],
      notes,
      valuePerSession: value,
    });

    return { data: result.data?.[0] || null, error: result.error };
  }
}

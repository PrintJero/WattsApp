const API_BASE_URL = "http://localhost:3000/api";

export interface Dispositivo {
  id_dispositivo: number;
  nombre_dispositivo: string;
  numero_serie: string;
  ubicacion?: string | null;
  descripcion?: string | null;
  id_usuario: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const fetchDispositivos = async (): Promise<Dispositivo[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/dispositivos`);

    if (!res.ok) {
      console.log("Error HTTP:", res.status);
      return [];
    }

    const json: ApiResponse<Dispositivo[]> = await res.json();
    return json.data || [];
  } catch (error) {
    console.log("Error al obtener dispositivos:", error);
    return [];
  }
};

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

export const login = async (correo: string, contraseña: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contraseña }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log('Error en login:', error);
    return { success: false, message: 'Error de red' };
  }
};

export const register = async (nombre: string, correo: string, contraseña: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, contraseña }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log('Error en register:', error);
    return { success: false, message: 'Error de red' };
  }
};

export const getUsuarioById = async (id: number): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`);
    const json = await res.json();
    return json;
  } catch (error) {
    console.log('Error en getUsuarioById:', error);
    return { success: false, message: 'Error de red' };
  }
};

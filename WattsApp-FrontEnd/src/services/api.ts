export const API_BASE_URL = "http://192.168.1.174:3000/api";

export interface Dispositivo {
  id_dispositivo: number;
  nombre_dispositivo: string;
  numero_serie: string;
  ubicacion?: string | null;
  descripcion?: string | null;
  id_usuario: number;
}

export interface Medicion {
  id_medicion: number;
  id_dispositivo: number;
  corriente: number;
  voltaje: number;
  potencia: number;
  fecha_hora?: string;
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

export const fetchDispositivosByUsuario = async (id_usuario: number): Promise<Dispositivo[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/dispositivos/usuario/${id_usuario}`);

    if (!res.ok) {
      console.log("Error HTTP:", res.status);
      return [];
    }

    const json: ApiResponse<Dispositivo[]> = await res.json();
    return json.data || [];
  } catch (error) {
    console.log("Error al obtener dispositivos del usuario:", error);
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

export const addDispositivo = async (
  nombre_dispositivo: string,
  numero_serie: string,
  id_usuario: number,
  ubicacion?: string,
  descripcion?: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/dispositivos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_dispositivo,
        numero_serie,
        ubicacion: ubicacion || null,
        descripcion: descripcion || null,
        id_usuario,
      }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log('Error en addDispositivo:', error);
    return { success: false, message: 'Error de red' };
  }
};

export const getDispositivoById = async (id_dispositivo: number): Promise<Dispositivo | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/dispositivos/${id_dispositivo}`);

    if (!res.ok) {
      console.log("Error HTTP:", res.status);
      return null;
    }

    const json: ApiResponse<Dispositivo> = await res.json();
    return json.data || null;
  } catch (error) {
    console.log("Error al obtener dispositivo:", error);
    return null;
  }
};

export const fetchMedicionesByDispositivo = async (id_dispositivo: number): Promise<Medicion[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/mediciones/dispositivo/${id_dispositivo}`);

    if (!res.ok) {
      console.log("Error HTTP mediciones:", res.status);
      return [];
    }

    const json: ApiResponse<Medicion[]> = await res.json();
    return json.data || [];
  } catch (error) {
    console.log("Error al obtener mediciones:", error);
    return [];
  }
};

export const updateDispositivo = async (
  id_dispositivo: number,
  nombre_dispositivo: string,
  numero_serie: string,
  ubicacion?: string,
  descripcion?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/dispositivos/${id_dispositivo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_dispositivo,
        numero_serie,
        ubicacion: ubicacion || null,
        descripcion: descripcion || null,
      }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log('Error en updateDispositivo:', error);
    return { success: false, message: 'Error de red' };
  }
};

export const deleteDispositivo = async (
  id_dispositivo: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/dispositivos/${id_dispositivo}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log('Error en deleteDispositivo:', error);
    return { success: false, message: 'Error de red' };
  }
};

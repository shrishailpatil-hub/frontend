import axios from 'axios';

// Prefer explicit env; otherwise if running locally default to localhost backend; else use hosted fallback
const envUrl = process.env.REACT_APP_API_URL;
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE_URL = envUrl || (isLocal ? 'http://localhost:8000' : 'https://newton-backend.onrender.com');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MissionParameters {
  launch_date: string;
  propulsion_type: 'chemical' | 'ion' | 'solar-sail';
  payload_size: 'small' | 'medium' | 'large';
}

export interface MissionResults {
  travel_time: number;
  delta_v: number;
  success_probability: number;
  mission_log: string[];
  fuel_cost: number;
  mission_status: string;
}

export interface AtlasInfo {
  name: string;
  discovery_date: string;
  description: string;
  characteristics: Record<string, string>;
  scientific_value: string;
}

export const missionAPI = {
  simulate: async (parameters: MissionParameters): Promise<MissionResults> => {
    const response = await api.post('/simulate', parameters);
    return response.data;
  },

  getAtlasInfo: async (): Promise<AtlasInfo> => {
    const response = await api.get('/atlas-info');
    return response.data;
  },

  getMissionHistory: async () => {
    const response = await api.get('/mission-history');
    return response.data;
  },

  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

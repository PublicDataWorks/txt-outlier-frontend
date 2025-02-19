import axios from '@/lib/axios';


// Default settings
const DEFAULT_SETTINGS: BroadcastSettings = {
  schedule: {
    mon: '10:30',
    tue: null,
    wed: '11:15',
    thu: null,
    fri: null,
    sat: '09:00',
    sun: '10:00',
  },
  batchSize: 500,
};


const SETTINGS_ENDPOINT = '/broadcast-settings/';

export interface BroadcastSettings {
  schedule: {
    [key: string]: string | null;
  };
  batchSize: number;
}

export const getSettings = async (): Promise<BroadcastSettings> => {
  const response = await axios.get<BroadcastSettings>(SETTINGS_ENDPOINT);
  return response.data;
};

export const updateSettings = async (settings: BroadcastSettings): Promise<BroadcastSettings> => {
  const response = await axios.post<BroadcastSettings>(SETTINGS_ENDPOINT, settings);
  return response.data;
};

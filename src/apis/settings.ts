import axios from '@/lib/axios';

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

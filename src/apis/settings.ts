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


// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock storage to persist settings between calls
let mockSettings = { ...DEFAULT_SETTINGS };

export const getSettings = async (): Promise<BroadcastSettings> => {
  // Simulate network delay (500-1500ms)
  await delay(500 + Math.random() * 1000);
  return { ...mockSettings };
};

export const updateSettings = async (settings: BroadcastSettings): Promise<BroadcastSettings> => {
  // Simulate network delay (500-1500ms)
  await delay(500 + Math.random() * 1000);
  
  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Failed to update settings');
  }

  // Update mock storage
  mockSettings = { ...settings };
  return { ...mockSettings };
};

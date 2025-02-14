import { BackendSchedule, BroadcastSettings, DaySchedule } from '@/components/SettingsModal';

const DAY_MAPPING = {
  sun: 'Su',
  mon: 'Mo',
  tue: 'Tu',
  wed: 'We',
  thu: 'Th',
  fri: 'Fr',
  sat: 'Sa',
} as const;

const DEFAULT_TIME = '9:00';

export const convertScheduleSettingsToFrontend = (backendData: BackendSchedule): BroadcastSettings => {
  const schedule: { [key: string]: DaySchedule } = {};

  Object.entries(DAY_MAPPING).forEach(([backendDay, frontendDay]) => {
    const time = backendData.schedule[backendDay];
    schedule[frontendDay] = {
      enabled: time !== null,
      time: time || DEFAULT_TIME,
    };
  });

  return {
    schedule,
    batchSize: backendData.batchSize,
  };
};

export const convertScheduleSettingsToBackend = (frontendData: BroadcastSettings): BackendSchedule => {
  const schedule: { [key: string]: string | null } = {};

  Object.entries(DAY_MAPPING).forEach(([backendDay, frontendDay]) => {
    const daySchedule = frontendData.schedule[frontendDay];
    schedule[backendDay] = daySchedule.enabled ? daySchedule.time : null;
  });

  return {
    schedule,
    batchSize: frontendData.batchSize,
  };
};


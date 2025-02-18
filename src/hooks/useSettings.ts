import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getSettings, updateSettings, BroadcastSettings } from '@/apis/settings';

export const SETTINGS_QUERY_KEY = ['broadcast-settings'];

export const useSettingsQuery = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
  });
};

export const useSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: BroadcastSettings) => {
      return await updateSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};

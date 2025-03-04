import { useQuery } from '@tanstack/react-query';

import { getSegments, Segment } from '@/apis/segments';

export function useSegments() {
  return useQuery<Segment[]>({
    queryKey: ['segments'],
    queryFn: getSegments,
  });
}


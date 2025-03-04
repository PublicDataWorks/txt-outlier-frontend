import axios from '@/lib/axios';

const SEGMENTS_URL = '/campaigns/segments/';

export interface Segment {
  id: string;
  name: string;
  recipient_count: string;
}

export const getSegments = async (): Promise<Segment[]> => {
  try {
    const response = await axios.get<Segment[]>(SEGMENTS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching segments:', error);
    throw error;
  }
};

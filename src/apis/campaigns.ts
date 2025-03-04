import axios from '@/lib/axios';

const CAMPAIGNS_URL = '/campaigns/';

export interface Segment {
  id: string;
  since?: number | null;
}

export interface Campaign {
  id: number;
  title: string | null;
  firstMessage: string;
  secondMessage: string | null;
  segments: {
    included: Segment | Segment[];
    excluded?: Segment | null;
  };
  delay: number;
  recipientCount: number;
  runAt: number;
}

export interface Pagination {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PastCampaigns {
  items: Campaign[];
  pagination: Pagination;
}

export interface CampaignsResponse {
  upcoming: Campaign[];
  past: PastCampaigns;
}

export const getCampaigns = async (pageSize: number = 10, page: number = 1): Promise<CampaignsResponse> => {
  try {
    const response = await axios.get<CampaignsResponse>(CAMPAIGNS_URL, {
      params: {
        pageSize,
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

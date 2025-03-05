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
    included: Array<Segment | Segment[]>;
    excluded?: Array<Segment | Segment[]> | null;
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

export interface CreateCampaignPayload {
  title?: string;
  firstMessage: string;
  secondMessage?: string;
  segments: {
    included: Array<Segment | Segment[]>;
    excluded?: Array<Segment | Segment[]> | null;
  };
  delay?: number;
  runAt: number;
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

export const createCampaign = async (campaignData: CreateCampaignPayload): Promise<Campaign> => {
  try {
    const response = await axios.post<Campaign>(CAMPAIGNS_URL, campaignData);
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

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

export interface CampaignPayload {
  title?: string;
  firstMessage: string;
  secondMessage?: string | null;
  segments: {
    included: Array<Segment | Segment[]>;
    excluded?: Array<Segment | Segment[]> | null;
  };
  delay?: number;
  runAt: number;
}

// Renamed to be more generic since it's now used for both create and update
export type CreateCampaignPayload = CampaignPayload;
export type UpdateCampaignPayload = CampaignPayload;

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

export const updateCampaign = async (id: number, campaignData: UpdateCampaignPayload): Promise<Campaign> => {
  try {
    const response = await axios.put<Campaign>(`${CAMPAIGNS_URL}${id}/`, campaignData);
    return response.data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${CAMPAIGNS_URL}${id}/`);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};

export interface RecipientCountPayload {
  segments: {
    included: Array<Segment | Segment[]>;
    excluded?: Array<Segment | Segment[]> | null;
  };
}

export interface RecipientCountResponse {
  recipient_count: number;
}

export const getRecipientCount = async (payload: RecipientCountPayload): Promise<RecipientCountResponse> => {
  try {
    const response = await axios.post<RecipientCountResponse>(`${CAMPAIGNS_URL}recipient-count/`, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipient count:', error);
    throw error;
  }
};

export type KYCStatus = 'unsubmitted' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  password?: string;
  google_id?: string;
  role: 'user' | 'admin';
  points: number;
  referral_code: string;
  referred_by?: string;
  kyc_status: KYCStatus;
  kyc_data?: {
    name: string;
    address: string;
    id_card?: string;
  };
  subscription_tier?: 'basic' | 'professional' | 'executive' | 'elite';
  purchased_points?: number;
  black_room_alias?: string;
  trust_score: number;
  created_at: string;
}

export interface SigniaTemplate {
  id: string;
  name: string;
  category: string;
  html_content: string;
  uploaded_by?: {
    id: string;
    email: string;
  };
  created_at: string;
}

export type ListingStatus = 'open' | 'sold' | 'disputed';

export interface BlackRoomListing {
  id: string;
  user_id: string;
  alias: string;
  title: string;
  description: string;
  price_points: number;
  status: ListingStatus;
  buyer_id?: string;
  broker_id?: string;
  created_at: string;
}

export interface BlackRoomMessage {
  id: string;
  listing_id: string;
  from_alias: string;
  message: string;
  timestamp: string;
}

export interface Broker {
  id: string;
  alias: string;
  trust_score: number;
  is_active: boolean;
}

export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';

export interface EscrowTransaction {
  id: string;
  related_table: 'marketplace' | 'black_room' | 'programmer' | 'gallery';
  related_id: string;
  buyer_id: string;
  seller_id: string;
  amount_points: number;
  status: EscrowStatus;
  disputed_by?: string;
  admin_resolution?: string;
  created_at: string;
}

export interface MarketplaceListing {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  description: string;
  category: 'accounts' | 'numbers' | 'boosting';
  price_points: number;
  status: ListingStatus;
  buyer_id?: string;
  delivery_info?: string;
  created_at: string;
}

export interface ProgramBooking {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  price_points: number;
  delivery_days: number;
  status: 'pending' | 'completed';
  delivery_notes?: string;
  created_at: string;
}

export interface ProgrammerService {
  id: string;
  title: string;
  description: string;
  price_points: number;
  delivery_days: number;
  is_active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  preview_image: string;
  demo_url: string;
  price_points: number;
  price_money: number;
  created_at: string;
}

export interface UserReceipt {
  id: string;
  user_id: string;
  bank: string;
  sender_name: string;
  receiver_name: string;
  receiver_bank: string;
  amount: number;
  date_time: string;
  transaction_id: string;
  reference: string;
  balance: number;
  custom_field?: string;
  unlocked: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_email: string;
  amount_points: number;
  usdt_address: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SystemSettings {
  gas_fee_percent: number;
  signup_bonus: number;
  referral_percent: number;
  receipt_price_points: number;
  custom_emblem_html: string;
  whatsapp_url: string;
  telegram_url: string;
  support_email: string;
  groq_api_key?: string;
  ai_script?: string;
}

export interface CryptoBrokerInvestment {
  id: string;
  userId: string;
  user_email: string;
  brokerId: string;
  brokerName: string;
  amountPoints: number;
  yieldPoints: number;
  status: 'active' | 'liquidated';
  createdAt: string;
  liquidatedAt?: string;
}

export interface CryptoBroker {
  id: string;
  name: string;
  alias: string;
  description: string;
  price_points: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Very High' | 'Extreme';
  projected_apy: number;
  minimum_investment_points: number;
  is_active: boolean;
  detailed_readme: string;
  mock_trades: Array<{
    id: string;
    ticker: string;
    amount: number;
    profit: number;
    time: string;
  }>;
  unlocked?: boolean;
  activeInvestment?: CryptoBrokerInvestment | null;
  is_crypto?: boolean;
  external_link?: string;
  uploaded_html?: string;
}

export type Language = 'so' | 'en' | 'ar';

export type AppPage =
  | 'home'
  | 'coins-packs'
  | 'dreamsquad'
  | 'player-training'
  | 'exchange'
  | 'admin';

export type OrderStatus =
  | 'Pending Payment'
  | 'Awaiting Verification'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Completed'
  | 'Rejected';

export interface CoinPackage {
  id: string;
  category: 'coins' | 'packs' | 'passes';
  titleSo: string;
  titleEn: string;
  coinsAmount: string;
  priceUsd: number;
  imageUrl?: string;
  badgeSo?: string;
  badgeEn?: string;
  bonus?: string;
  descriptionSo: string;
  descriptionEn: string;
  popular?: boolean;
}

export interface PaymentConfig {
  evcNumber: string;
  evcName: string;
  sahalNumber: string;
  sahalName: string;
  premierBankNumber: string;
  premierBankName: string;
  instructionsSo: string;
  instructionsEn: string;
  exchangeEnabled: boolean;
  updatedAt: string;
}

export interface Order {
  id: string; // e.g. "SOM-2026-8942"
  packageId: string;
  packageName: string;
  coinsAmount: string;
  priceUsd: number;
  paymentMethod: string;
  transactionRef: string;
  receiptImage?: string; // base64 or receipt image URL
  customerContact: string; // Phone / WhatsApp
  customerEmail?: string;
  efootballId: string;
  platform: string; // 'Android' | 'Apple / iOS'
  verificationCode?: string;
  isEmailVerified?: boolean;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export type Playstyle =
  | 'Quick Counter'
  | 'Long Ball Counter'
  | 'Possession Game'
  | 'Out Wide'
  | 'Long Ball';

export interface PlayerCard {
  id: string;
  name: string;
  cardType: string;
  clubOrNation: string;
  position: 'CF' | 'SS' | 'LWF' | 'RWF' | 'AMF' | 'CMF' | 'DMF' | 'LMF' | 'RMF' | 'LB' | 'CB' | 'RB' | 'GK';
  baseRating: number;
  maxRating: number;
  playstyle: string;
  colorAccent: string;
  imageUrl?: string;
  recommendedBuild: {
    shooting: number;
    passing: number;
    dribbling: number;
    dexterity: number;
    lowerBody: number;
    aerial: number;
    defending: number;
  };
  keyAttributes?: { name: string; value: number }[];
  recommendedSkills?: string[];
  tacticalAdviceSo: string;
  tacticalAdviceEn: string;
}

export interface DreamSquadAnalysisRequest {
  playstyle: Playstyle;
  formationImageBase64?: string;
  formationImageMimeType?: string;
  playersOwned?: string;
  preferredManager?: string;
}

export interface DreamSquadAnalysisResponse {
  formationName: string;
  manager: string;
  tacticalOverviewSo: string;
  keyStrengthsSo: string[];
  playerInstructionsSo: string[];
  positions: { role: string; x: number; y: number }[];
  aiModelUsed: string;
  visionAnalyzed: boolean;
}

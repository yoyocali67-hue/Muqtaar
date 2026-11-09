export type Language = 'so' | 'en' | 'ar';

export type AppPage =
  | 'home'
  | 'coins-packs'
  | 'tournament'
  | 'chat'
  | 'dreamsquad'
  | 'player-training'
  | 'exchange'
  | 'admin'
  | 'account';

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
  evcUssdPrefix?: string;
  sahalUssdPrefix?: string;
  maintenanceMode?: boolean;
  exchangeEnabled: boolean;
  updatedAt: string;
}

export type StaffRole = 'Super Admin' | 'Admin' | 'Support' | 'Tournament Manager';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  avatar?: string;
  ordersProcessed: number;
  lastActive: string;
  isOnline: boolean;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface StaffActivityLog {
  id: string;
  staffName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SiteContent {
  homepage: {
    hero: {
      badge: string;
      titlePrimary: string;
      titleAccent: string;
      subtitle: string;
      ctaTextSo: string;
      ctaTextEn: string;
      ctaTextAr: string;
      bannerImageUrl: string;
      aspectRatio?: string;
    };
    serviceCards: {
      id: string;
      title: string;
      descSo: string;
      descEn: string;
      descAr: string;
      image: string;
      badge: string;
    }[];
  };
  branding: {
    siteName: string;
    siteTagline: string;
    logoUrl?: string;
    headerBannerUrl?: string;
  };
  tournament: {
    title: string;
    subtitleSo: string;
    subtitleEn: string;
    bannerImageUrl: string;
  };
  playerTraining: {
    catalogBannerUrl?: string;
    gridColumns?: number;
    cardImageSize?: 'compact' | 'normal' | 'tall';
  };
  updatedAt: string;
}

export interface SiteAnalytics {
  totalVisits: number;
  uniqueVisitors: number;
  totalOrders: number;
  totalRevenueUsd: number;
  totalTournamentRegistrations: number;
  dailyVisits: { date: string; visits: number; orders: number }[];
  popularSections: { name: string; count: number }[];
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
  verificationStatus?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired' | 'locked';
  verificationAttempts?: number;
  verificationExpiresAt?: string;
  verificationRejectReason?: string;
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
  bannerUrl?: string;
  bannerAspectRatio?: '16:9' | '21:9' | '4:3' | 'custom';
  cardImageAspectRatio?: 'portrait' | 'square' | 'standard';
  description?: string;
  buildEntries?: { id: string; category: string; nameEn: string; nameSo: string; points: number; max: number }[];
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
  maxLevel?: number;
  availablePoints?: number;
  progressionPoints?: {
    finishing: number;
    passing: number;
    dribbling: number;
    dexterity: number;
    lowerBody: number;
    aerial: number;
    defending: number;
    gk1?: number;
    gk2?: number;
    gk3?: number;
  };
  detailedStats?: {
    offensiveAwareness: number;
    ballControl: number;
    dribbling: number;
    tightPossession: number;
    lowPass: number;
    loftedPass: number;
    finishing: number;
    heading: number;
    setPieceTaking: number;
    curl: number;
    speed: number;
    acceleration: number;
    kickingPower: number;
    jumping: number;
    physicalContact: number;
    balance: number;
    stamina: number;
    defensiveAwareness: number;
    tackling: number;
    aggression: number;
    defensiveEngagement: number;
    gkAwareness?: number;
    gkCatching?: number;
    gkParrying?: number;
    gkReflexes?: number;
    gkReach?: number;
  };
  bio?: {
    age?: number;
    height?: string;
    weight?: string;
    foot?: 'Right' | 'Left';
    form?: string;
  };
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

export interface TournamentParticipant {
  id: string;
  name: string;
  email?: string; // Private
  whatsapp?: string; // Private
  passwordHash?: string; // Private session auth
  accountScreenshotUrl?: string;
  registeredAt: string;
  group?: string;
  avatarUrl?: string;
  status?: 'Registered' | 'Group Stage' | 'Qualified' | 'Eliminated' | 'Champion';
  eliminated?: boolean;
}

export interface PublicTournamentParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  accountScreenshotUrl?: string;
  registeredAt: string;
  group?: string;
  status?: string;
  eliminated?: boolean;
  stats?: {
    played: number;
    won: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
  };
}

export interface TournamentMatchScore {
  p1: number;
  p2: number;
}

export interface TournamentMatch {
  id: string;
  round: 'Round of 32' | 'Round of 16' | 'Quarter Finals' | 'Semi Finals' | 'Final';
  matchNumber: number;
  branch: 'left' | 'right';
  group?: string;
  time: string;
  date: string;
  player1: {
    name: string;
    avatar?: string;
    group?: string;
    eliminated?: boolean;
  };
  player2: {
    name: string;
    avatar?: string;
    group?: string;
    eliminated?: boolean;
  };
  leg1?: TournamentMatchScore;
  leg2?: TournamentMatchScore;
  aggregate?: TournamentMatchScore;
  penalties?: TournamentMatchScore;
  decidingMethod?: 'normal' | 'aggregate' | 'penalties' | 'forfeit';
  forfeitWinner?: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  winner?: string;
  eliminatedPlayer?: string;
  nextMatchId?: string;
  nextMatchSlot?: 'player1' | 'player2';
  notes?: string;
  auditLog?: {
    recordedBy: string;
    recordedAt: string;
    details: string;
  }[];
}

export interface TournamentGroup {
  name: string; // 'Group A' ... 'Group H'
  players: string[];
  qualifiers: string[]; // top 4
}

export interface TournamentAuditRecord {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface TournamentData {
  id: string;
  name: string;
  totalCapacity: number;
  entryFeeBab: number;
  entryFeeText: string;
  prizePoolUsd: number;
  prizePoolText: string;
  startDate: string;
  format: string;
  registeredCount: number;
  status: 'registration' | 'groups' | 'bracket_active' | 'completed' | 'open';
  drawApproved?: boolean;
  drawApprovedAt?: string;
  drawApprovedBy?: string;
  participants: (TournamentParticipant | PublicTournamentParticipant)[];
  groups: TournamentGroup[];
  matches: TournamentMatch[];
  auditTrail?: TournamentAuditRecord[];
  champion?: {
    name: string;
    prize: string;
    avatar: string;
    group?: string;
    score?: string;
  } | null;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  reactions: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  verified?: boolean;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    userVotedIndex?: number;
  };
  linkUrl?: string;
  reactions: number;
  userReacted?: boolean;
  views?: number;
  sharesCount?: number;
  userBookmarked?: boolean;
  category?: string;
  quotePost?: {
    id: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    imageUrl?: string;
  };
  commentsCount: number;
  comments?: CommunityComment[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type?: 'text' | 'match_invite' | 'post_share';
  inviteData?: {
    matchType: string;
    scheduledTime: string;
    status: 'pending' | 'accepted' | 'declined';
  };
  sharedPost?: {
    id: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    imageUrl?: string;
  };
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participantIds: string[];
  participants: {
    id: string;
    name: string;
    avatar?: string;
    online?: boolean;
    verified?: boolean;
  }[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  updatedAt: string;
}

export interface UserCommunityProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  verified?: boolean;
  online?: boolean;
  followersCount: number;
  followingCount?: number;
  friendsCount?: number;
  totalLikesReceived?: number;
  dmsCount?: number;
  location?: string;
  rank?: string;
  isFollowing?: boolean;
  isMutualFriend?: boolean;
  tournamentStatus?: string;
  tournamentGroup?: string;
  isTournamentRegistered?: boolean;
  pepBalance?: number;
  joinedDate?: string;
  privacySettings?: {
    likedPostsPrivate: boolean;
    savedPostsPrivate: boolean;
  };
  stats?: {
    matches: number;
    wins: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  recentMatches?: {
    opponent: string;
    opponentAvatar?: string;
    score: string;
    result: 'Win' | 'Draw' | 'Loss';
    date: string;
    group?: string;
  }[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface UserWallet {
  userId: string;
  userName: string;
  babBalance: number;
  pepBalance?: number;
  transactions: WalletTransaction[];
}

export interface AccountMeResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    handle?: string;
    location?: string;
    email?: string;
    whatsapp?: string;
    avatar?: string;
    bio?: string;
    registeredAt: string;
    group?: string;
    status?: string;
    eliminated?: boolean;
    dmsCount?: number;
    isTournamentRegistered?: boolean;
    privacySettings?: {
      likedPostsPrivate: boolean;
      savedPostsPrivate: boolean;
    };
  };
  wallet: {
    babBalance: number;
    pepBalance?: number;
    transactions: WalletTransaction[];
  };
  communityStats: {
    followersCount: number;
    followingCount: number;
    friendsCount: number;
    totalLikesReceived: number;
    postsCount: number;
    commentsCount: number;
    dmsCount?: number;
  };
  tournamentStats: {
    status: string;
    group?: string;
    rank?: string;
    played: number;
    won: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    bracketPosition: string;
  } | null;
  recentMatches: {
    opponent: string;
    opponentAvatar?: string;
    score: string;
    result: 'Win' | 'Draw' | 'Loss';
    date: string;
    group?: string;
  }[];
}

export interface FollowerUser {
  id: string;
  name: string;
  avatar?: string;
  verified?: boolean;
  activityTime: string;
  isFollowing: boolean;
  isMutualFriend?: boolean;
}

export interface UserCommentWithPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  verified?: boolean;
  timeAgo: string;
  text: string;
  postTitle: string;
  postThumbnail?: string;
  postId?: string;
}




import {
  CoinPackage,
  Order,
  OrderStatus,
  PaymentConfig,
  PlayerCard,
  DreamSquadAnalysisRequest,
  DreamSquadAnalysisResponse,
  StaffMember,
  StaffActivityLog,
  SiteContent,
  SiteAnalytics,
} from '../types';

export const api = {
  // Packages
  async getPackages(): Promise<CoinPackage[]> {
    const res = await fetch('/api/packages');
    if (!res.ok) throw new Error('Failed to load packages');
    return res.json();
  },

  async savePackage(pkg: CoinPackage): Promise<void> {
    const res = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
    });
    if (!res.ok) throw new Error('Failed to save package');
  },

  async deletePackage(id: string): Promise<void> {
    const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete package');
  },

  // Settings & Payment config
  async getSettings(): Promise<PaymentConfig> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<PaymentConfig>): Promise<void> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
  },

  // Players
  async getPlayers(): Promise<PlayerCard[]> {
    const res = await fetch('/api/players');
    if (!res.ok) throw new Error('Failed to load players');
    return res.json();
  },

  async savePlayer(player: PlayerCard): Promise<void> {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player),
    });
    if (!res.ok) throw new Error('Failed to save player');
  },

  async deletePlayer(id: string): Promise<void> {
    const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete player');
  },

  // Orders
  async startOrder(orderData: {
    packageId: string;
    packageName: string;
    coinsAmount: string;
    priceUsd: number;
    customerEmail: string;
    efootballId: string;
    platform: string;
  }): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/orders/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to start order');
    return data;
  },

  async verifyOrderCode(orderId: string, code: string): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to verify code');
    return data;
  },

  async submitOrderPayment(
    orderId: string,
    paymentData: { paymentMethod: string; transactionRef: string; receiptImage?: string }
  ): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit payment details');
    return data;
  },

  async approveOrderCode(orderId: string): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/approve-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve code');
    return data;
  },

  async rejectOrderCode(orderId: string, reason?: string): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/reject-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject code');
    return data;
  },

  async restartVerification(orderId: string): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/restart-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restart verification');
    return data;
  },

  async resendOrderCode(orderId: string): Promise<{ success: boolean; order?: Order; message: string }> {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/resend-code`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resend code');
    return data;
  },

  async createOrder(orderData: Partial<Order>): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit order');
    return data;
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Dalabka lama helin');
    return res.json();
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async updateOrderStatus(id: string, status: OrderStatus, adminNotes?: string): Promise<{ success: boolean; order: Order; customerNotice?: string }> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  // Admin Auth
  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  // DreamSquad AI
  async analyzeDreamSquad(request: DreamSquadAnalysisRequest): Promise<DreamSquadAnalysisResponse> {
    const res = await fetch('/api/dreamsquad/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to generate formation advice');
    return res.json();
  },

  // Tournament
  async getTournament(): Promise<import('../types').TournamentData> {
    const res = await fetch('/api/tournament');
    if (!res.ok) throw new Error('Failed to load tournament data');
    return res.json();
  },

  async registerTournament(data: {
    name: string;
    email: string;
    whatsapp: string;
    password?: string;
    accountScreenshotUrl?: string;
  }): Promise<{ success: boolean; token: string; participant: import('../types').TournamentParticipant }> {
    const res = await fetch('/api/tournament/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to register for tournament');
    return result;
  },

  async loginTournamentPlayer(
    email: string,
    password?: string
  ): Promise<{ success: boolean; token: string; participant: import('../types').TournamentParticipant }> {
    const res = await fetch('/api/tournament/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to sign in');
    return result;
  },

  async getMyTournamentProfile(token: string): Promise<{
    success: boolean;
    participant: import('../types').TournamentParticipant;
    upcomingMatch?: import('../types').TournamentMatch;
    pastMatches: import('../types').TournamentMatch[];
    record: { played: number; won: number; lost: number; goalsFor: number; goalsAgainst: number };
    group?: string;
    bracketPosition?: string;
  }> {
    const res = await fetch('/api/tournament/my-profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load player profile');
    return result;
  },

  async getAdminTournamentParticipants(
    adminToken: string
  ): Promise<{ success: boolean; participants: import('../types').TournamentParticipant[]; total: number }> {
    const res = await fetch('/api/tournament/admin/participants', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch admin participants');
    return result;
  },

  async generateTournamentDraw(
    adminToken: string
  ): Promise<{ success: boolean; tournament: import('../types').TournamentData }> {
    const res = await fetch('/api/tournament/draw/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to generate draw');
    return result;
  },

  async saveOfficialMatchResult(
    adminToken: string,
    matchId: string,
    resultData: {
      leg1: { p1: number; p2: number };
      leg2: { p1: number; p2: number };
      penalties?: { p1: number; p2: number };
      decidingMethod?: string;
      forfeitWinner?: string;
      notes?: string;
      recordedBy?: string;
    }
  ): Promise<{ success: boolean; match: import('../types').TournamentMatch; champion?: any }> {
    const res = await fetch(`/api/tournament/matches/${encodeURIComponent(matchId)}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(resultData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to save match result');
    return result;
  },

  // ==========================================
  // COMMUNITY & CHAT API
  // ==========================================
  async getCommunityPosts(
    tokenOrOptions?: string | { sort?: 'latest' | 'popular'; token?: string; userId?: string },
    legacyUserId?: string
  ): Promise<{ success: boolean; posts: import('../types').CommunityPost[] }> {
    let token: string | undefined;
    let userId: string | undefined;
    let sort: 'latest' | 'popular' | undefined;

    if (typeof tokenOrOptions === 'object' && tokenOrOptions !== null) {
      token = tokenOrOptions.token;
      userId = tokenOrOptions.userId;
      sort = tokenOrOptions.sort;
    } else {
      token = tokenOrOptions;
      userId = legacyUserId;
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;

    const query = sort ? `?sort=${sort}` : '';
    const res = await fetch(`/api/community/posts${query}`, { headers });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load community posts');
    return result;
  },

  async createCommunityPost(postData: {
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    poll?: { question: string; options: string[] };
    linkUrl?: string;
    authorName?: string;
    authorAvatar?: string;
    quotePost?: {
      id: string;
      authorName: string;
      authorAvatar?: string;
      content: string;
      imageUrl?: string;
    };
  }, token?: string): Promise<{ success: boolean; post: import('../types').CommunityPost }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/community/posts', {
      method: 'POST',
      headers,
      body: JSON.stringify(postData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create post');
    return result;
  },

  async reactToPost(postId: string, token?: string, userId?: string): Promise<{ success: boolean; reactions: number; userReacted: boolean }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/react`, {
      method: 'POST',
      headers,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to react');
    return result;
  },

  async addPostComment(
    postId: string,
    commentData: { text: string; authorName?: string; authorAvatar?: string },
    token?: string
  ): Promise<{ success: boolean; comment: import('../types').CommunityComment; commentsCount: number }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commentData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to post comment');
    return result;
  },

  async getConversations(token?: string, userId?: string): Promise<{ success: boolean; conversations: import('../types').ChatConversation[] }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    const res = await fetch('/api/community/conversations', { headers });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load conversations');
    return result;
  },

  async getConversation(
    convId: string,
    token?: string
  ): Promise<{ success: boolean; conversation: import('../types').ChatConversation; messages: import('../types').ChatMessage[] }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/conversations/${encodeURIComponent(convId)}`, { headers });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load conversation');
    return result;
  },

  async sendChatMessage(
    convId: string,
    messageData: { text?: string; type?: 'text' | 'match_invite'; inviteData?: any },
    token?: string
  ): Promise<{ success: boolean; message: import('../types').ChatMessage; conversation: import('../types').ChatConversation }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/conversations/${encodeURIComponent(convId)}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(messageData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send message');
    return result;
  },

  async startConversation(
    targetUserId: string,
    targetUserName?: string,
    targetUserAvatar?: string,
    token?: string
  ): Promise<{ success: boolean; conversation: import('../types').ChatConversation }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/community/conversations/start', {
      method: 'POST',
      headers,
      body: JSON.stringify({ targetUserId, targetUserName, targetUserAvatar }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to start conversation');
    return result;
  },

  async getUserProfile(userId: string, token?: string): Promise<{ success: boolean; profile: import('../types').UserCommunityProfile }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/users/${encodeURIComponent(userId)}`, { headers });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load profile');
    return result;
  },

  async followUser(userId: string, token?: string): Promise<{ success: boolean; isFollowing: boolean }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/users/${encodeURIComponent(userId)}/follow`, {
      method: 'POST',
      headers,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to follow user');
    return result;
  },

  // ==========================================
  // MY ACCOUNT API
  // ==========================================
  async getMyAccount(token: string): Promise<import('../types').AccountMeResponse> {
    const res = await fetch('/api/account/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load user account');
    return result;
  },

  async updateAccountProfile(
    data: { name?: string; bio?: string; avatar?: string },
    token: string
  ): Promise<{ success: boolean; user: { id: string; name: string; bio?: string; avatar?: string } }> {
    const res = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update account profile');
    return result;
  },

  async getAccountPosts(token: string): Promise<{
    success: boolean;
    posts: import('../types').CommunityPost[];
    likedPosts?: import('../types').CommunityPost[];
    bookmarkedPosts?: import('../types').CommunityPost[];
    comments: {
      id?: string;
      authorName?: string;
      authorAvatar?: string;
      verified?: boolean;
      timeAgo?: string;
      text: string;
      postTitle: string;
      postThumbnail?: string;
      postId: string;
    }[];
  }> {
    const res = await fetch('/api/account/posts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load account posts');
    return result;
  },

  async togglePostBookmark(postId: string, token?: string): Promise<{ success: boolean; isBookmarked: boolean }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/bookmark`, {
      method: 'POST',
      headers,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to bookmark post');
    return result;
  },

  async recordPostView(postId: string, token?: string): Promise<{ success: boolean; views: number }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/view`, {
      method: 'POST',
      headers,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to record post view');
    return result;
  },

  async sharePost(
    postId: string,
    shareData: { type: 'link' | 'chat' | 'quote'; targetUserId?: string; conversationId?: string },
    token?: string
  ): Promise<{ success: boolean; sharesCount: number }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/share`, {
      method: 'POST',
      headers,
      body: JSON.stringify(shareData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to share post');
    return result;
  },

  async reportContent(
    data: { targetType: 'post' | 'user'; targetId: string; reason: string },
    token?: string
  ): Promise<{ success: boolean; message: string }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/community/report', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to report content');
    return result;
  },

  async blockUser(userId: string, token?: string): Promise<{ success: boolean; isBlocked: boolean }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/community/users/${encodeURIComponent(userId)}/block`, {
      method: 'POST',
      headers,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to toggle block user');
    return result;
  },

  async updatePrivacySettings(
    settings: { likedPostsPrivate?: boolean; savedPostsPrivate?: boolean },
    token: string
  ): Promise<{ success: boolean; privacySettings: { likedPostsPrivate: boolean; savedPostsPrivate: boolean } }> {
    const res = await fetch('/api/account/privacy', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update privacy settings');
    return result;
  },

  async getFollowers(token?: string): Promise<{
    success: boolean;
    followers: import('../types').FollowerUser[];
    following: import('../types').FollowerUser[];
    friends: import('../types').FollowerUser[];
  }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/account/followers', { headers });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load followers');
    return result;
  },

  // Site Content & In-Place Editing
  async getContent(): Promise<SiteContent> {
    const res = await fetch('/api/content');
    if (!res.ok) throw new Error('Failed to load site content');
    return res.json();
  },

  async updateContent(content: Partial<SiteContent>, token?: string): Promise<{ success: boolean; content: SiteContent }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers,
      body: JSON.stringify(content),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update content');
    return result;
  },

  // Admin Analytics
  async getAnalytics(token?: string): Promise<{ success: boolean; analytics: SiteAnalytics }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/admin/analytics', { headers });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load analytics');
    return result;
  },

  // Admin Staff Management
  async getStaff(token?: string): Promise<{ success: boolean; staff: StaffMember[] }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/admin/staff', { headers });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load staff list');
    return result;
  },

  async saveStaff(member: Partial<StaffMember>, token?: string): Promise<{ success: boolean; staff: StaffMember[] }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers,
      body: JSON.stringify(member),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to save staff member');
    return result;
  },

  async deleteStaff(id: string, token?: string): Promise<{ success: boolean; staff: StaffMember[] }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/admin/staff/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete staff member');
    return result;
  },

  async getStaffActivity(token?: string): Promise<{ success: boolean; activity: StaffActivityLog[] }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/admin/staff/activity', { headers });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load staff activity');
    return result;
  },

  async checkAdminToken(token: string): Promise<{ valid: boolean; adminName?: string; role?: string }> {
    const res = await fetch('/api/admin/check', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};



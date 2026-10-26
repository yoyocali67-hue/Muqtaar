import {
  CoinPackage,
  Order,
  OrderStatus,
  PaymentConfig,
  PlayerCard,
  DreamSquadAnalysisRequest,
  DreamSquadAnalysisResponse,
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

  async resendOrderCode(orderId: string): Promise<{ success: boolean; message: string }> {
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
};

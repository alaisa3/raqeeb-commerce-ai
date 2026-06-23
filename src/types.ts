export interface Profile {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Store {
  id: string;
  userId: string;
  sallaMerchantId: string | null;
  storeName: string;
  storeUrl: string | null;
  platform: 'salla' | 'demo';
  whatsapp: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
  connectedAt: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  storeId: string;
  sallaOrderId: string | null;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  carrier: string;
  orderDate: string; // YYYY-MM-DD
  status: string; // 'قيد التجهيز' | 'تم الشحن' | 'متأخر' | 'مكتمل' | 'مرتجع' | 'يحتاج متابعة'
  lastUpdate: string; // ISO datetime
  total: number;
  returnRequested: boolean;
  followupStatus: 'new' | 'investigating' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
}

export interface OrderAnalysis {
  id: string;
  orderId: string;
  riskLevel: 'منخفض' | 'متوسط' | 'مرتفع';
  reason: string;
  recommendedAction: string;
  customerMessage: string;
  carrierMessage: string;
  internalNote: string;
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  storeId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  productCondition: string;
  opened: boolean;
  decision: 'قبول مبدئي' | 'رفض مبدئي' | 'يحتاج مراجعة';
  decisionReason: string;
  customerMessage: string;
  status: 'open' | 'approved' | 'rejected' | 'resolved';
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  storeId: string | null; // null for global
  category: string; // 'delay' | 'confirm' | 'feedback' | 'return' | 'exchange' | 'apology' | 'followup' | 'carrier'
  title: string;
  body: string;
  tone: 'رسمية' | 'ودية' | 'مختصرة';
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  orderLimit: number;
  features: string[];
  createdAt: string;
}

export interface Subscription {
  id: string;
  storeId: string;
  planId: string;
  status: 'active' | 'trial' | 'canceled' | 'expired';
  startedAt: string;
  endsAt: string;
  trialEndsAt: string;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  storeId: string | null;
  provider: 'salla';
  eventType: string;
  payload: any;
  processed: boolean;
  createdAt: string;
}

export interface AgentTask {
  id: string;
  storeId: string;
  taskType: 'call_customer' | 'update_phone' | 'escalate_carrier' | 'review_return' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'completed' | 'ignored';
  relatedOrderId: string | null;
  createdAt: string;
}

export interface CustomerAlert {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  recipient: string;
  type: 'email' | 'sms';
  channel: string;
  status: 'sent' | 'pending' | 'failed';
  sentAt: string;
  message: string;
  carrier?: string;
  city?: string;
  isTest?: boolean;
}

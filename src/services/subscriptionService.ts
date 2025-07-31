import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in cents
  interval: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  limits: {
    chartGenerations: number;
    audioDuration: number; // in seconds
    exports: number;
    sandboxUses: number;
  };
}

export interface UserSubscription {
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  usage: {
    chartGenerations: number;
    audioDuration: number;
    exports: number;
    sandboxUses: number;
  };
}

export interface CheckoutSession {
  id: string;
  userId: string;
  planId: string;
  amount: number; // in cents
  status: 'pending' | 'completed' | 'failed';
  stripeSessionId?: string;
  createdAt: Date;
}

// Define subscription plans
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    interval: 'one-time',
    features: [
      '1 free personal chart generation',
      '3 free sandbox plays per month',
      'Access "Today\'s Chart"',
      '1 export (MIDI, MP3, or Narration)'
    ],
    limits: {
      chartGenerations: 1,
      audioDuration: 300, // 5 minutes
      exports: 1,
      sandboxUses: 3
    }
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 1000, // $10.00
    interval: 'monthly',
    features: [
      'Unlimited chart generations',
      'Unlimited sandbox access',
      'Full audio control tools',
      'Save and revisit any session',
      'Compare charts with friends',
      'Priority support'
    ],
    limits: {
      chartGenerations: -1, // unlimited
      audioDuration: -1, // unlimited
      exports: -1, // unlimited
      sandboxUses: -1 // unlimited
    }
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: 10000, // $100.00
    interval: 'yearly',
    features: [
      'All Pro Monthly features',
      '2 months free (save $20)',
      'Early access to new features',
      'Exclusive content'
    ],
    limits: {
      chartGenerations: -1, // unlimited
      audioDuration: -1, // unlimited
      exports: -1, // unlimited
      sandboxUses: -1 // unlimited
    }
  },
  flex_pack: {
    id: 'flex_pack',
    name: 'Flex Pack',
    price: 399, // $3.99
    interval: 'one-time',
    features: [
      '3 additional sandbox sessions',
      '3 additional exports',
      'No monthly commitment'
    ],
    limits: {
      chartGenerations: 0,
      audioDuration: 0,
      exports: 3,
      sandboxUses: 3
    }
  }
};

export class SubscriptionService {
  /**
   * Get subscription plan by ID
   */
  static getPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS[planId] || null;
  }

  /**
   * Get all available plans
   */
  static getAllPlans(): SubscriptionPlan[] {
    return Object.values(SUBSCRIPTION_PLANS);
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const db = await getDatabase();
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      planId: user.subscription_plan,
      status: user.subscription_status as 'active' | 'cancelled' | 'expired',
      startDate: new Date(user.created_at),
      endDate: user.subscription_expires_at ? new Date(user.subscription_expires_at) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usage: {
        chartGenerations: 0, // TODO: Track from user_activity
        audioDuration: 0, // TODO: Track from user_activity
        exports: 0, // TODO: Track from user_exports
        sandboxUses: 0 // TODO: Track from user_activity
      }
    };
  }

  /**
   * Check if user has access to a feature
   */
  static async checkFeatureAccess(userId: string, feature: 'chartGenerations' | 'audioDuration' | 'exports' | 'sandboxUses'): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return false;
    }

    const plan = this.getPlan(subscription.planId);
    if (!plan) {
      return false;
    }

    // Check if subscription is active
    if (subscription.status !== 'active' || subscription.endDate < new Date()) {
      return false;
    }

    // Check limits
    const limit = plan.limits[feature];
    if (limit === -1) {
      return true; // Unlimited
    }

    const currentUsage = subscription.usage[feature];
    return currentUsage < limit;
  }

  /**
   * Create checkout session for Stripe
   */
  static async createCheckoutSession(userId: string, planId: string): Promise<CheckoutSession> {
    const db = await getDatabase();
    
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    const sessionId = uuidv4();
    const checkoutSession: CheckoutSession = {
      id: sessionId,
      userId,
      planId,
      amount: plan.price,
      status: 'pending',
      createdAt: new Date()
    };

    await db.run(
      'INSERT INTO checkout_sessions (id, user_id, plan_id, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [checkoutSession.id, checkoutSession.userId, checkoutSession.planId, checkoutSession.amount, checkoutSession.status, checkoutSession.createdAt.toISOString()]
    );

    return checkoutSession;
  }

  /**
   * Complete checkout session (called by Stripe webhook)
   */
  static async completeCheckoutSession(sessionId: string, stripeSessionId: string): Promise<void> {
    const db = await getDatabase();
    
    const session = await db.get('SELECT * FROM checkout_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      throw new Error('Checkout session not found');
    }

    const plan = this.getPlan(session.plan_id);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    // Update checkout session
    await db.run(
      'UPDATE checkout_sessions SET status = ?, stripe_session_id = ? WHERE id = ?',
      ['completed', stripeSessionId, sessionId]
    );

    // Update user subscription
    const endDate = new Date();
    if (plan.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // one-time plans don't expire
      endDate.setFullYear(endDate.getFullYear() + 100);
    }

    await db.run(
      'UPDATE users SET subscription_plan = ?, subscription_status = ?, subscription_expires_at = ?, updated_at = ? WHERE id = ?',
      [plan.id, 'active', endDate.toISOString(), new Date().toISOString(), session.user_id]
    );

    // Log activity
    await this.logSubscriptionActivity(session.user_id, 'subscription_upgraded', {
      planId: plan.id,
      amount: session.amount,
      sessionId
    });
  }

  /**
   * Cancel user subscription
   */
  static async cancelSubscription(userId: string): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE users SET subscription_status = ?, updated_at = ? WHERE id = ?',
      ['cancelled', new Date().toISOString(), userId]
    );

    await this.logSubscriptionActivity(userId, 'subscription_cancelled', {});
  }

  /**
   * Downgrade user to free plan
   */
  static async downgradeToFree(userId: string): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE users SET subscription_plan = ?, subscription_status = ?, subscription_expires_at = NULL, updated_at = ? WHERE id = ?',
      ['free', 'active', new Date().toISOString(), userId]
    );

    await this.logSubscriptionActivity(userId, 'subscription_downgraded', { planId: 'free' });
  }

  /**
   * Track usage for a user
   */
  static async trackUsage(userId: string, action: 'chart_generated' | 'audio_created' | 'export_created' | 'sandbox_used'): Promise<void> {
    const db = await getDatabase();
    
    // Log the activity
    await db.run(
      'INSERT INTO user_activity (id, user_id, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), userId, action, JSON.stringify({}), '127.0.0.1', 'AstroAudio-API', new Date().toISOString()]
    );

    // Check if user has exceeded limits
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return;
    }

    const plan = this.getPlan(subscription.planId);
    if (!plan) {
      return;
    }

    // For now, we'll just log the usage
    // In a full implementation, you'd track actual usage numbers
    console.log(`Usage tracked for user ${userId}: ${action}`);
  }

  /**
   * Get user's usage statistics
   */
  static async getUserUsage(userId: string): Promise<{
    chartGenerations: number;
    audioDuration: number;
    exports: number;
    sandboxUses: number;
  }> {
    const db = await getDatabase();
    
    // Count different types of activities
    const chartGenerations = await db.get(
      'SELECT COUNT(*) as count FROM user_activity WHERE user_id = ? AND action = ?',
      [userId, 'chart_generated']
    );

    const audioCreated = await db.get(
      'SELECT COUNT(*) as count FROM user_activity WHERE user_id = ? AND action = ?',
      [userId, 'audio_created']
    );

    const exports = await db.get(
      'SELECT COUNT(*) as count FROM user_exports WHERE user_id = ?',
      [userId]
    );

    const sandboxUses = await db.get(
      'SELECT COUNT(*) as count FROM user_activity WHERE user_id = ? AND action = ?',
      [userId, 'sandbox_used']
    );

    return {
      chartGenerations: chartGenerations?.count || 0,
      audioDuration: (audioCreated?.count || 0) * 300, // Assume 5 minutes per audio
      exports: exports?.count || 0,
      sandboxUses: sandboxUses?.count || 0
    };
  }

  /**
   * Get subscription analytics
   */
  static async getSubscriptionAnalytics(): Promise<{
    totalUsers: number;
    freeUsers: number;
    proUsers: number;
    revenue: number;
  }> {
    const db = await getDatabase();
    
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    const freeUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE subscription_plan = ?', ['free']);
    const proUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE subscription_plan IN (?, ?)', ['pro_monthly', 'pro_yearly']);
    const revenue = await db.get('SELECT SUM(amount) as total FROM checkout_sessions WHERE status = ?', ['completed']);

    return {
      totalUsers: totalUsers?.count || 0,
      freeUsers: freeUsers?.count || 0,
      proUsers: proUsers?.count || 0,
      revenue: revenue?.total || 0
    };
  }

  /**
   * Log subscription-related activity
   */
  private static async logSubscriptionActivity(userId: string, action: string, details: any): Promise<void> {
    try {
      const db = await getDatabase();
      await db.run(
        'INSERT INTO user_activity (id, user_id, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), userId, action, JSON.stringify(details), '127.0.0.1', 'AstroAudio-API', new Date().toISOString()]
      );
    } catch (error) {
      console.error('Failed to log subscription activity:', error);
    }
  }
} 
import { Request, Response } from 'express';
import { SubscriptionService, SUBSCRIPTION_PLANS } from '../services/subscriptionService';
import { AuthRequest } from '../auth';
import { z } from 'zod';

// Validation schemas
const createCheckoutSessionSchema = z.object({
  planId: z.string().refine(planId => Object.keys(SUBSCRIPTION_PLANS).includes(planId), {
    message: 'Invalid plan ID'
  })
});

const completeCheckoutSchema = z.object({
  sessionId: z.string(),
  stripeSessionId: z.string()
});

export class SubscriptionController {
  /**
   * Get all available subscription plans
   * GET /subscriptions/plans
   */
  static async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = SubscriptionService.getAllPlans();

      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription plans'
      });
    }
  }

  /**
   * Get user's current subscription
   * GET /subscriptions/current
   */
  static async getCurrentSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const subscription = await SubscriptionService.getUserSubscription(req.user.id);
      const usage = await SubscriptionService.getUserUsage(req.user.id);

      res.json({
        success: true,
        data: {
          subscription,
          usage
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription'
      });
    }
  }

  /**
   * Create checkout session for Stripe
   * POST /subscriptions/checkout
   */
  static async createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const validatedData = createCheckoutSessionSchema.parse(req.body);
      
      const checkoutSession = await SubscriptionService.createCheckoutSession(
        req.user.id,
        validatedData.planId
      );

      // In production, you would create a Stripe checkout session here
      // For now, we'll return the session data
      res.json({
        success: true,
        data: {
          sessionId: checkoutSession.id,
          amount: checkoutSession.amount,
          planId: checkoutSession.planId,
          // In production, this would be a Stripe checkout URL
          checkoutUrl: `/checkout/${checkoutSession.id}`
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create checkout session'
        });
      }
    }
  }

  /**
   * Complete checkout session (called by Stripe webhook)
   * POST /subscriptions/complete-checkout
   */
  static async completeCheckout(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = completeCheckoutSchema.parse(req.body);
      
      await SubscriptionService.completeCheckoutSession(
        validatedData.sessionId,
        validatedData.stripeSessionId
      );

      res.json({
        success: true,
        message: 'Checkout completed successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to complete checkout'
        });
      }
    }
  }

  /**
   * Cancel user subscription
   * POST /subscriptions/cancel
   */
  static async cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      await SubscriptionService.cancelSubscription(req.user.id);

      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription'
      });
    }
  }

  /**
   * Downgrade user to free plan
   * POST /subscriptions/downgrade
   */
  static async downgradeToFree(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      await SubscriptionService.downgradeToFree(req.user.id);

      res.json({
        success: true,
        message: 'Successfully downgraded to free plan'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to downgrade subscription'
      });
    }
  }

  /**
   * Check if user has access to a feature
   * POST /subscriptions/check-access
   */
  static async checkFeatureAccess(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { feature } = req.body;
      
      if (!feature || !['chartGenerations', 'audioDuration', 'exports', 'sandboxUses'].includes(feature)) {
        res.status(400).json({
          success: false,
          error: 'Invalid feature specified'
        });
        return;
      }

      const hasAccess = await SubscriptionService.checkFeatureAccess(
        req.user.id,
        feature as 'chartGenerations' | 'audioDuration' | 'exports' | 'sandboxUses'
      );

      res.json({
        success: true,
        data: {
          hasAccess,
          feature
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check feature access'
      });
    }
  }

  /**
   * Get user's usage statistics
   * GET /subscriptions/usage
   */
  static async getUserUsage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const usage = await SubscriptionService.getUserUsage(req.user.id);
      const subscription = await SubscriptionService.getUserSubscription(req.user.id);

      res.json({
        success: true,
        data: {
          usage,
          subscription
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch usage statistics'
      });
    }
  }

  /**
   * Track usage for a user
   * POST /subscriptions/track-usage
   */
  static async trackUsage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { action } = req.body;
      
      if (!action || !['chart_generated', 'audio_created', 'export_created', 'sandbox_used'].includes(action)) {
        res.status(400).json({
          success: false,
          error: 'Invalid action specified'
        });
        return;
      }

      await SubscriptionService.trackUsage(
        req.user.id,
        action as 'chart_generated' | 'audio_created' | 'export_created' | 'sandbox_used'
      );

      res.json({
        success: true,
        message: 'Usage tracked successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to track usage'
      });
    }
  }

  /**
   * Get subscription analytics (admin only)
   * GET /subscriptions/analytics
   */
  static async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // In production, you'd check if user is admin
      // For now, we'll allow any authenticated user to see analytics
      const analytics = await SubscriptionService.getSubscriptionAnalytics();

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  }

  /**
   * Simulate Stripe webhook (for development)
   * POST /subscriptions/webhook
   */
  static async stripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, stripeSessionId } = req.body;
      
      if (!sessionId || !stripeSessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID and Stripe session ID are required'
        });
        return;
      }

      await SubscriptionService.completeCheckoutSession(sessionId, stripeSessionId);

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to process webhook'
      });
    }
  }
} 
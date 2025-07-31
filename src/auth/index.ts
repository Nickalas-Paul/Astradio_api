import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  display_name?: string;
  profile_image?: string;
  birth_chart?: string; // JSON string of birth chart data
  default_genre: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_expires_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  google_id?: string;
  password_hash?: string;
  reset_token?: string;
  reset_expires?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest extends Request {
  user?: User | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'astroaudio-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  /**
   * Register a new user with proper password hashing
   */
  static async register(email: string, password: string, displayName?: string): Promise<User> {
    const db = await getDatabase();
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const userId = uuidv4();
    const user: User = {
      id: userId,
      email,
      display_name: displayName,
      default_genre: 'electronic',
      subscription_plan: 'free',
      subscription_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.run(
      'INSERT INTO users (id, email, display_name, password_hash, default_genre, subscription_plan, subscription_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user.id, user.email, user.display_name, hashedPassword, user.default_genre, user.subscription_plan, user.subscription_status, user.created_at, user.updated_at]
    );

    // Log user activity
    await this.logUserActivity(userId, 'signup', { email, displayName });

    return user;
  }

  /**
   * Login user with proper password verification
   */
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const db = await getDatabase();
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    if (user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }
    } else {
      // Handle legacy demo users
      if (password !== 'demo123') {
        throw new Error('Invalid credentials');
      }
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Log user activity
    await this.logUserActivity(user.id, 'login', { email });

    return { user, token };
  }

  /**
   * Google OAuth login/registration
   */
  static async googleAuth(googleId: string, email: string, displayName: string, profileImage?: string): Promise<{ user: User; token: string }> {
    const db = await getDatabase();
    
    // Check if user exists with Google ID
    let user = await db.get('SELECT * FROM users WHERE google_id = ?', [googleId]);
    
    if (!user) {
      // Check if user exists with email
      user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (user) {
        // Link existing account to Google
        await db.run('UPDATE users SET google_id = ?, updated_at = ? WHERE id = ?', [googleId, new Date().toISOString(), user.id]);
      } else {
        // Create new user
        const userId = uuidv4();
        user = {
          id: userId,
          email,
          display_name: displayName,
          profile_image: profileImage,
          google_id: googleId,
          default_genre: 'electronic',
          subscription_plan: 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await db.run(
          'INSERT INTO users (id, email, display_name, profile_image, google_id, default_genre, subscription_plan, subscription_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [user.id, user.email, user.display_name, user.profile_image, user.google_id, user.default_genre, user.subscription_plan, user.subscription_status, user.created_at, user.updated_at]
        );

        await this.logUserActivity(userId, 'google_signup', { email, displayName });
      }
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    await this.logUserActivity(user.id, 'google_login', { email });

    return { user, token };
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const db = await getDatabase();
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.run(
      'UPDATE users SET reset_token = ?, reset_expires = ?, updated_at = ? WHERE id = ?',
      [resetToken, resetExpires.toISOString(), new Date().toISOString(), user.id]
    );

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    await this.logUserActivity(user.id, 'password_reset_requested', { email });
  }

  /**
   * Reset password with token
   */
  static async resetPassword(email: string, resetToken: string, newPassword: string): Promise<void> {
    const db = await getDatabase();
    
    const user = await db.get('SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_expires > ?', 
      [email, resetToken, new Date().toISOString()]);
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await db.run(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL, updated_at = ? WHERE id = ?',
      [hashedPassword, new Date().toISOString(), user.id]
    );

    await this.logUserActivity(user.id, 'password_reset_completed', { email });
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      const db = await getDatabase();
      const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    return user || null;
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const db = await getDatabase();
    
    const updateFields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at' && key !== 'password_hash')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter((_, index) => {
      const key = Object.keys(updates)[index];
      return key !== 'id' && key !== 'created_at' && key !== 'password_hash';
    });

    await db.run(
      `UPDATE users SET ${updateFields}, updated_at = ? WHERE id = ?`,
      [...values, new Date().toISOString(), userId]
    );

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    await this.logUserActivity(userId, 'profile_updated', { updatedFields: Object.keys(updates) });

    return updatedUser;
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const db = await getDatabase();
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    if (user.password_hash) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }
    } else {
      // Handle legacy demo users
      if (currentPassword !== 'demo123') {
        throw new Error('Current password is incorrect');
      }
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.run(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [hashedPassword, new Date().toISOString(), userId]
    );

    await this.logUserActivity(userId, 'password_changed', {});
  }

  /**
   * Middleware to authenticate requests
   */
  static async authenticateToken(req: AuthRequest, res: any, next: any): Promise<void> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    try {
      const user = await this.verifyToken(token);
      if (!user) {
        return res.status(403).json({ success: false, error: 'Invalid token' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
  }

  /**
   * Optional authentication middleware
   */
  static async optionalAuth(req: AuthRequest, res: any, next: any): Promise<void> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const user = await this.verifyToken(token);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }

    next();
  }

  /**
   * Log user activity for security and analytics
   */
  private static async logUserActivity(userId: string, action: string, details: any): Promise<void> {
    try {
      const db = await getDatabase();
      await db.run(
        'INSERT INTO user_activity (id, user_id, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), userId, action, JSON.stringify(details), '127.0.0.1', 'AstroAudio-API', new Date().toISOString()]
      );
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  }
} 
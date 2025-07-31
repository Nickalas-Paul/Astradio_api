import { Request, Response } from 'express';
import { AuthService, AuthRequest } from './index';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const googleAuthSchema = z.object({
  googleId: z.string(),
  email: z.string().email('Invalid email format'),
  displayName: z.string(),
  profileImage: z.string().optional()
});

const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

const passwordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
  resetToken: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

const updateProfileSchema = z.object({
  display_name: z.string().optional(),
  default_genre: z.string().optional(),
  birth_chart: z.string().optional(),
  profile_image: z.string().optional()
});

export class AuthController {
  /**
   * Register a new user
   * POST /auth/signup
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const user = await AuthService.register(
        validatedData.email,
        validatedData.password,
        validatedData.displayName
      );

      const token = await AuthService.login(validatedData.email, validatedData.password);

      res.status(201).json({
        success: true,
        data: {
          user,
          token: token.token
        },
        message: 'User registered successfully'
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
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const result = await AuthService.login(validatedData.email, validatedData.password);

      res.json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else if (error instanceof Error) {
        res.status(401).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * Google OAuth authentication
   * POST /auth/google
   */
  static async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = googleAuthSchema.parse(req.body);
      
      const result = await AuthService.googleAuth(
        validatedData.googleId,
        validatedData.email,
        validatedData.displayName,
        validatedData.profileImage
      );

      res.json({
        success: true,
        data: result,
        message: 'Google authentication successful'
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
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = passwordResetRequestSchema.parse(req.body);
      
      await AuthService.requestPasswordReset(validatedData.email);

      res.json({
        success: true,
        message: 'Password reset email sent (check console for token in development)'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = passwordResetSchema.parse(req.body);
      
      await AuthService.resetPassword(
        validatedData.email,
        validatedData.resetToken,
        validatedData.newPassword
      );

      res.json({
        success: true,
        message: 'Password reset successful'
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
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   * PUT /auth/profile
   */
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const validatedData = updateProfileSchema.parse(req.body);
      
      const updatedUser = await AuthService.updateUser(req.user.id, validatedData);

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
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
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * Change password
   * POST /auth/change-password
   */
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const validatedData = changePasswordSchema.parse(req.body);
      
      await AuthService.changePassword(
        req.user.id,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
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
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * Verify token validity
   * GET /auth/verify
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'No token provided'
        });
        return;
      }

      const user = await AuthService.verifyToken(token);
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
        return;
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Logout (client-side token removal)
   * POST /auth/logout
   */
  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // In a more sophisticated system, you might blacklist the token
      // For now, we'll just return success and let the client remove the token

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user by ID (for admin or public profiles)
   * GET /auth/users/:id
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await AuthService.getUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Return limited user info for public profiles
      const publicUser = {
        id: user.id,
        display_name: user.display_name,
        profile_image: user.profile_image,
        created_at: user.created_at
      };

      res.json({
        success: true,
        data: publicUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 
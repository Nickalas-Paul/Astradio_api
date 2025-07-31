import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database';
import { User } from '../auth';

interface FriendRequest extends Request {
  user?: User;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_name?: string;
  friend_email?: string;
}

export class FriendController {
  /**
   * Send friend request
   */
  static async sendFriendRequest(req: FriendRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { friendEmail } = req.body;

      if (!friendEmail) {
        return res.status(400).json({
          success: false,
          error: 'Friend email is required'
        });
      }

      const db = await getDatabase();

      // Find friend by email
      const friend = await db.get('SELECT * FROM users WHERE email = ?', [friendEmail]);

      if (!friend) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      if (friend.id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Cannot send friend request to yourself'
        });
      }

      // Check if friend request already exists
      const existingRequest = await db.get(
        'SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
        [req.user.id, friend.id, friend.id, req.user.id]
      );

      if (existingRequest) {
        return res.status(409).json({
          success: false,
          error: 'Friend request already exists'
        });
      }

      // Create friend request
      const friendRequestId = uuidv4();
      await db.run(
        'INSERT INTO friends (id, user_id, friend_id, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [friendRequestId, req.user.id, friend.id, 'pending', new Date().toISOString()]
      );

      res.status(201).json({
        success: true,
        data: {
          id: friendRequestId,
          friend_id: friend.id,
          friend_name: friend.display_name,
          status: 'pending',
          message: 'Friend request sent successfully'
        }
      });
    } catch (error) {
      console.error('Send friend request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send friend request'
      });
    }
  }

  /**
   * Accept friend request
   */
  static async acceptFriendRequest(req: FriendRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { requestId } = req.params;
      const db = await getDatabase();

      // Find the friend request
      const friendRequest = await db.get(
        'SELECT * FROM friends WHERE id = ? AND friend_id = ? AND status = ?',
        [requestId, req.user.id, 'pending']
      );

      if (!friendRequest) {
        return res.status(404).json({
          success: false,
          error: 'Friend request not found'
        });
      }

      // Update status to accepted
      await db.run(
        'UPDATE friends SET status = ? WHERE id = ?',
        ['accepted', requestId]
      );

      res.json({
        success: true,
        data: {
          id: requestId,
          status: 'accepted',
          message: 'Friend request accepted'
        }
      });
    } catch (error) {
      console.error('Accept friend request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to accept friend request'
      });
    }
  }

  /**
   * Decline friend request
   */
  static async declineFriendRequest(req: FriendRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { requestId } = req.params;
      const db = await getDatabase();

      // Find the friend request
      const friendRequest = await db.get(
        'SELECT * FROM friends WHERE id = ? AND friend_id = ? AND status = ?',
        [requestId, req.user.id, 'pending']
      );

      if (!friendRequest) {
        return res.status(404).json({
          success: false,
          error: 'Friend request not found'
        });
      }

      // Delete the friend request
      await db.run('DELETE FROM friends WHERE id = ?', [requestId]);

      res.json({
        success: true,
        data: {
          message: 'Friend request declined'
        }
      });
    } catch (error) {
      console.error('Decline friend request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to decline friend request'
      });
    }
  }

  /**
   * Get user's friends
   */
  static async getFriends(req: FriendRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const db = await getDatabase();

      // Get accepted friends
      const friends = await db.all(`
        SELECT f.id, f.status, f.created_at,
               u.id as friend_id, u.display_name as friend_name, u.email as friend_email
        FROM friends f
        JOIN users u ON (f.friend_id = u.id OR f.user_id = u.id)
        WHERE (f.user_id = ? OR f.friend_id = ?) 
        AND f.status = 'accepted'
        AND u.id != ?
      `, [req.user.id, req.user.id, req.user.id]);

      // Get pending friend requests
      const pendingRequests = await db.all(`
        SELECT f.id, f.created_at,
               u.id as sender_id, u.display_name as sender_name, u.email as sender_email
        FROM friends f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = ? AND f.status = 'pending'
      `, [req.user.id]);

      // Get sent friend requests
      const sentRequests = await db.all(`
        SELECT f.id, f.created_at,
               u.id as recipient_id, u.display_name as recipient_name, u.email as recipient_email
        FROM friends f
        JOIN users u ON f.friend_id = u.id
        WHERE f.user_id = ? AND f.status = 'pending'
      `, [req.user.id]);

      res.json({
        success: true,
        data: {
          friends,
          pending_requests: pendingRequests,
          sent_requests: sentRequests
        }
      });
    } catch (error) {
      console.error('Get friends failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get friends'
      });
    }
  }

  /**
   * Remove friend
   */
  static async removeFriend(req: FriendRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { friendId } = req.params;
      const db = await getDatabase();

      // Find the friendship
      const friendship = await db.get(
        'SELECT * FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ?',
        [req.user.id, friendId, friendId, req.user.id, 'accepted']
      );

      if (!friendship) {
        return res.status(404).json({
          success: false,
          error: 'Friendship not found'
        });
      }

      // Delete the friendship
      await db.run(
        'DELETE FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))',
        [req.user.id, friendId, friendId, req.user.id]
      );

      res.json({
        success: true,
        data: {
          message: 'Friend removed successfully'
        }
      });
    } catch (error) {
      console.error('Remove friend failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove friend'
      });
    }
  }

  /**
   * Get friend's sessions (for overlay compatibility - requires Pro subscription)
   */
  static async getFriendSessions(req: FriendRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { friendId } = req.params;
      const db = await getDatabase();

      // Check if they are friends
      const friendship = await db.get(
        'SELECT * FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ?',
        [req.user.id, friendId, friendId, req.user.id, 'accepted']
      );

      if (!friendship) {
        return res.status(403).json({
          success: false,
          error: 'You can only view sessions of your friends'
        });
      }

      // Check if user has Pro subscription for overlay compatibility
      const user = await db.get('SELECT subscription_plan FROM users WHERE id = ?', [req.user.id]);
      
      if (user.subscription_plan !== 'pro') {
        return res.status(403).json({
          success: false,
          error: 'Pro subscription required for overlay compatibility with friends. Upgrade to compare charts and create overlays.'
        });
      }

      // Get friend's public sessions
      const sessions = await db.all(`
        SELECT id, title, description, play_count, like_count, created_at
        FROM sessions 
        WHERE user_id = ? AND is_public = 1
        ORDER BY created_at DESC
      `, [friendId]);

      // Get friend's info
      const friend = await db.get('SELECT id, display_name, email FROM users WHERE id = ?', [friendId]);

      res.json({
        success: true,
        data: {
          friend: {
            id: friend.id,
            name: friend.display_name,
            email: friend.email
          },
          sessions
        }
      });
    } catch (error) {
      console.error('Get friend sessions failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get friend sessions'
      });
    }
  }

  /**
   * Search for users to add as friends
   */
  static async searchUsers(req: FriendRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { query } = req.query;
      const db = await getDatabase();

      if (!query || String(query).length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters'
        });
      }

      // Search users by name or email
      const users = await db.all(`
        SELECT id, display_name, email
        FROM users 
        WHERE (display_name LIKE ? OR email LIKE ?)
        AND id != ?
        LIMIT 10
      `, [`%${query}%`, `%${query}%`, req.user.id]);

      // Check friendship status for each user
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const friendship = await db.get(
            'SELECT status FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))',
            [req.user!.id, user.id, user.id, req.user!.id]
          );

          return {
            ...user,
            friendship_status: friendship ? friendship.status : null
          };
        })
      );

      res.json({
        success: true,
        data: {
          users: usersWithStatus
        }
      });
    } catch (error) {
      console.error('Search users failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search users'
      });
    }
  }
} 
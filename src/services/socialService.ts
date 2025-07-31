import { getDatabase } from '../database';
import { User } from '../auth';

export interface FriendRequest {
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface SocialStats {
  followers: number;
  following: number;
  totalSessions: number;
  totalLikes: number;
  totalPlays: number;
}

export class SocialService {
  /**
   * Send friend request
   */
  static async sendFriendRequest(userId: string, friendId: string): Promise<void> {
    const db = await getDatabase();
    
    // Check if request already exists
    const existingRequest = await db.get(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ?',
      [userId, friendId]
    );

    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    // Check if reverse request exists
    const reverseRequest = await db.get(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ?',
      [friendId, userId]
    );

    if (reverseRequest) {
      // Accept the reverse request
      await db.run(
        'UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?',
        ['accepted', friendId, userId]
      );
      
      // Create accepted request
      await db.run(
        'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
        [userId, friendId, 'accepted']
      );
    } else {
      // Create new pending request
      await db.run(
        'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
        [userId, friendId, 'pending']
      );
    }
  }

  /**
   * Accept friend request
   */
  static async acceptFriendRequest(userId: string, friendId: string): Promise<void> {
    const db = await getDatabase();
    
    // Update the pending request to accepted
    await db.run(
      'UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ? AND status = ?',
      ['accepted', friendId, userId, 'pending']
    );

    // Create reverse accepted relationship
    await db.run(
      'INSERT OR REPLACE INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
      [userId, friendId, 'accepted']
    );
  }

  /**
   * Reject friend request
   */
  static async rejectFriendRequest(userId: string, friendId: string): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      'DELETE FROM friends WHERE user_id = ? AND friend_id = ? AND status = ?',
      [friendId, userId, 'pending']
    );
  }

  /**
   * Unfriend user
   */
  static async unfriendUser(userId: string, friendId: string): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      'DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendId, friendId, userId]
    );
  }

  /**
   * Block user
   */
  static async blockUser(userId: string, friendId: string): Promise<void> {
    const db = await getDatabase();
    
    // Remove existing friendship
    await db.run(
      'DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendId, friendId, userId]
    );

    // Create blocked relationship
    await db.run(
      'INSERT OR REPLACE INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
      [userId, friendId, 'blocked']
    );
  }

  /**
   * Get user's friends
   */
  static async getUserFriends(userId: string): Promise<User[]> {
    const db = await getDatabase();
    
    const friends = await db.all(
      `SELECT u.* FROM users u
       JOIN friends f ON u.id = f.friend_id
       WHERE f.user_id = ? AND f.status = 'accepted'
       ORDER BY u.display_name`,
      [userId]
    );

    return friends;
  }

  /**
   * Get user's followers
   */
  static async getUserFollowers(userId: string): Promise<User[]> {
    const db = await getDatabase();
    
    const followers = await db.all(
      `SELECT u.* FROM users u
       JOIN friends f ON u.id = f.user_id
       WHERE f.friend_id = ? AND f.status = 'accepted'
       ORDER BY u.display_name`,
      [userId]
    );

    return followers;
  }

  /**
   * Get pending friend requests
   */
  static async getPendingFriendRequests(userId: string): Promise<User[]> {
    const db = await getDatabase();
    
    const requests = await db.all(
      `SELECT u.* FROM users u
       JOIN friends f ON u.id = f.user_id
       WHERE f.friend_id = ? AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return requests;
  }

  /**
   * Get user's social stats
   */
  static async getUserSocialStats(userId: string): Promise<SocialStats> {
    const db = await getDatabase();
    
    const followers = await db.get(
      'SELECT COUNT(*) as count FROM friends WHERE friend_id = ? AND status = ?',
      [userId, 'accepted']
    );

    const following = await db.get(
      'SELECT COUNT(*) as count FROM friends WHERE user_id = ? AND status = ?',
      [userId, 'accepted']
    );

    const sessions = await db.get(
      'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
      [userId]
    );

    const likes = await db.get(
      'SELECT COUNT(*) as count FROM session_likes WHERE user_id = ?',
      [userId]
    );

    const plays = await db.get(
      'SELECT SUM(play_count) as count FROM sessions WHERE user_id = ?',
      [userId]
    );

    return {
      followers: followers.count,
      following: following.count,
      totalSessions: sessions.count,
      totalLikes: likes.count,
      totalPlays: plays.count || 0
    };
  }

  /**
   * Get friends' recent activity
   */
  static async getFriendsActivity(userId: string, limit = 20): Promise<any[]> {
    const db = await getDatabase();
    
    const activity = await db.all(
      `SELECT s.*, u.display_name, u.profile_image
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       JOIN friends f ON s.user_id = f.friend_id
       WHERE f.user_id = ? AND f.status = 'accepted' AND s.is_public = 1
       ORDER BY s.created_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    return activity.map(item => ({
      ...item,
      chart_data: JSON.parse(item.chart_data),
      audio_config: item.audio_config ? JSON.parse(item.audio_config) : undefined,
      narration: item.narration ? JSON.parse(item.narration) : undefined,
      tags: item.tags ? JSON.parse(item.tags) : []
    }));
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, limit = 20): Promise<User[]> {
    const db = await getDatabase();
    
    const users = await db.all(
      `SELECT * FROM users 
       WHERE display_name LIKE ? OR email LIKE ?
       ORDER BY display_name
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, limit]
    );

    return users;
  }

  /**
   * Get user profile with stats
   */
  static async getUserProfile(userId: string): Promise<{
    user: User;
    stats: SocialStats;
    recentSessions: any[];
  }> {
    const db = await getDatabase();
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }

    const stats = await this.getUserSocialStats(userId);
    
    const recentSessions = await db.all(
      `SELECT * FROM sessions 
       WHERE user_id = ? AND is_public = 1
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    const sessionsWithData = recentSessions.map(session => ({
      ...session,
      chart_data: JSON.parse(session.chart_data),
      audio_config: session.audio_config ? JSON.parse(session.audio_config) : undefined,
      narration: session.narration ? JSON.parse(session.narration) : undefined,
      tags: session.tags ? JSON.parse(session.tags) : []
    }));

    return {
      user,
      stats,
      recentSessions: sessionsWithData
    };
  }
} 
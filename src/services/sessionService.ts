import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../auth';

export interface Session {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  chart_data: any;
  audio_config?: any;
  narration?: any;
  export_links?: any;
  is_public: boolean;
  tags?: string[];
  remix_of_session_id?: string;
  play_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionData {
  title?: string;
  description?: string;
  chart_data: any;
  audio_config?: any;
  narration?: any;
  is_public?: boolean;
  tags?: string[];
  remix_of_session_id?: string;
}

export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(userId: string, data: CreateSessionData): Promise<Session> {
    const db = await getDatabase();
    
    const sessionId = uuidv4();
    const now = new Date().toISOString();
    
    const session: Session = {
      id: sessionId,
      user_id: userId,
      title: data.title,
      description: data.description,
      chart_data: data.chart_data,
      audio_config: data.audio_config,
      narration: data.narration,
      export_links: {},
      is_public: data.is_public || false,
      tags: data.tags || [],
      remix_of_session_id: data.remix_of_session_id,
      play_count: 0,
      like_count: 0,
      created_at: now,
      updated_at: now
    };

    await db.run(
      `INSERT INTO sessions (
        id, user_id, title, description, chart_data, audio_config, narration, 
        export_links, is_public, tags, remix_of_session_id, play_count, like_count, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id, session.user_id, session.title, session.description,
        JSON.stringify(session.chart_data), JSON.stringify(session.audio_config),
        JSON.stringify(session.narration), JSON.stringify(session.export_links),
        session.is_public, JSON.stringify(session.tags), session.remix_of_session_id,
        session.play_count, session.like_count, session.created_at, session.updated_at
      ]
    );

    return session;
  }

  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: string): Promise<Session | null> {
    const db = await getDatabase();
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    
    if (!session) return null;

    return {
      ...session,
      chart_data: JSON.parse(session.chart_data),
      audio_config: session.audio_config ? JSON.parse(session.audio_config) : undefined,
      narration: session.narration ? JSON.parse(session.narration) : undefined,
      export_links: session.export_links ? JSON.parse(session.export_links) : {},
      tags: session.tags ? JSON.parse(session.tags) : []
    };
  }

  /**
   * Get user's sessions
   */
  static async getUserSessions(userId: string, limit = 20, offset = 0): Promise<Session[]> {
    const db = await getDatabase();
    const sessions = await db.all(
      'SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    return sessions.map(session => ({
      ...session,
      chart_data: JSON.parse(session.chart_data),
      audio_config: session.audio_config ? JSON.parse(session.audio_config) : undefined,
      narration: session.narration ? JSON.parse(session.narration) : undefined,
      export_links: session.export_links ? JSON.parse(session.export_links) : {},
      tags: session.tags ? JSON.parse(session.tags) : []
    }));
  }

  /**
   * Get public sessions
   */
  static async getPublicSessions(limit = 20, offset = 0, sortBy = 'created_at'): Promise<Session[]> {
    const db = await getDatabase();
    const sessions = await db.all(
      `SELECT * FROM sessions WHERE is_public = 1 ORDER BY ${sortBy} DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return sessions.map(session => ({
      ...session,
      chart_data: JSON.parse(session.chart_data),
      audio_config: session.audio_config ? JSON.parse(session.audio_config) : undefined,
      narration: session.narration ? JSON.parse(session.narration) : undefined,
      export_links: session.export_links ? JSON.parse(session.export_links) : {},
      tags: session.tags ? JSON.parse(session.tags) : []
    }));
  }

  /**
   * Update session
   */
  static async updateSession(sessionId: string, userId: string, updates: Partial<Session>): Promise<Session> {
    const db = await getDatabase();
    
    // Verify ownership
    const existingSession = await this.getSessionById(sessionId);
    if (!existingSession || existingSession.user_id !== userId) {
      throw new Error('Session not found or access denied');
    }

    const updateFields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter((_, index) => {
      const key = Object.keys(updates)[index];
      return key !== 'id' && key !== 'user_id' && key !== 'created_at';
    });

    // Handle JSON fields
    const jsonFields = ['chart_data', 'audio_config', 'narration', 'export_links', 'tags'];
    const processedValues = values.map((value, index) => {
      const key = Object.keys(updates)[index];
      return jsonFields.includes(key) ? JSON.stringify(value) : value;
    });

    await db.run(
      `UPDATE sessions SET ${updateFields}, updated_at = ? WHERE id = ? AND user_id = ?`,
      [...processedValues, new Date().toISOString(), sessionId, userId]
    );

    const updatedSession = await this.getSessionById(sessionId);
    if (!updatedSession) {
      throw new Error('Failed to update session');
    }

    return updatedSession;
  }

  /**
   * Delete session
   */
  static async deleteSession(sessionId: string, userId: string): Promise<void> {
    const db = await getDatabase();
    
    // Verify ownership
    const existingSession = await this.getSessionById(sessionId);
    if (!existingSession || existingSession.user_id !== userId) {
      throw new Error('Session not found or access denied');
    }

    await db.run('DELETE FROM sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
  }

  /**
   * Increment play count
   */
  static async incrementPlayCount(sessionId: string): Promise<void> {
    const db = await getDatabase();
    await db.run('UPDATE sessions SET play_count = play_count + 1 WHERE id = ?', [sessionId]);
  }

  /**
   * Like/unlike session
   */
  static async toggleLike(sessionId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const db = await getDatabase();
    
    // Check if already liked
    const existingLike = await db.get(
      'SELECT * FROM session_likes WHERE session_id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (existingLike) {
      // Unlike
      await db.run(
        'DELETE FROM session_likes WHERE session_id = ? AND user_id = ?',
        [sessionId, userId]
      );
      await db.run('UPDATE sessions SET like_count = like_count - 1 WHERE id = ?', [sessionId]);
      
      const session = await db.get('SELECT like_count FROM sessions WHERE id = ?', [sessionId]);
      return { liked: false, likeCount: session.like_count };
    } else {
      // Like
      await db.run(
        'INSERT INTO session_likes (session_id, user_id) VALUES (?, ?)',
        [sessionId, userId]
      );
      await db.run('UPDATE sessions SET like_count = like_count + 1 WHERE id = ?', [sessionId]);
      
      const session = await db.get('SELECT like_count FROM sessions WHERE id = ?', [sessionId]);
      return { liked: true, likeCount: session.like_count };
    }
  }

  /**
   * Add comment to session
   */
  static async addComment(sessionId: string, userId: string, comment: string): Promise<void> {
    const db = await getDatabase();
    const commentId = uuidv4();
    
    await db.run(
      'INSERT INTO session_comments (id, session_id, user_id, comment) VALUES (?, ?, ?, ?)',
      [commentId, sessionId, userId, comment]
    );
  }

  /**
   * Get session comments
   */
  static async getSessionComments(sessionId: string, limit = 50, offset = 0): Promise<any[]> {
    const db = await getDatabase();
    return await db.all(
      `SELECT c.*, u.display_name, u.profile_image 
       FROM session_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.session_id = ? 
       ORDER BY c.created_at DESC 
       LIMIT ? OFFSET ?`,
      [sessionId, limit, offset]
    );
  }

  /**
   * Search sessions
   */
  static async searchSessions(query: string, limit = 20, offset = 0): Promise<Session[]> {
    const db = await getDatabase();
    const searchTerm = `%${query}%`;
    
    const sessions = await db.all(
      `SELECT * FROM sessions 
       WHERE is_public = 1 
       AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, limit, offset]
    );

    return sessions.map(session => ({
      ...session,
      chart_data: JSON.parse(session.chart_data),
      audio_config: session.audio_config ? JSON.parse(session.audio_config) : undefined,
      narration: session.narration ? JSON.parse(session.narration) : undefined,
      export_links: session.export_links ? JSON.parse(session.export_links) : {},
      tags: session.tags ? JSON.parse(session.tags) : []
    }));
  }
} 
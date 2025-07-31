import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database';
import { User } from '../auth';

interface SessionRequest extends Request {
  user?: User;
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
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

export class SessionController {
  /**
   * Save a new session
   */
  static async saveSession(req: SessionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { title, description, chart_data, audio_config, narration, is_public, tags, remix_of_session_id } = req.body;

      if (!chart_data) {
        return res.status(400).json({
          success: false,
          error: 'Chart data is required'
        });
      }

      // Check subscription limits for free users
      const db = await getDatabase();
      const user = await db.get('SELECT subscription_plan FROM users WHERE id = ?', [req.user.id]);
      
      if (user.subscription_plan === 'free') {
        const sessionCount = await db.get(
          'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
          [req.user.id]
        );
        
        if (sessionCount.count >= 1) {
          return res.status(403).json({
            success: false,
            error: 'Free users can only save 1 session. Upgrade to Pro for unlimited sessions.'
          });
        }
      }

      const sessionId = uuidv4();
      const now = new Date().toISOString();

      const session: Session = {
        id: sessionId,
        user_id: req.user.id,
        title: title || 'Untitled Session',
        description,
        chart_data: JSON.stringify(chart_data),
        audio_config: audio_config ? JSON.stringify(audio_config) : null,
        narration: narration ? JSON.stringify(narration) : null,
        export_links: null,
        is_public: is_public || false,
        tags: tags || [],
        remix_of_session_id,
        play_count: 0,
        like_count: 0,
        created_at: now,
        updated_at: now
      };

      await db.run(`
        INSERT INTO sessions (
          id, user_id, title, description, chart_data, audio_config, narration,
          export_links, is_public, tags, remix_of_session_id, play_count, like_count,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        session.id, session.user_id, session.title, session.description,
        session.chart_data, session.audio_config, session.narration,
        session.export_links, session.is_public ? 1 : 0, session.tags ? JSON.stringify(session.tags) : null,
        session.remix_of_session_id, session.play_count, session.like_count,
        session.created_at, session.updated_at
      ]);

      res.status(201).json({
        success: true,
        data: {
          id: session.id,
          title: session.title,
          description: session.description,
          is_public: session.is_public,
          created_at: session.created_at
        }
      });
    } catch (error) {
      console.error('Save session failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save session'
      });
    }
  }

  /**
   * Get user's sessions
   */
  static async getUserSessions(req: SessionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { limit = 20, offset = 0 } = req.query;
      const db = await getDatabase();

      const sessions = await db.all(`
        SELECT id, title, description, is_public, play_count, like_count, created_at, updated_at
        FROM sessions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [req.user.id, Number(limit), Number(offset)]);

      const total = await db.get(
        'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
        [req.user.id]
      );

      res.json({
        success: true,
        data: {
          sessions: sessions.map(s => ({
            ...s,
            chart_data: null, // Don't include full chart data in list
            audio_config: null,
            narration: null
          })),
          pagination: {
            total: total.count,
            limit: Number(limit),
            offset: Number(offset),
            has_more: Number(offset) + sessions.length < total.count
          }
        }
      });
    } catch (error) {
      console.error('Get user sessions failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sessions'
      });
    }
  }

  /**
   * Get a specific session by ID
   */
  static async getSession(req: SessionRequest, res: Response) {
    try {
      const { id } = req.params;
      const db = await getDatabase();

      const session = await db.get('SELECT * FROM sessions WHERE id = ?', [id]);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      // Check if user can access this session
      if (!session.is_public && (!req.user || session.user_id !== req.user.id)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Increment play count if not the owner
      if (req.user && session.user_id !== req.user.id) {
        await db.run(
          'UPDATE sessions SET play_count = play_count + 1 WHERE id = ?',
          [id]
        );
      }

      res.json({
        success: true,
        data: {
          id: session.id,
          title: session.title,
          description: session.description,
          chart_data: JSON.parse(session.chart_data),
          audio_config: session.audio_config ? JSON.parse(session.audio_config) : null,
          narration: session.narration ? JSON.parse(session.narration) : null,
          export_links: session.export_links ? JSON.parse(session.export_links) : null,
          is_public: Boolean(session.is_public),
          tags: session.tags ? JSON.parse(session.tags) : [],
          remix_of_session_id: session.remix_of_session_id,
          play_count: session.play_count,
          like_count: session.like_count,
          created_at: session.created_at,
          updated_at: session.updated_at,
          owner_id: session.user_id
        }
      });
    } catch (error) {
      console.error('Get session failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get session'
      });
    }
  }

  /**
   * Update session
   */
  static async updateSession(req: SessionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { id } = req.params;
      const { title, description, is_public, tags } = req.body;

      const db = await getDatabase();
      const session = await db.get('SELECT * FROM sessions WHERE id = ?', [id]);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      if (session.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (is_public !== undefined) updates.is_public = is_public;
      if (tags !== undefined) updates.tags = JSON.stringify(tags);
      updates.updated_at = new Date().toISOString();

      const updateFields = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');

      await db.run(
        `UPDATE sessions SET ${updateFields} WHERE id = ?`,
        [...Object.values(updates), id]
      );

      res.json({
        success: true,
        data: {
          id,
          title: updates.title || session.title,
          description: updates.description || session.description,
          is_public: updates.is_public !== undefined ? updates.is_public : session.is_public,
          tags: updates.tags ? JSON.parse(updates.tags) : (session.tags ? JSON.parse(session.tags) : []),
          updated_at: updates.updated_at
        }
      });
    } catch (error) {
      console.error('Update session failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update session'
      });
    }
  }

  /**
   * Delete session
   */
  static async deleteSession(req: SessionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { id } = req.params;
      const db = await getDatabase();

      const session = await db.get('SELECT * FROM sessions WHERE id = ?', [id]);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      if (session.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      await db.run('DELETE FROM sessions WHERE id = ?', [id]);

      res.json({
        success: true,
        data: {
          message: 'Session deleted successfully'
        }
      });
    } catch (error) {
      console.error('Delete session failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete session'
      });
    }
  }

  /**
   * Get public sessions
   */
  static async getPublicSessions(req: Request, res: Response) {
    try {
      const { limit = 20, offset = 0, sortBy = 'created_at' } = req.query;
      const db = await getDatabase();

      const validSortFields = ['created_at', 'play_count', 'like_count'];
      const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'created_at';

      const sessions = await db.all(`
        SELECT s.id, s.title, s.description, s.play_count, s.like_count, s.created_at,
               u.display_name as owner_name
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.is_public = 1
        ORDER BY s.${sortField} DESC
        LIMIT ? OFFSET ?
      `, [Number(limit), Number(offset)]);

      const total = await db.get(
        'SELECT COUNT(*) as count FROM sessions WHERE is_public = 1'
      );

      res.json({
        success: true,
        data: {
          sessions,
          pagination: {
            total: total.count,
            limit: Number(limit),
            offset: Number(offset),
            has_more: Number(offset) + sessions.length < total.count
          }
        }
      });
    } catch (error) {
      console.error('Get public sessions failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get public sessions'
      });
    }
  }

  /**
   * Like/unlike a session
   */
  static async toggleLike(req: SessionRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { id } = req.params;
      const db = await getDatabase();

      const session = await db.get('SELECT * FROM sessions WHERE id = ?', [id]);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      if (!session.is_public) {
        return res.status(403).json({
          success: false,
          error: 'Cannot like private sessions'
        });
      }

      // Check if user already liked this session
      const existingLike = await db.get(
        'SELECT * FROM session_likes WHERE session_id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (existingLike) {
        // Unlike
        await db.run(
          'DELETE FROM session_likes WHERE session_id = ? AND user_id = ?',
          [id, req.user.id]
        );
        await db.run(
          'UPDATE sessions SET like_count = like_count - 1 WHERE id = ?',
          [id]
        );

        res.json({
          success: true,
          data: { liked: false, message: 'Session unliked' }
        });
      } else {
        // Like
        await db.run(
          'INSERT INTO session_likes (session_id, user_id, created_at) VALUES (?, ?, ?)',
          [id, req.user.id, new Date().toISOString()]
        );
        await db.run(
          'UPDATE sessions SET like_count = like_count + 1 WHERE id = ?',
          [id]
        );

        res.json({
          success: true,
          data: { liked: true, message: 'Session liked' }
        });
      }
    } catch (error) {
      console.error('Toggle like failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle like'
      });
    }
  }
} 
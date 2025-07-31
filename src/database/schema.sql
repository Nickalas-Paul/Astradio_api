-- AstroAudio Database Schema (Phase 6.3-6.4)
-- User System, Sessions, Social Features, Security, and Monetization

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    profile_image TEXT,
    birth_chart TEXT, -- JSON string of birth chart data
    default_genre TEXT DEFAULT 'electronic',
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_expires_at DATETIME,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    google_id TEXT,
    password_hash TEXT,
    reset_token TEXT,
    reset_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (saved compositions)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    description TEXT,
    chart_data TEXT NOT NULL, -- JSON string
    audio_config TEXT, -- JSON string
    narration TEXT, -- JSON string
    export_links TEXT, -- JSON string of export URLs
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT, -- JSON array of tags
    remix_of_session_id TEXT,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (remix_of_session_id) REFERENCES sessions(id)
);

-- Friends/Follows table (social graph)
CREATE TABLE IF NOT EXISTS friends (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id)
);

-- Daily charts table (automated daily compositions)
CREATE TABLE IF NOT EXISTS daily_charts (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE, -- YYYY-MM-DD format
    chart_data TEXT NOT NULL, -- JSON string
    narration TEXT, -- JSON string
    audio_config TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Session likes table
CREATE TABLE IF NOT EXISTS session_likes (
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, user_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Session comments table
CREATE TABLE IF NOT EXISTS session_comments (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User exports table (tracking export usage)
CREATE TABLE IF NOT EXISTS user_exports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT,
    export_type TEXT NOT NULL, -- 'midi', 'mp3', 'wav', 'pdf', 'narration'
    file_path TEXT,
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Checkout sessions table (for Stripe integration)
CREATE TABLE IF NOT EXISTS checkout_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    stripe_session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User activity log (for security and analytics)
CREATE TABLE IF NOT EXISTS user_activity (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'login', 'logout', 'chart_generated', 'session_saved', 'export_created'
    details TEXT, -- JSON string with additional details
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rate limiting table (for security)
CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY, -- IP address or user ID
    requests INTEGER DEFAULT 1,
    window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User sessions (for tracking user's saved sessions)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_public ON sessions(is_public);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_play_count ON sessions(play_count);
CREATE INDEX IF NOT EXISTS idx_sessions_like_count ON sessions(like_count);

-- Friends indexes
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Daily charts index
CREATE INDEX IF NOT EXISTS idx_daily_charts_date ON daily_charts(date);

-- Session likes index
CREATE INDEX IF NOT EXISTS idx_session_likes_session_id ON session_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_likes_user_id ON session_likes(user_id);

-- Session comments index
CREATE INDEX IF NOT EXISTS idx_session_comments_session_id ON session_comments(session_id);

-- User exports indexes
CREATE INDEX IF NOT EXISTS idx_user_exports_user_id ON user_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exports_created_at ON user_exports(created_at);

-- Checkout sessions indexes
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);

-- User activity indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

-- Rate limiting indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start); 
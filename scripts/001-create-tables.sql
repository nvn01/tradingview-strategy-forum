-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pinescript_code TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategy_reports table
CREATE TABLE IF NOT EXISTS strategy_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  exchange TEXT,
  report_date DATE,
  
  -- Performance metrics
  net_profit_usdt DECIMAL,
  net_profit_percent DECIMAL,
  gross_profit_usdt DECIMAL,
  gross_profit_percent DECIMAL,
  gross_loss_usdt DECIMAL,
  gross_loss_percent DECIMAL,
  max_drawdown_usdt DECIMAL,
  max_drawdown_percent DECIMAL,
  
  -- Trade analysis
  total_trades INTEGER,
  winning_trades INTEGER,
  losing_trades INTEGER,
  percent_profitable DECIMAL,
  avg_winning_trade_usdt DECIMAL,
  avg_losing_trade_usdt DECIMAL,
  largest_winning_trade_usdt DECIMAL,
  largest_losing_trade_usdt DECIMAL,
  
  -- Risk metrics
  sharpe_ratio DECIMAL,
  sortino_ratio DECIMAL,
  profit_factor DECIMAL,
  
  -- Raw JSON data
  raw_data JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trades table for individual trade records
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES strategy_reports(id) ON DELETE CASCADE,
  trade_number INTEGER NOT NULL,
  entry_type TEXT, -- 'long' or 'short'
  entry_signal TEXT,
  entry_datetime TIMESTAMP WITH TIME ZONE,
  entry_price DECIMAL,
  exit_signal TEXT,
  exit_datetime TIMESTAMP WITH TIME ZONE,
  exit_price DECIMAL,
  contracts DECIMAL,
  profit_usdt DECIMAL,
  profit_percent DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, strategy_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_reports_strategy_id ON strategy_reports(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_reports_symbol ON strategy_reports(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_report_id ON trades(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_strategy_id ON comments(strategy_id);
CREATE INDEX IF NOT EXISTS idx_likes_strategy_id ON likes(strategy_id);

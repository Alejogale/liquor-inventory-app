-- Enable the net extension for HTTP requests in Supabase
-- Run this in your Supabase SQL Editor first

-- Enable the net extension
CREATE EXTENSION IF NOT EXISTS "net";

-- Verify it's enabled
SELECT * FROM pg_extension WHERE extname = 'net';
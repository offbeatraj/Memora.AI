
-- Create a table for storing API keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_type TEXT NOT NULL UNIQUE,
  key_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Add an index on key_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key_type ON public.api_keys (key_type);

-- Insert the OpenAI API key 
INSERT INTO public.api_keys (key_type, key_value) 
VALUES ('openai', 'sk-zAFSEFXcTYKcY1E7EfoVE8D51olgUwFPnI35XOnQXMdOjmqZUgbWxcqJNsiCJ4kETwFCVSuy0LjqlJUFf2/aa8+AtXq8BxdShKnbSOPa4AQ=') 
ON CONFLICT (key_type) DO UPDATE SET key_value = EXCLUDED.key_value, updated_at = now();



-- Function to safely get API key value by type
CREATE OR REPLACE FUNCTION public.get_api_key(key_type_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_value TEXT;
BEGIN
  SELECT a.key_value INTO key_value
  FROM public.api_keys a
  WHERE a.key_type = key_type_param
  AND a.is_active = true;
  
  RETURN key_value;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.get_api_key(TEXT) TO anon, authenticated, service_role;

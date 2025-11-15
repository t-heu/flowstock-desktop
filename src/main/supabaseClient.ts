import { createClient } from '@supabase/supabase-js';

//const SUPABASE_ANON_KEY = import.meta.env.MAIN_VITE_SUPABASE_KEY;
const supabseUrl = import.meta.env.MAIN_VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.MAIN_VITE_SUPABASE_SERVICE_ROLE_KEY;

const SUPABASE_URL = supabseUrl;

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

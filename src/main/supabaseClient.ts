import { createClient } from '@supabase/supabase-js';

const supabaseKey = import.meta.env.MAIN_VITE_SUPABASE_KEY;
const supabseUrl = import.meta.env.MAIN_VITE_SUPABASE_URL;

const SUPABASE_URL = supabseUrl;
const SUPABASE_ANON_KEY = supabaseKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

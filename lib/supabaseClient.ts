import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL="https://mvqgdppbfikhcbwgkskx.supabase.co"
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cWdkcHBiZmlraGNid2drc2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2ODAwMTEsImV4cCI6MjA1ODI1NjAxMX0.KABeGhRwaWsqoQbymXwy_wONZnOa2P_BTcNMeP_fPiU"

const supabaseUrl = SUPABASE_URL!;
const supabaseAnonKey = SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


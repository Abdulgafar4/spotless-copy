import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL="https://xehwtihslletcqcxaust.supabase.co"
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaHd0aWhzbGxldGNxY3hhdXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODU2MTYsImV4cCI6MjA1ODc2MTYxNn0.MKjFvmI2Bx4naFbxMPoDyR0UL6e2lIm6jG92Y9o_Wts"

const supabaseUrl = SUPABASE_URL!;
const supabaseAnonKey = SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


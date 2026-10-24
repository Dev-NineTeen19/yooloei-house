import { createClient } from "@supabase/supabase-js";

// ดึงค่า URL และ anon Key ของโครงการ yooloei (hcfjifukpydaicnrdzsi)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hcfjifukpydaicnrdzsi.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZmppZnVrcHlkYWljbnJkenNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3ODMwNDEsImV4cCI6MjEwODM1OTA0MX0.rBKyyDm7UQrEFI2n-sWKV5ENe6WaQzVmC7432cF-Bjw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;

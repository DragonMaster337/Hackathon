import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://kepnlabcvbylqgnibwrv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VXdq8PCXqHg3RFWHPFhfxQ_2YmTVxJ8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

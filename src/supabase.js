import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jfjodrwsxsxgzexeozxm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    import.meta.env.VITE_SUPABASE_ANON_KEY || 
                    'sb_publishable_lmDze_4U_YEzhh12-YqREQ_Zwr4bSHD';

export const supabase = createClient(supabaseUrl, supabaseKey);

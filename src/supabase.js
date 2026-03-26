import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfjodrwsxsxgzexeozxm.supabase.co';
const supabaseKey = 'sb_publishable_lmDze_4U_YEzhh12-YqREQ_Zwr4bSHD';

export const supabase = createClient(supabaseUrl, supabaseKey);

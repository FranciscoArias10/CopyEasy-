
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://pemxcakymzhmemnkzwwf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbXhjYWt5bXpobWVtbmt6d3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjcyNjIsImV4cCI6MjA4NDYwMzI2Mn0.DIl-xpQ5aJbaZ1nQt_DO-n_siHgQ1BNqFoVu96CdVwM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

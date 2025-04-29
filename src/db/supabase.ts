import { createClient } from '@supabase/supabase-js';

console.log('Initializing Supabase client...');

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);
console.log('Service Role Key exists:', !!serviceRoleKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with custom configuration
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-application-name': 'translations-factory'
    }
  }
});

// Create a service role client that can bypass RLS
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-application-name': 'translations-factory-admin'
    }
  }
});

// Test connection to Supabase
async function testConnection() {
  console.log('=== Starting Supabase Connection Test ===');
  try {
    console.log('1. Testing auth connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth connection test failed:', {
        message: authError.message,
        status: authError.status
      });
      return false;
    }
    console.log('✅ Auth connection successful');

    console.log('2. Testing database connection...');
    const { data: dbData, error: dbError } = await supabase
      .from('texts')
      .select('count')
      .limit(1)
      .single();
    
    if (dbError) {
      console.error('❌ Database connection test failed:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      });
      return false;
    }
    console.log('✅ Database connection successful');

    console.log('✅ All connection tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  } finally {
    console.log('=== Supabase Connection Test Complete ===');
  }
}

// Test connection but don't exit on failure
console.log('Running initial connection test...');
await testConnection().then(success => {
  if (!success) {
    console.warn('⚠️ Supabase connection test failed. The application will continue but database operations may fail.');
  }
});

export { supabase, supabaseAdmin }; 
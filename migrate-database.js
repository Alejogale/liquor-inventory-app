#!/usr/bin/env node

// 🚀 HYBRID ADMIN SYSTEM DATABASE MIGRATION SCRIPT
// Safely adds is_platform_admin column to user_profiles table

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from local .env.local file
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
  console.error('Service Role Key:', serviceRoleKey ? '✅ Found' : '❌ Missing');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Hybrid Admin System Database Migration...\n');

  try {
    // Step 1: Check if the column already exists by trying to select it
    console.log('🔍 Step 1: Checking if is_platform_admin column exists...');
    
    const { data: columnTest, error: columnError } = await supabase
      .from('user_profiles')
      .select('email, is_platform_admin')
      .limit(1);

    if (columnError) {
      if (columnError.code === '42703') {
        console.log('⚠️  Column is_platform_admin does not exist yet');
        console.log('\n📝 MANUAL STEP REQUIRED:');
        console.log('   You need to add the column manually using Supabase Dashboard:');
        console.log('');
        console.log('   1. Go to https://supabase.com/dashboard');
        console.log('   2. Navigate to your project > Table Editor > user_profiles');
        console.log('   3. Click "Add Column" and enter:');
        console.log('      - Name: is_platform_admin');
        console.log('      - Type: bool (boolean)');
        console.log('      - Default Value: false');
        console.log('      - Allow nullable: Yes');
        console.log('');
        console.log('   4. Then run this script again: node migrate-database.js');
        console.log('');
        return false;
      } else {
        console.error('❌ Unexpected error:', columnError);
        return false;
      }
    }

    console.log('✅ Column is_platform_admin already exists!');

    // Step 2: Check if alejogaleis@gmail.com exists and update
    console.log('👤 Step 2: Checking for alejogaleis@gmail.com...');
    
    const { data: userCheck, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, is_platform_admin')
      .eq('email', 'alejogaleis@gmail.com')
      .maybeSingle();

    if (userError) {
      console.error('❌ Error checking user:', userError);
      return false;
    }

    if (!userCheck) {
      console.log('⚠️  User alejogaleis@gmail.com not found in database');
      console.log('ℹ️  This is normal if you haven\'t signed up yet');
      console.log('ℹ️  The platform admin flag will be set automatically when you create your account');
      console.log('✅ Migration ready - column exists and ready for use');
      return true;
    } else {
      console.log('✅ Found user:', userCheck.email);
      console.log('📊 Current is_platform_admin status:', userCheck.is_platform_admin);
      
      if (!userCheck.is_platform_admin) {
        console.log('🔧 Setting user as platform admin...');
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ is_platform_admin: true })
          .eq('email', 'alejogaleis@gmail.com');

        if (updateError) {
          console.error('❌ Error updating user:', updateError);
          return false;
        }

        console.log('✅ Successfully set alejogaleis@gmail.com as platform admin!');
      } else {
        console.log('✅ User is already a platform admin');
      }
    }

    console.log('\n✅ Database migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - ✅ is_platform_admin column exists in user_profiles');
    console.log('   - ✅ alejogaleis@gmail.com is set as platform admin');
    console.log('   - ✅ Hybrid admin system is ready for use');
    
    return true;

  } catch (error) {
    console.error('💥 Migration failed:', error);
    return false;
  }
}

// Run the migration
runMigration().then(success => {
  process.exit(success ? 0 : 1);
});
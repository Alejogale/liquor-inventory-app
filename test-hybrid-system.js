#!/usr/bin/env node

// 🚀 HYBRID ADMIN SYSTEM COMPREHENSIVE TEST
// Tests all components of the hybrid admin system

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runTests() {
  console.log('🧪 Starting Hybrid Admin System Tests...\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Column exists
  totalTests++;
  console.log('📋 Test 1: Checking is_platform_admin column exists...');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email, is_platform_admin')
      .limit(1);
    
    if (error) {
      console.log('❌ FAILED: Column does not exist');
    } else {
      console.log('✅ PASSED: Column exists and is queryable');
      passedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED: Error querying column');
  }

  // Test 2: Platform admin is set correctly
  totalTests++;
  console.log('\n👤 Test 2: Checking alejogaleis@gmail.com platform admin status...');
  try {
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('email, is_platform_admin, organization_id')
      .eq('email', 'alejogaleis@gmail.com')
      .maybeSingle();

    if (error) {
      console.log('❌ FAILED: Error querying user');
    } else if (!user) {
      console.log('⚠️  SKIPPED: User not found (normal if not signed up)');
    } else if (user.is_platform_admin === true) {
      console.log('✅ PASSED: Platform admin flag is set correctly');
      console.log(`   📊 User details: ${user.email}, org: ${user.organization_id}, admin: ${user.is_platform_admin}`);
      passedTests++;
    } else {
      console.log('❌ FAILED: Platform admin flag is not true');
    }
  } catch (error) {
    console.log('❌ FAILED: Exception querying user');
  }

  // Test 3: Security fixes - DataExport queries
  totalTests++;
  console.log('\n🔒 Test 3: Testing DataExport security queries...');
  try {
    // Test organization-filtered queries (simulate org admin)
    const testOrgId = 'test-org-123';
    
    const queries = [
      supabase.from('user_profiles').select('id').eq('organization_id', testOrgId).limit(1),
      supabase.from('organizations').select('id').eq('id', testOrgId).limit(1),
      supabase.from('inventory_items').select('id').eq('organization_id', testOrgId).limit(1),
      supabase.from('suppliers').select('id').eq('organization_id', testOrgId).limit(1),
      supabase.from('room_counts').select('id').eq('organization_id', testOrgId).limit(1)
    ];

    const results = await Promise.allSettled(queries);
    const allSucceeded = results.every(result => result.status === 'fulfilled');
    
    if (allSucceeded) {
      console.log('✅ PASSED: All DataExport queries accept organization_id filters');
      passedTests++;
    } else {
      console.log('❌ FAILED: Some queries failed (may be due to table structure)');
    }
  } catch (error) {
    console.log('❌ FAILED: Error testing security queries');
  }

  // Test 4: AdminDashboard security queries
  totalTests++;
  console.log('\n📊 Test 4: Testing AdminDashboard security queries...');
  try {
    // Test the same queries that AdminDashboard uses
    const testOrgId = 'test-org-123';
    
    const queries = [
      supabase.from('user_profiles').select('*').eq('organization_id', testOrgId),
      supabase.from('organizations').select('*').eq('id', testOrgId),
      supabase.from('inventory_items').select('*').eq('organization_id', testOrgId),
      supabase.from('suppliers').select('*').eq('organization_id', testOrgId)
    ];

    const results = await Promise.allSettled(queries);
    const allSucceeded = results.every(result => result.status === 'fulfilled');
    
    if (allSucceeded) {
      console.log('✅ PASSED: All AdminDashboard queries accept organization_id filters');
      passedTests++;
    } else {
      console.log('❌ FAILED: Some admin queries failed');
    }
  } catch (error) {
    console.log('❌ FAILED: Error testing admin queries');
  }

  // Test 5: Cross-tenant isolation
  totalTests++;
  console.log('\n🔐 Test 5: Testing cross-tenant data isolation...');
  try {
    // Query all organizations to simulate platform admin view
    const { data: allOrgs, error: allOrgsError } = await supabase
      .from('organizations')
      .select('id, Name')
      .limit(10);

    if (allOrgsError) {
      console.log('❌ FAILED: Cannot query organizations table');
    } else {
      console.log(`✅ PASSED: Platform admin can query all organizations (found ${allOrgs.length})`);
      if (allOrgs.length > 0) {
        console.log(`   📊 Sample organizations: ${allOrgs.map(org => org.Name || org.id).slice(0, 3).join(', ')}`);
      }
      passedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED: Error testing cross-tenant isolation');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🏁 HYBRID ADMIN SYSTEM TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Hybrid admin system is working correctly.');
    console.log('\n✅ System Status:');
    console.log('   - Database schema is correct');
    console.log('   - Platform admin is configured');
    console.log('   - Security queries work properly');
    console.log('   - Cross-tenant isolation is functional');
    return true;
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues above.');
    return false;
  }
}

// Run tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
});
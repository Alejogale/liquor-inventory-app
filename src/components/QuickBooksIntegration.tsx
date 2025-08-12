'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { ExternalLink, CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface QuickBooksIntegrationProps {
  user: User;
  organizationId?: string;  // Add this prop
}

export default function QuickBooksIntegration({ user, organizationId }: QuickBooksIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [integrationConfigured, setIntegrationConfigured] = useState(true);
  const [configMessage, setConfigMessage] = useState<string | null>(null);
  // Using imported supabase client

  // Add helper function to get current organization
  const getCurrentOrganization = async () => {
    if (organizationId) return organizationId;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      return profile?.organization_id || user.user_metadata?.organization_id;
    } catch (error) {
      console.error('Error getting organization:', error);
      return null;
    }
  };

  useEffect(() => {
    checkConnection();
  }, [organizationId]); // Add organizationId dependency

  const checkConnection = async () => {
    try {
      const currentOrg = await getCurrentOrganization();
      if (!currentOrg) return;

      const { data } = await supabase
        .from('organizations')
        .select('quickbooks_company_id, quickbooks_access_token')
        .eq('id', currentOrg)  // Use proper organization context
        .single();

      if (data?.quickbooks_company_id) {
        setIsConnected(true);
        fetchCompanyInfo();
      }
    } catch (error) {
      console.error('Error checking QuickBooks connection:', error);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('/api/quickbooks/company-info', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanyInfo(data);
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  const connectToQuickBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quickbooks/auth-url', {
        method: 'GET',
      });
      
      const data = await response.json();
      if (!response.ok || data?.configured === false || !data?.authUrl) {
        setIntegrationConfigured(false);
        setConfigMessage('QuickBooks integration is not configured on this environment.');
        setLoading(false);
        return;
      }
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting to QuickBooks:', error);
      setLoading(false);
    }
  };

  const disconnectQuickBooks = async () => {
    if (!confirm('Are you sure you want to disconnect QuickBooks?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/quickbooks/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setIsConnected(false);
        setCompanyInfo(null);
      }
    } catch (error) {
      console.error('Error disconnecting QuickBooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quickbooks/sync-inventory', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Inventory sync completed successfully!');
      }
    } catch (error) {
      console.error('Error syncing inventory:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">QuickBooks Integration</h3>
            <p className="text-sm text-slate-600">Sync your inventory data with QuickBooks Online</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Connected
            </span>
          )}
        </div>
      </div>

      {isConnected && companyInfo ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-700 mb-2">Connected Company</h4>
            <p className="text-sm text-green-800">
              <strong>{companyInfo.CompanyName}</strong>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Company ID: {companyInfo.Id}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={syncInventory}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Syncing...' : 'Sync Inventory Now'}
            </button>
            
            <button
              onClick={disconnectQuickBooks}
              disabled={loading}
              className="px-4 py-2 border border-red-400/30 text-red-400 rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Disconnect
            </button>
          </div>

          <div className="text-xs text-slate-500 mt-4">
            <p>• Inventory purchases will automatically create expense entries in QuickBooks</p>
            <p>• Supplier bills will be tracked and recorded</p>
            <p>• Inventory values will update your balance sheet</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-700 mb-4">
            Connect your QuickBooks Online account to automatically sync inventory purchases and expenses.
          </p>
          {!integrationConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4 text-sm">
              {configMessage || 'QuickBooks credentials are missing. Please add QUICKBOOKS_CLIENT_ID/SECRET and NEXT_PUBLIC_APP_URL.'}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-700 mb-2">What gets synced:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Inventory purchases → QuickBooks expenses</li>
              <li>• Supplier bills → Vendor payments tracking</li>
              <li>• Inventory values → Balance sheet updates</li>
              <li>• COGS calculations when inventory is consumed</li>
            </ul>
          </div>

          <button
            onClick={connectToQuickBooks}
            disabled={loading || !integrationConfigured}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect to QuickBooks'}
          </button>
          
          <p className="text-xs text-slate-500 mt-3">
            Requires QuickBooks Online subscription. Integration is secure and read-only.
          </p>
        </div>
      )}
    </div>
  );
}

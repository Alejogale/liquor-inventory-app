import { redirect } from 'next/navigation';

export default async function IntegrationsPage() {
  // For demo purposes, we'll assume user is authenticated
  // In production, you'd check authentication properly
  const user = { id: 'demo-user', email: 'demo@example.com' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600">Connect LiquorTrack with your favorite business tools</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Future integrations can go here */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-muted text-sm font-medium">$</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Stripe Integration</h3>
                <p className="text-sm text-gray-500">Coming soon - Payment processing integration</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-muted text-sm font-medium">@</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Integration</h3>
                <p className="text-sm text-gray-500">Coming soon - Automated inventory reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

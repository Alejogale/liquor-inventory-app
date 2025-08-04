import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-blue-200/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-slate-800">Liquor Inventory Manager</div>
            <div className="flex items-center gap-4">
              <a href="#pricing" className="text-slate-600 hover:text-slate-800">Pricing</a>
              <a href="#features" className="text-slate-600 hover:text-slate-800">Features</a>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-800 mb-6">
          Professional Bar Inventory<br/>
          <span className="text-blue-600">Made Simple</span>
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
          Streamline your liquor inventory with real-time counting, automated ordering, 
          and detailed reporting. Perfect for restaurants, bars, and country clubs.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold">
            Start Free Trial
          </Link>
          <button className="border border-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything You Need to Manage Inventory
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-blue-400 text-3xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-white mb-4">Barcode Scanning</h3>
            <p className="text-white/70">Quick inventory counts with mobile barcode scanning. No more clipboards and manual counting.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-blue-400 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-4">Real-time Reports</h3>
            <p className="text-white/70">Automated order reports sent to your suppliers. Know exactly what to order and when.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-blue-400 text-3xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-white mb-4">Multi-Location</h3>
            <p className="text-white/70">Manage inventory across multiple bars, restaurants, or venues from one dashboard.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Simple, Transparent Pricing
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Starter</h3>
            <div className="text-3xl font-bold text-white mb-4">$29<span className="text-lg text-white/60">/month</span></div>
            <ul className="text-white/70 space-y-2 mb-6">
              <li>• 1 Location</li>
              <li>• 2 Team Members</li>
              <li>• Basic Reporting</li>
              <li>• Email Support</li>
            </ul>
            <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-3 rounded-lg font-semibold">
              Start Free Trial
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Professional</h3>
            <div className="text-3xl font-bold text-white mb-4">$79<span className="text-lg text-white/60">/month</span></div>
            <ul className="text-white/70 space-y-2 mb-6">
              <li>• 3 Locations</li>
              <li>• 10 Team Members</li>
              <li>• Advanced Reporting</li>
              <li>• Barcode Scanning</li>
              <li>• Priority Support</li>
            </ul>
            <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-3 rounded-lg font-semibold">
              Start Free Trial
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Enterprise</h3>
            <div className="text-3xl font-bold text-white mb-4">$199<span className="text-lg text-white/60">/month</span></div>
            <ul className="text-white/70 space-y-2 mb-6">
              <li>• Unlimited Locations</li>
              <li>• Unlimited Team Members</li>
              <li>• Custom Reporting</li>
              <li>• API Access</li>
              <li>• Dedicated Support</li>
            </ul>
            <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-3 rounded-lg font-semibold">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/5">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-white/60">
          <p>&copy; 2024 Liquor Inventory Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

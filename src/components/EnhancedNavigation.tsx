'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  Search, 
  ChevronDown, 
  Package, 
  Users, 
  Settings, 
  HelpCircle,
  Globe,
  Building2,
  BarChart3,
  Zap
} from 'lucide-react'

interface EnhancedNavigationProps {
  variant?: 'marketing' | 'app' | 'admin'
  showSearch?: boolean
}

export default function EnhancedNavigation({ 
  variant = 'marketing', 
  showSearch = true 
}: EnhancedNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const marketingMenuItems = [
    {
      label: 'Product',
      href: '#features',
      dropdown: [
        { label: 'Features', href: '#features', icon: <Zap className="h-4 w-4" /> },
        { label: 'Industries', href: '#features', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Analytics', href: '#features', icon: <BarChart3 className="h-4 w-4" /> },
        { label: 'Integrations', href: '#features', icon: <Globe className="h-4 w-4" /> }
      ]
    },
    {
      label: 'Solutions',
      href: '#apps',
      dropdown: [
        { label: 'Bars & Restaurants', href: '#apps' },
        { label: 'Hotels & Resorts', href: '#apps' },
        { label: 'Nightclubs', href: '#apps' },
        { label: 'Catering Services', href: '#apps' }
      ]
    },
    {
      label: 'Pricing',
      href: '/pricing'
    },
    {
      label: 'Resources',
      href: '#resources',
      dropdown: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ]
    }
  ]

  const appMenuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard'
    },
    {
      label: 'Inventory',
      href: '/dashboard',
      dropdown: [
        { label: 'Items', href: '/dashboard' },
        { label: 'Categories', href: '/dashboard' },
        { label: 'Suppliers', href: '/dashboard' },
        { label: 'Rooms', href: '/dashboard' }
      ]
    },
    {
      label: 'Reports',
      href: '/dashboard',
      dropdown: [
        { label: 'Activity Log', href: '/dashboard' },
        { label: 'Order Report', href: '/dashboard' },
        { label: 'Analytics', href: '/dashboard' }
      ]
    }
  ]

  const menuItems = variant === 'marketing' ? marketingMenuItems : appMenuItems

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-lg' 
        : 'bg-white/10 backdrop-blur-xl border-b border-white/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:bg-slate-800 transition-colors">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className={`text-xl font-bold transition-colors ${
              isScrolled ? 'text-slate-900' : 'text-slate-900'
            }`}>
              LiquorTrack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.dropdown ? (
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    className={`flex items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                      isScrolled 
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' 
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/20'
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`py-2 px-3 rounded-lg transition-all duration-200 ${
                      isScrolled 
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' 
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/20'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-200/50 shadow-xl py-2">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.label}
                        href={dropdownItem.href}
                        className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        {'icon' in dropdownItem && dropdownItem.icon ? dropdownItem.icon : null}
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden md:flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>
          )}

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {variant === 'marketing' ? (
              <>
                <Link 
                  href="/login" 
                  className={`transition-colors ${
                    isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-black hover:bg-slate-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  Start Free 30-Day Trial
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/apps?tab=subscription" 
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Settings className="h-5 w-5 text-slate-600" />
                </Link>
                <Link 
                  href="/contact" 
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <HelpCircle className="h-5 w-5 text-slate-600" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-200/50">
            {/* Mobile Search */}
            {showSearch && (
              <div className="mt-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </form>
              </div>
            )}

            {/* Mobile Navigation Items */}
            <div className="mt-4 space-y-2">
              {menuItems.map((item) => (
                <div key={item.label}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between py-3 px-4 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        {item.label}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`} />
                      </button>
                      {activeDropdown === item.label && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.label}
                              href={dropdownItem.href}
                              className="flex items-center gap-3 py-2 px-4 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {'icon' in dropdownItem && dropdownItem.icon ? dropdownItem.icon : null}
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block py-3 px-4 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile CTA Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-200/50">
              {variant === 'marketing' ? (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full py-3 px-4 text-center text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full py-3 px-4 text-center bg-black hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Start Free 30-Day Trial
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/apps?tab=subscription"
                    className="flex-1 py-3 px-4 text-center text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    href="/contact"
                    className="flex-1 py-3 px-4 text-center text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Help
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 
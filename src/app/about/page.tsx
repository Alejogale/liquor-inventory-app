'use client'

import Link from 'next/link'
import { ArrowLeft, Package, Heart, Users, Target, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InvyEasy</span>
            </Link>
            
            {/* Back to Home */}
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* About Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Easy Inventory
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A personal project born from the simple idea that everyone deserves to stay organized without breaking the bank.
          </p>
        </div>

        {/* Main Story */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Made Simple, Made Affordable
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Easy Inventory started as a personal project to solve a simple problem: 
                  keeping track of everything you own shouldn't be complicated or expensive.
                </p>
                <p>
                  I've been working on this project to help everyone - from individuals organizing 
                  their homes to small businesses managing their inventory - stay on top of what 
                  they have without the complexity and high costs of traditional solutions.
                </p>
                <p>
                  The goal is simple: make inventory management accessible, intuitive, and affordable 
                  for everyone. No complicated features you don't need, no hidden fees, no corporate 
                  complexity - just a tool that works.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Built with Love</h3>
              <p className="text-gray-600">
                Created by me and my dog Koda, who provides excellent moral support during late-night coding sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Simple & Intuitive</h3>
            <p className="text-gray-600">
              No complicated features or confusing interfaces. Just the tools you need to stay organized, presented in a way that makes sense.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">For Everyone</h3>
            <p className="text-gray-600">
              Whether you're organizing your home, managing a hobby, or running a small business - Easy Inventory adapts to your needs.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Affordable</h3>
            <p className="text-gray-600">
              One simple price, no hidden fees, no complicated tiers. Just $10/month or $100/year for everything you need to stay organized.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl leading-relaxed max-w-3xl mx-auto">
            To make inventory management accessible to everyone by providing a simple, 
            affordable solution that actually works. No corporate complexity, no hidden fees, 
            just a tool that helps you keep track of what matters.
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Organized?
          </h3>
          <p className="text-gray-600 mb-8">
            Join us in making inventory management simple and affordable for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/" 
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200 inline-flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

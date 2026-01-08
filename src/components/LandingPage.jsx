import React from 'react';
import { FileText, Sparkles, ArrowRight, LogIn, UserPlus, Shield, Zap, Lock } from 'lucide-react';

const LandingPage = ({ onGetStarted, onLoginClick, onSignupClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">DocuMind AI</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button 
              onClick={onSignupClick}
              className="px-4 py-2 bg-white text-purple-900 font-semibold rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-yellow-200 text-sm">100% Offline • Privacy First</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Your Documents,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Summarized Intelligently
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            AI-powered document summarization that works completely offline. 
            Your data never leaves your device. No installation required.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm">100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Private & Offline</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: FileText, 
              title: "All File Types", 
              desc: "PDF, Word, Excel, Images, PowerPoint - we handle it all with automatic validation"
            },
            { 
              icon: Sparkles, 
              title: "AI-Powered", 
              desc: "Advanced AI models provide intelligent summaries tailored to your needs"
            },
            { 
              icon: Shield, 
              title: "100% Offline", 
              desc: "No internet needed. Complete privacy guaranteed. Your files never leave your browser"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Upload Files", desc: "Drag and drop or select multiple documents" },
              { step: "2", title: "Customize", desc: "Choose summary length, style, and add instructions" },
              { step: "3", title: "Get Summary", desc: "Receive instant AI-generated insights" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">DocuMind AI</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 DocuMind AI. Secure, Private, Intelligent Document Summarization.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
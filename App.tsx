
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';

const Navbar: React.FC = () => (
  <nav className="glass sticky top-0 z-[100] border-b-0">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-24">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center group cursor-pointer">
            <div className="h-12 w-12 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-200 group-hover:rotate-12 transition-all">
              H
            </div>
            <div className="ml-4">
              <span className="block text-2xl font-black text-slate-900 tracking-tighter leading-none">ContactHub</span>
              <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1">Global Intel v2.0</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="hidden sm:flex space-x-8">
            <a href="#" className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-b-4 border-indigo-600 pb-2 pt-1 transition-all">Directory</a>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen relative">
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-purple-200/20 blur-[120px] rounded-full"></div>
        </div>

        <Navbar />
        <main className="relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="py-12 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Enterprise Communication Hub &bull; Secured by SQLite WASM</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;

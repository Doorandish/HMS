'use client';

import React, { useState, useEffect } from 'react';
import { createTenant } from './actions';
import { useRouter } from 'next/navigation';
import { Building2, Sparkles, ArrowRight } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hostname, setHostname] = useState('');

  useEffect(() => {
    setHostname(window.location.host);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await createTenant(formData, hostname);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Setup complete! Force hard reload to `/admin/dashboard` so middleware picks up the new domain mapping
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white">
              <Sparkles size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to HMS!</h1>
            <p className="text-slate-300 text-sm">Let's set up your first Hotel (Tenant) on this database.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hotel Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Grand Plaza Hotel"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Name (Subdomain)</label>
            <input
              type="text"
              name="subdomain"
              required
              placeholder="grandplaza"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Will be mapped to <span className="font-mono text-slate-700">{hostname || 'your-domain'}</span> automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@hotel.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Initialize Platform'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
}

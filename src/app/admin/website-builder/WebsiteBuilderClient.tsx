'use client';

import React, { useState } from 'react';
import { updateTenantBranding, updateRoomType } from './actions';
import { Save, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WebsiteBuilderClient({ tenant }: { tenant: any }) {
  const [branding, setBranding] = useState({
    name: tenant.name || '',
    primaryColor: tenant.brandingConfig?.primaryColor || '#000000',
    logoUrl: tenant.brandingConfig?.logoUrl || '',
    heroImage: tenant.brandingConfig?.heroImage || '',
    address: tenant.address || '',
    phone: tenant.phone || '',
    email: tenant.email || '',
  });

  const [savingBranding, setSavingBranding] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState(false);

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    setBrandingSuccess(false);
    const result = await updateTenantBranding(branding);
    setSavingBranding(false);
    if (result.success) {
      setBrandingSuccess(true);
      setTimeout(() => setBrandingSuccess(false), 3000);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hotel Information & Branding */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Hotel Information & Branding</h2>
            <p className="text-sm text-gray-500 mt-1">Update your website&apos;s basic information and look.</p>
          </div>
          <button
            onClick={handleSaveBranding}
            disabled={savingBranding}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {savingBranding ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
        
        {brandingSuccess && (
          <div className="bg-green-50 text-green-700 p-4 flex items-center gap-2 border-b border-green-100">
            <CheckCircle2 size={18} />
            Branding updated successfully!
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
              <input
                type="text"
                value={branding.name}
                onChange={e => setBranding({ ...branding, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={branding.email}
                onChange={e => setBranding({ ...branding, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={branding.phone}
                onChange={e => setBranding({ ...branding, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={branding.address}
                onChange={e => setBranding({ ...branding, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={branding.logoUrl}
                onChange={e => setBranding({ ...branding, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
              <input
                type="text"
                value={branding.heroImage}
                onChange={e => setBranding({ ...branding, heroImage: e.target.value })}
                placeholder="https://example.com/hero.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {branding.heroImage && (
                <div className="mt-3 relative h-32 rounded-lg border border-gray-200 overflow-hidden">
                  <img src={branding.heroImage} alt="Hero preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Room Types */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Room Types</h2>
          <p className="text-sm text-gray-500 mt-1">Manage details for room types displayed on your website.</p>
        </div>
        <div className="p-6 space-y-6">
          {tenant.roomTypes.map((roomType: any) => (
            <RoomTypeEditor key={roomType.id} roomType={roomType} />
          ))}
          {tenant.roomTypes.length === 0 && (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              No room types found. Add room types in the settings first.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function RoomTypeEditor({ roomType }: { roomType: any }) {
  const [data, setData] = useState({
    name: roomType.name,
    description: roomType.description || '',
    category: roomType.category,
    baseOccupancy: roomType.baseOccupancy,
    maxOccupancy: roomType.maxOccupancy,
    amenities: Array.isArray(roomType.amenities) ? roomType.amenities.join(', ') : '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    const payload = {
      ...data,
      amenities: data.amenities.split(',').map((s: string) => s.trim()).filter(Boolean)
    };
    const result = await updateRoomType(roomType.id, payload);
    setSaving(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{roomType.name}</h3>
          <p className="text-sm text-gray-500">{roomType.category}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>
      </div>

      {success && (
        <div className="mb-4 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 size={14} /> Saved successfully
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={data.category}
            onChange={e => setData({ ...data, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={data.description}
            onChange={e => setData({ ...data, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy (Base / Max)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={data.baseOccupancy}
              onChange={e => setData({ ...data, baseOccupancy: parseInt(e.target.value) || 1 })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">/</span>
            <input
              type="number"
              value={data.maxOccupancy}
              onChange={e => setData({ ...data, maxOccupancy: parseInt(e.target.value) || 1 })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
          <input
            type="text"
            value={data.amenities}
            onChange={e => setData({ ...data, amenities: e.target.value })}
            placeholder="WiFi, TV, Balcony..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

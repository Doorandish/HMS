'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, DollarSign, Home, CheckSquare } from 'lucide-react';
import { generateMarketingDescription, simulateBenchmarkRates } from './actions';

export default function AIAssistantPage() {
  const [amenities, setAmenities] = useState('WiFi, Pool, Balcony');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [marketingContent, setMarketingContent] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const [directPrice, setDirectPrice] = useState('100');
  const [ratesData, setRatesData] = useState<any>(null);
  const [isSimulatingRates, setIsSimulatingRates] = useState(false);

  const handleGenerateContent = async () => {
    setIsGeneratingContent(true);
    setMarketingContent('');
    const amList = amenities.split(',').map(a => a.trim());
    const res = await generateMarketingDescription(amList, propertyType);
    if (res.success) {
      setMarketingContent(res.content || '');
    } else {
      setMarketingContent('Error: ' + res.error);
    }
    setIsGeneratingContent(false);
  };

  const handleSimulateRates = async () => {
    setIsSimulatingRates(true);
    setRatesData(null);
    const price = parseFloat(directPrice);
    if (isNaN(price)) {
      setIsSimulatingRates(false);
      return;
    }
    const res = await simulateBenchmarkRates(price);
    if (res.success) {
      setRatesData(res.data);
    }
    setIsSimulatingRates(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-[var(--tenant-primary)]" />
        <h1 className="text-3xl font-bold">AI Rate & Content Assistant</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Content Generator */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-xl font-semibold">
            <Home className="w-5 h-5 text-gray-500" />
            <h2>Marketing Content Generator</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={amenities}
                onChange={e => setAmenities(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleGenerateContent}
              disabled={isGeneratingContent}
              className="flex items-center gap-2 bg-[var(--tenant-primary)] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {isGeneratingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Description
            </button>

            {marketingContent && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md whitespace-pre-wrap text-sm text-gray-800">
                {marketingContent}
              </div>
            )}
          </div>
        </div>

        {/* Rate Simulator */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-xl font-semibold">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <h2>Benchmark Rates Simulator</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direct Website Price ($)</label>
              <input 
                type="number" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={directPrice}
                onChange={e => setDirectPrice(e.target.value)}
              />
            </div>

            <button 
              onClick={handleSimulateRates}
              disabled={isSimulatingRates}
              className="flex items-center gap-2 bg-[var(--tenant-primary)] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {isSimulatingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Simulate OTA Rates
            </button>

            {ratesData && (
              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Simulated Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(ratesData).map(([channel, rate]) => (
                      <tr key={channel}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{channel}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

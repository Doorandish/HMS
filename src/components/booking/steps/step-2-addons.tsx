'use client';

import React, { useState, useEffect } from 'react';
import { 
  useBooking, 
  AddOnSelection, 
  calculateNights, 
  calculateAddOnPrice 
} from '../booking-flow-context';
import { 
  Utensils, 
  Car, 
  Plane, 
  Clock, 
  Dog, 
  Sparkles, 
  Wine, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Minus, 
  Check, 
  BedDouble, 
  ShieldCheck, 
  Info 
} from 'lucide-react';

interface AvailableAddOn {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pricingType: 'PER_NIGHT' | 'PER_STAY' | 'PER_PERSON' | 'PER_PERSON_PER_NIGHT' | string;
  sortOrder?: number;
}

const FALLBACK_ADDONS: AvailableAddOn[] = [
  {
    id: 'addon_breakfast',
    name: 'Gourmet Breakfast Buffet',
    description: 'Fresh pastries, local cheeses, organic eggs, artisan coffee, and seasonal fruit every morning.',
    price: 18.00,
    pricingType: 'PER_PERSON_PER_NIGHT',
  },
  {
    id: 'addon_parking',
    name: 'Secure Underground Parking',
    description: 'Reserved heated underground parking space with 24/7 camera surveillance and EV charging.',
    price: 15.00,
    pricingType: 'PER_NIGHT',
  },
  {
    id: 'addon_airport',
    name: 'Private Airport Transfer',
    description: 'Chauffeured Mercedes-Benz direct pickup or drop-off between the hotel and the airport.',
    price: 65.00,
    pricingType: 'PER_STAY',
  },
  {
    id: 'addon_late_checkout',
    name: 'Guaranteed Late Check-Out (2:00 PM)',
    description: 'Relax and sleep in with extended room access until 2:00 PM on departure day.',
    price: 35.00,
    pricingType: 'PER_STAY',
  },
  {
    id: 'addon_spa',
    name: 'Thermal Spa & Sauna Pass',
    description: 'Unlimited access to the alpine wellness oasis, heated panoramic pool, saunas, and relaxation lounge.',
    price: 30.00,
    pricingType: 'PER_PERSON_PER_NIGHT',
  },
  {
    id: 'addon_pet',
    name: 'VIP Pet Welcome Package',
    description: 'Luxury dog bed, food & water bowls, organic treats, and a local walking guide.',
    price: 25.00,
    pricingType: 'PER_NIGHT',
  },
  {
    id: 'addon_champagne',
    name: 'Chilled Champagne & Chocolates',
    description: 'Bottle of premium Champagne and artisanal handcrafted chocolates waiting in your room upon arrival.',
    price: 49.00,
    pricingType: 'PER_STAY',
  },
];

export function Step2Addons() {
  const { state, updateState, nextStep, prevStep } = useBooking();
  const [availableAddOns, setAvailableAddOns] = useState<AvailableAddOn[]>(FALLBACK_ADDONS);
  const [loading, setLoading] = useState(false);

  // Selected add-ons map: addOnId -> quantity
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    state.addOns.forEach((a) => {
      map[a.addOnId] = a.quantity;
    });
    return map;
  });

  const nights = calculateNights(state.checkIn, state.checkOut);
  const totalGuests = (state.adults || 1) + (state.children || 0);

  // Fetch add-ons from API if available
  useEffect(() => {
    async function fetchAddons() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/addons');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setAvailableAddOns(json.data);
          }
        }
      } catch {
        // Fallback to FALLBACK_ADDONS silently
      } finally {
        setLoading(false);
      }
    }
    fetchAddons();
  }, []);

  const handleQuantityChange = (addOn: AvailableAddOn, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[addOn.id] || 0;
      const nextVal = Math.max(0, current + delta);
      const nextMap = { ...prev };
      if (nextVal === 0) {
        delete nextMap[addOn.id];
      } else {
        nextMap[addOn.id] = nextVal;
      }
      return nextMap;
    });
  };

  const handleToggleAddon = (addOn: AvailableAddOn) => {
    setSelectedAddons((prev) => {
      const current = prev[addOn.id] || 0;
      const nextMap = { ...prev };
      if (current > 0) {
        delete nextMap[addOn.id];
      } else {
        nextMap[addOn.id] = 1;
      }
      return nextMap;
    });
  };

  const handleContinue = () => {
    const formattedAddOns: AddOnSelection[] = [];
    Object.entries(selectedAddons).forEach(([addOnId, quantity]) => {
      if (quantity > 0) {
        const item = availableAddOns.find((a) => a.id === addOnId);
        if (item) {
          formattedAddOns.push({
            addOnId: item.id,
            name: item.name,
            price: item.price,
            quantity,
            pricingType: item.pricingType,
            description: item.description || undefined,
          });
        }
      }
    });

    updateState({
      addOns: formattedAddOns,
    });

    nextStep();
  };

  const getAddOnIcon = (id: string, name: string) => {
    const key = (id + ' ' + name).toLowerCase();
    if (key.includes('breakfast') || key.includes('food') || key.includes('meal')) {
      return <Utensils className="text-amber-600" size={22} />;
    }
    if (key.includes('parking') || key.includes('car')) {
      return <Car className="text-blue-600" size={22} />;
    }
    if (key.includes('transfer') || key.includes('airport') || key.includes('shuttle')) {
      return <Plane className="text-indigo-600" size={22} />;
    }
    if (key.includes('checkout') || key.includes('check-out') || key.includes('late')) {
      return <Clock className="text-emerald-600" size={22} />;
    }
    if (key.includes('pet') || key.includes('dog')) {
      return <Dog className="text-orange-600" size={22} />;
    }
    if (key.includes('spa') || key.includes('wellness') || key.includes('sauna')) {
      return <Sparkles className="text-purple-600" size={22} />;
    }
    if (key.includes('champagne') || key.includes('wine') || key.includes('drink')) {
      return <Wine className="text-rose-600" size={22} />;
    }
    return <Sparkles className="text-[var(--tenant-primary)]" size={22} />;
  };

  const formatPricingType = (type: string) => {
    switch (type) {
      case 'PER_NIGHT':
        return '/ night';
      case 'PER_PERSON_PER_NIGHT':
        return '/ person / night';
      case 'PER_PERSON':
        return '/ person';
      case 'PER_STAY':
      default:
        return '/ stay';
    }
  };

  // Calculate current add-on total
  const calculatedAddOnTotal = Object.entries(selectedAddons).reduce((sum, [addOnId, qty]) => {
    const item = availableAddOns.find((a) => a.id === addOnId);
    if (!item) return sum;
    const addOnSelection: AddOnSelection = {
      addOnId: item.id,
      name: item.name,
      price: item.price,
      quantity: qty,
      pricingType: item.pricingType,
    };
    return sum + calculateAddOnPrice(addOnSelection, nights, totalGuests);
  }, 0);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Enhance Your Stay
        </h2>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Customize your experience with curated extras, wellness access, and personalized amenities.
        </p>
      </div>

      {/* Selected Room Recap Banner */}
      {state.selectedRoom && (
        <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-blue-200/80 flex items-center justify-center text-[var(--tenant-primary)] shrink-0 shadow-xs">
              <BedDouble size={24} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--tenant-primary)] uppercase tracking-wider">
                Selected Room
              </div>
              <h4 className="font-bold text-gray-900 text-base">
                {state.selectedRoom.name}
              </h4>
              <p className="text-xs text-gray-600">
                {state.selectedRatePlan?.name || 'Standard Rate'} • {nights} {nights === 1 ? 'night' : 'nights'} • {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={prevStep}
            className="text-xs font-semibold text-[var(--tenant-primary)] hover:underline self-start sm:self-center shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Change Room
          </button>
        </div>
      )}

      {/* Add-ons List */}
      <div className="space-y-4 mb-8">
        {availableAddOns.map((addOn) => {
          const qty = selectedAddons[addOn.id] || 0;
          const isSelected = qty > 0;
          const itemSelection: AddOnSelection = {
            addOnId: addOn.id,
            name: addOn.name,
            price: addOn.price,
            quantity: qty || 1,
            pricingType: addOn.pricingType,
          };
          const totalForItem = isSelected
            ? calculateAddOnPrice(itemSelection, nights, totalGuests)
            : 0;

          return (
            <div
              key={addOn.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isSelected
                  ? 'border-[var(--tenant-primary)] bg-blue-50/20 shadow-xs ring-1 ring-[var(--tenant-primary)]/40'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {getAddOnIcon(addOn.id, addOn.name)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      {addOn.name}
                    </h3>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <Check size={12} />
                        Added
                      </span>
                    )}
                  </div>

                  {addOn.description && (
                    <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-xl">
                      {addOn.description}
                    </p>
                  )}

                  <div className="text-xs font-semibold text-gray-700 pt-1">
                    €{addOn.price.toFixed(2)}{' '}
                    <span className="text-gray-500 font-normal">
                      {formatPricingType(addOn.pricingType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Selection / Quantity Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                {/* Total impact for item */}
                {isSelected && (
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-gray-900">
                      +€{totalForItem.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      total for stay
                    </div>
                  </div>
                )}

                {/* Counter or Toggle */}
                {addOn.pricingType === 'PER_PERSON' || addOn.pricingType === 'PER_PERSON_PER_NIGHT' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(addOn, -1)}
                      disabled={qty <= 0}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(addOn, 1)}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleAddon(addOn)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[var(--tenant-primary)] text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} />
                        Selected
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Add
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust info banner */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3 text-xs text-gray-600 mb-8">
        <Info size={18} className="text-[var(--tenant-primary)] shrink-0" />
        <div>
          Add-ons can be easily modified or cancelled up to 24 hours before your arrival at no charge.
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Rooms
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--tenant-primary,#1a365d)] hover:opacity-95 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.99] cursor-pointer"
        >
          <span>Continue to Guest Details</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

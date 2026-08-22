'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBooking, SelectedRoomInfo, SelectedRatePlan, calculateNights } from '../booking-flow-context';
import { 
  Calendar, 
  Users, 
  Search, 
  Maximize, 
  Wifi, 
  Tv, 
  Wind, 
  Coffee, 
  Check, 
  ShieldCheck, 
  Utensils, 
  BedDouble, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface RatePlanData {
  id: string;
  name: string;
  cancellationPolicy: string;
  mealPlan: string;
  totalPrice: number;
  nightlyPrices: { date: string; price: number }[];
}

interface RoomTypeData {
  id: string;
  name: string;
  category: string;
  description: string | null;
  baseOccupancy: number;
  maxOccupancy: number;
  amenities: string[] | unknown;
  images: string[] | unknown;
  size: number | null;
  availableRooms: number;
  ratePlans: RatePlanData[];
}

// Fallback high quality imagery for room categories
const ROOM_IMAGES: Record<string, string> = {
  Single: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  Double: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
  Suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  Deluxe: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
};

export function Step1Search() {
  const { state, updateState, nextStep } = useBooking();

  const [checkIn, setCheckIn] = useState(state.checkIn);
  const [checkOut, setCheckOut] = useState(state.checkOut);
  const [adults, setAdults] = useState(state.adults);
  const [children, setChildren] = useState(state.children);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([]);
  const [selectedPlanByRoom, setSelectedPlanByRoom] = useState<Record<string, string>>({});

  const nights = calculateNights(checkIn, checkOut);

  const performSearch = useCallback(async (
    cIn: string, 
    cOut: string, 
    ad: number, 
    ch: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/availability/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkIn: cIn,
          checkOut: cOut,
          adults: ad,
          children: ch,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to search availability');
      }

      const results: RoomTypeData[] = json.data || [];
      setRoomTypes(results);

      // Default selected rate plan for each room type to the first plan (usually Standard Flexible)
      const initialPlans: Record<string, string> = {};
      results.forEach((room) => {
        if (room.ratePlans && room.ratePlans.length > 0) {
          initialPlans[room.id] = room.ratePlans[0].id;
        }
      });
      setSelectedPlanByRoom(initialPlans);

      // Update booking flow search state
      updateState({
        checkIn: cIn,
        checkOut: cOut,
        adults: ad,
        children: ch,
        currency: json.meta?.currency || 'EUR',
      });
    } catch (err: unknown) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching for rooms');
    } finally {
      setLoading(false);
    }
  }, [updateState]);

  // Initial search on mount
  useEffect(() => {
    if (checkIn && checkOut) {
      performSearch(checkIn, checkOut, adults, children);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(checkIn, checkOut, adults, children);
  };

  const handleSelectRoom = (room: RoomTypeData, chosenPlanId?: string) => {
    const activePlanId = chosenPlanId || selectedPlanByRoom[room.id] || room.ratePlans[0]?.id;
    const activePlan = room.ratePlans.find((p) => p.id === activePlanId) || room.ratePlans[0];

    const parsedAmenities = Array.isArray(room.amenities)
      ? (room.amenities as string[])
      : typeof room.amenities === 'string'
      ? JSON.parse(room.amenities || '[]')
      : ['Free High-Speed WiFi', 'Air Conditioning', 'Flat-screen TV', 'Ensuite Bathroom'];

    const roomImage = Array.isArray(room.images) && (room.images as string[]).length > 0
      ? (room.images as string[])[0]
      : ROOM_IMAGES[room.category] || ROOM_IMAGES.default;

    const selectedRoomData: SelectedRoomInfo = {
      id: room.id,
      name: room.name,
      category: room.category,
      description: room.description,
      baseOccupancy: room.baseOccupancy,
      maxOccupancy: room.maxOccupancy,
      amenities: parsedAmenities,
      images: [roomImage],
      size: room.size,
      availableRooms: room.availableRooms,
      ratePlans: room.ratePlans,
    };

    const selectedRatePlanData: SelectedRatePlan | null = activePlan
      ? {
          id: activePlan.id,
          name: activePlan.name,
          cancellationPolicy: activePlan.cancellationPolicy,
          mealPlan: activePlan.mealPlan,
          totalPrice: activePlan.totalPrice,
          nightlyPrices: activePlan.nightlyPrices,
        }
      : null;

    updateState({
      roomTypeId: room.id,
      ratePlanId: activePlan?.id || null,
      selectedRoom: selectedRoomData,
      selectedRatePlan: selectedRatePlanData,
    });

    nextStep();
  };

  const formatPolicy = (policy: string) => {
    switch (policy) {
      case 'FREE_CANCELLATION':
        return 'Free Cancellation';
      case 'MODERATE':
        return 'Moderate Cancellation';
      case 'STRICT':
        return 'Strict Cancellation';
      case 'NON_REFUNDABLE':
        return 'Non-Refundable';
      default:
        return policy.replace(/_/g, ' ');
    }
  };

  const formatMealPlan = (mealPlan: string) => {
    switch (mealPlan) {
      case 'BED_AND_BREAKFAST':
        return 'Breakfast included';
      case 'HALF_BOARD':
        return 'Half board (Breakfast + Dinner)';
      case 'FULL_BOARD':
        return 'Full board';
      case 'ALL_INCLUSIVE':
        return 'All inclusive luxury';
      case 'ROOM_ONLY':
      default:
        return 'Room only';
    }
  };

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi size={14} className="text-[var(--tenant-primary)]" />;
    if (lower.includes('tv')) return <Tv size={14} className="text-[var(--tenant-primary)]" />;
    if (lower.includes('air') || lower.includes('ac')) return <Wind size={14} className="text-[var(--tenant-primary)]" />;
    if (lower.includes('coffee') || lower.includes('nespresso')) return <Coffee size={14} className="text-[var(--tenant-primary)]" />;
    if (lower.includes('bed')) return <BedDouble size={14} className="text-[var(--tenant-primary)]" />;
    return <Sparkles size={14} className="text-[var(--tenant-primary)]" />;
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Select Your Room
        </h2>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Explore our comfortable rooms and suites with transparent rates and exclusive perks.
        </p>
      </div>

      {/* Search Criteria Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 md:p-5 mb-8 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Check-in */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Check-in Date
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-[var(--tenant-primary)] focus-within:border-transparent transition-all">
              <Calendar size={18} className="text-[var(--tenant-primary)] shrink-0" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => {
                  const val = e.target.value;
                  setCheckIn(val);
                  if (new Date(val) >= new Date(checkOut)) {
                    setCheckOut(format(addDays(new Date(val), 1), 'yyyy-MM-dd'));
                  }
                }}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="bg-transparent text-sm w-full font-medium text-gray-800 outline-none"
                required
              />
            </div>
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Check-out Date
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-[var(--tenant-primary)] focus-within:border-transparent transition-all">
              <Calendar size={18} className="text-[var(--tenant-primary)] shrink-0" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn ? format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                className="bg-transparent text-sm w-full font-medium text-gray-800 outline-none"
                required
              />
            </div>
          </div>

          {/* Guests */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Adults
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-3 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-[var(--tenant-primary)] focus-within:border-transparent transition-all">
                <Users size={16} className="text-[var(--tenant-primary)] shrink-0" />
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="bg-transparent text-sm w-full font-medium text-gray-800 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Adult' : 'Adults'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Children
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-3 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-[var(--tenant-primary)] focus-within:border-transparent transition-all">
                <Users size={16} className="text-[var(--tenant-primary)] shrink-0" />
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="bg-transparent text-sm w-full font-medium text-gray-800 outline-none"
                >
                  {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Child' : 'Children'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Update Search Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-[46px] px-5 bg-[var(--tenant-primary,#1a365d)] hover:opacity-95 active:scale-[0.99] text-white font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Update Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="mt-3.5 pt-3 border-t border-gray-200/60 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
          <span>
            Stay: <strong className="text-gray-900">{nights} {nights === 1 ? 'night' : 'nights'}</strong> ({checkIn} to {checkOut})
          </span>
          <span>
            Guests: <strong className="text-gray-900">{adults} {adults === 1 ? 'Adult' : 'Adults'}</strong>{children > 0 && `, ${children} Children`}
          </span>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Error searching availability</h4>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => performSearch(checkIn, checkOut, adults, children)}
            className="text-xs font-semibold underline hover:no-underline text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl p-6 bg-white animate-pulse flex flex-col md:flex-row gap-6"
            >
              <div className="w-full md:w-64 h-48 bg-gray-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded-md w-1/3" />
                <div className="h-4 bg-gray-100 rounded-md w-2/3" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                  <div className="h-6 bg-gray-100 rounded-full w-24" />
                </div>
                <div className="h-20 bg-gray-50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && roomTypes.length === 0 && (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-blue-50 text-[var(--tenant-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <BedDouble size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Rooms Available</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            We couldn't find available rooms for the selected dates and occupancy. Try changing your dates or reducing guest count.
          </p>
          <button
            onClick={() => {
              const nextWeekStart = format(addDays(new Date(), 7), 'yyyy-MM-dd');
              const nextWeekEnd = format(addDays(new Date(), 9), 'yyyy-MM-dd');
              setCheckIn(nextWeekStart);
              setCheckOut(nextWeekEnd);
              performSearch(nextWeekStart, nextWeekEnd, adults, children);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--tenant-primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Calendar size={16} />
            Try Next Weekend
          </button>
        </div>
      )}

      {/* Room Results List */}
      {!loading && roomTypes.length > 0 && (
        <div className="space-y-8">
          {roomTypes.map((room) => {
            const selectedPlanId = selectedPlanByRoom[room.id] || room.ratePlans[0]?.id;
            const currentPlan = room.ratePlans.find((p) => p.id === selectedPlanId) || room.ratePlans[0];
            const parsedAmenities = Array.isArray(room.amenities)
              ? (room.amenities as string[])
              : typeof room.amenities === 'string'
              ? JSON.parse(room.amenities || '[]')
              : ['WiFi', 'Air Conditioning', 'TV', 'Ensuite'];

            const roomImage = Array.isArray(room.images) && (room.images as string[]).length > 0
              ? (room.images as string[])[0]
              : ROOM_IMAGES[room.category] || ROOM_IMAGES.default;

            const isSelected = state.roomTypeId === room.id;

            return (
              <div
                key={room.id}
                className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-[var(--tenant-primary)] ring-2 ring-[var(--tenant-primary)]/20'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Room Image */}
                  <div className="relative w-full lg:w-80 h-56 lg:h-auto min-h-[220px] bg-gray-100 shrink-0 overflow-hidden">
                    <img
                      src={roomImage}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg tracking-wide">
                        {room.category}
                      </span>
                    </div>

                    {room.availableRooms <= 3 && (
                      <div className="absolute bottom-3 left-3 bg-red-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                        <Sparkles size={12} />
                        Only {room.availableRooms} {room.availableRooms === 1 ? 'room' : 'rooms'} left!
                      </div>
                    )}
                  </div>

                  {/* Room Details & Rate Options */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      {/* Title & Specs */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                          {room.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                          {room.size && (
                            <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md">
                              <Maximize size={13} className="text-gray-500" />
                              {room.size} m²
                            </span>
                          )}
                          <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md">
                            <Users size={13} className="text-gray-500" />
                            Up to {room.maxOccupancy} guests
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {room.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {room.description}
                        </p>
                      )}

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {parsedAmenities.slice(0, 5).map((amenity: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-lg font-medium"
                          >
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </span>
                        ))}
                        {parsedAmenities.length > 5 && (
                          <span className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                            +{parsedAmenities.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rate Plans Selection Box */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                        Choose Rate Plan ({room.ratePlans.length} available)
                      </div>

                      <div className="space-y-2.5">
                        {room.ratePlans.map((plan) => {
                          const isPlanActive = selectedPlanId === plan.id;
                          const avgNightlyPrice = Math.round(plan.totalPrice / nights);

                          return (
                            <div
                              key={plan.id}
                              onClick={() => {
                                setSelectedPlanByRoom((prev) => ({
                                  ...prev,
                                  [room.id]: plan.id,
                                }));
                              }}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isPlanActive
                                  ? 'border-[var(--tenant-primary)] bg-blue-50/30 ring-1 ring-[var(--tenant-primary)]'
                                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/40'
                              }`}
                            >
                              {/* Left details */}
                              <div className="flex items-start gap-3">
                                <div className="pt-0.5">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      isPlanActive
                                        ? 'border-[var(--tenant-primary)] bg-[var(--tenant-primary)]'
                                        : 'border-gray-400 bg-white'
                                    }`}
                                  >
                                    {isPlanActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>

                                <div>
                                  <div className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                    {plan.name}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                                    <span className="flex items-center gap-1 text-green-700 font-medium">
                                      <ShieldCheck size={13} />
                                      {formatPolicy(plan.cancellationPolicy)}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1 text-gray-600 font-medium">
                                      <Utensils size={13} />
                                      {formatMealPlan(plan.mealPlan)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Pricing */}
                              <div className="text-right sm:self-center pl-7 sm:pl-0 flex sm:flex-col justify-between sm:justify-center items-end">
                                <div>
                                  <div className="text-base font-bold text-gray-900">
                                    €{plan.totalPrice.toFixed(2)}
                                  </div>
                                  <div className="text-[11px] text-gray-500">
                                    €{avgNightlyPrice}/night • {nights} {nights === 1 ? 'night' : 'nights'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Select Room CTA */}
                      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="text-xs text-gray-500">
                          Taxes & fees included • Instant confirmation
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectRoom(room, selectedPlanId)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--tenant-primary,#1a365d)] hover:opacity-95 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                        >
                          <span>Select {room.name}</span>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

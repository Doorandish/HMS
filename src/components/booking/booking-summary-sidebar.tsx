'use client';

import React from 'react';
import { 
  useBooking, 
  calculateNights, 
  calculateAddOnPrice 
} from './booking-flow-context';
import { 
  Calendar, 
  Users, 
  BedDouble, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Utensils, 
  Clock, 
  FileText 
} from 'lucide-react';
import { format } from 'date-fns';

export function BookingSummarySidebar() {
  const { state, setStep } = useBooking();

  const nights = calculateNights(state.checkIn, state.checkOut);
  const totalGuests = (state.adults || 1) + (state.children || 0);

  const roomSubtotal = state.selectedRatePlan?.totalPrice || 0;
  const addOnsTotal = state.addOns.reduce((sum, item) => {
    return sum + calculateAddOnPrice(item, nights, totalGuests);
  }, 0);

  const totalAmount = Math.round((roomSubtotal + addOnsTotal) * 100) / 100;
  const estimatedTaxes = Math.round(roomSubtotal * 0.07 * 100) / 100;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'EEE, MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatPolicy = (policy?: string) => {
    if (!policy) return 'Standard Policy';
    switch (policy) {
      case 'FREE_CANCELLATION':
        return 'Free cancellation';
      case 'MODERATE':
        return 'Moderate cancellation';
      case 'STRICT':
        return 'Strict cancellation';
      case 'NON_REFUNDABLE':
        return 'Non-refundable';
      default:
        return policy.replace(/_/g, ' ');
    }
  };

  const formatMealPlan = (mealPlan?: string) => {
    if (!mealPlan) return null;
    switch (mealPlan) {
      case 'BED_AND_BREAKFAST':
        return 'Breakfast included';
      case 'HALF_BOARD':
        return 'Half Board included';
      case 'FULL_BOARD':
        return 'Full Board included';
      case 'ALL_INCLUSIVE':
        return 'All Inclusive';
      case 'ROOM_ONLY':
      default:
        return 'Room only';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden divide-y divide-gray-100">
      {/* Sidebar Header */}
      <div className="p-5 bg-gradient-to-r from-gray-900 to-slate-900 text-white">
        <h3 className="font-bold text-lg tracking-tight">Your Reservation</h3>
        <p className="text-xs text-gray-300 mt-0.5">Hotel Sonnenberg • Munich, Germany</p>
      </div>

      {/* Dates & Guests Block */}
      <div className="p-5 space-y-4">
        {/* Stay Dates */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--tenant-primary)] flex items-center justify-center shrink-0 mt-0.5">
            <Calendar size={16} />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-semibold text-gray-900 mb-1">
              {nights} {nights === 1 ? 'Night Stay' : 'Nights Stay'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Check-in</span>
                <span className="font-medium text-gray-800">{formatDate(state.checkIn)}</span>
                <span className="text-[10px] text-gray-400 block">From 15:00</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Check-out</span>
                <span className="font-medium text-gray-800">{formatDate(state.checkOut)}</span>
                <span className="text-[10px] text-gray-400 block">Until 11:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--tenant-primary)] flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
          <div className="text-xs">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Occupancy</span>
            <span className="font-medium text-gray-800">
              {state.adults} {state.adults === 1 ? 'Adult' : 'Adults'}
              {state.children > 0 && `, ${state.children} ${state.children === 1 ? 'Child' : 'Children'}`}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Room Details Block */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Room Selection
          </span>
          {state.selectedRoom && (
            <button
              onClick={() => setStep(1)}
              className="text-xs text-[var(--tenant-primary)] font-semibold hover:underline cursor-pointer"
            >
              Change
            </button>
          )}
        </div>

        {state.selectedRoom ? (
          <div className="space-y-3">
            {/* Room Image & Title */}
            {state.selectedRoom.images && state.selectedRoom.images.length > 0 && (
              <div className="w-full h-28 rounded-xl overflow-hidden bg-gray-100 relative">
                <img
                  src={state.selectedRoom.images[0]}
                  alt={state.selectedRoom.name}
                  className="w-full h-full object-cover"
                />
                {state.selectedRoom.category && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold rounded-md">
                    {state.selectedRoom.category}
                  </span>
                )}
              </div>
            )}

            <div>
              <h4 className="font-bold text-sm text-gray-900">
                {state.selectedRoom.name}
              </h4>
              {state.selectedRoom.size && (
                <p className="text-xs text-gray-500">{state.selectedRoom.size} m² • Room only / with extras</p>
              )}
            </div>

            {/* Rate Plan & Inclusions */}
            {state.selectedRatePlan && (
              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 border border-gray-100">
                <div className="font-semibold text-gray-900">
                  {state.selectedRatePlan.name}
                </div>
                <div className="flex items-center gap-1.5 text-green-700 font-medium">
                  <ShieldCheck size={13} className="shrink-0" />
                  <span>{formatPolicy(state.selectedRatePlan.cancellationPolicy)}</span>
                </div>
                {state.selectedRatePlan.mealPlan && state.selectedRatePlan.mealPlan !== 'ROOM_ONLY' && (
                  <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <Utensils size={13} className="shrink-0" />
                    <span>{formatMealPlan(state.selectedRatePlan.mealPlan)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
            <BedDouble size={24} className="mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500 font-medium">No room selected yet</p>
          </div>
        )}
      </div>

      {/* Add-ons List Block */}
      {state.addOns && state.addOns.length > 0 && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Selected Add-ons ({state.addOns.length})
            </span>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-[var(--tenant-primary)] font-semibold hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-2">
            {state.addOns.map((addOn) => {
              const itemTotal = calculateAddOnPrice(addOn, nights, totalGuests);
              return (
                <div
                  key={addOn.addOnId}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--tenant-primary)] shrink-0" />
                    <span className="text-gray-700">
                      {addOn.name}
                      {addOn.quantity > 1 && (
                        <span className="text-gray-400 ml-1">× {addOn.quantity}</span>
                      )}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    €{itemTotal.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Summary Breakdown */}
      <div className="p-5 bg-gray-50/50 space-y-2.5">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
          Price Breakdown
        </span>

        {/* Room Price */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Room ({nights} {nights === 1 ? 'night' : 'nights'}):</span>
          <span className="font-medium text-gray-900">€{roomSubtotal.toFixed(2)}</span>
        </div>

        {/* Add-ons Price */}
        {state.addOns.length > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Add-ons total:</span>
            <span className="font-medium text-gray-900">+€{addOnsTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Taxes */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>VAT & City Tax (7% included):</span>
          <span>€{estimatedTaxes.toFixed(2)}</span>
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
          <div>
            <span className="font-bold text-sm text-gray-900 block">Total Price</span>
            <span className="text-[10px] text-gray-500">All taxes & charges included</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-[var(--tenant-primary,#1a365d)]">
              €{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="p-5 space-y-2.5 bg-white text-xs text-gray-600">
        <div className="flex items-center gap-2 text-gray-700">
          <CheckCircle2 size={15} className="text-green-600 shrink-0" />
          <span>Best rate guarantee direct booking</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Lock size={15} className="text-blue-600 shrink-0" />
          <span>256-bit SSL encrypted checkout</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Sparkles size={15} className="text-amber-500 shrink-0" />
          <span>Free high-speed WiFi & welcome perks</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';

export type BookingStep = 1 | 2 | 3 | 4;

export interface AddOnSelection {
  addOnId: string;
  name: string;
  price: number;
  quantity: number;
  pricingType?: 'PER_NIGHT' | 'PER_STAY' | 'PER_PERSON' | 'PER_PERSON_PER_NIGHT' | string;
  description?: string;
}

export interface SelectedRatePlan {
  id: string;
  name: string;
  cancellationPolicy: string;
  mealPlan: string;
  totalPrice: number;
  nightlyPrices?: { date: string; price: number }[];
}

export interface SelectedRoomInfo {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  baseOccupancy?: number;
  maxOccupancy?: number;
  amenities?: string[];
  images?: string[];
  size?: number | null;
  availableRooms?: number;
  ratePlans?: SelectedRatePlan[];
}

export interface BookingState {
  step: BookingStep;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomTypeId: string | null;
  ratePlanId: string | null;
  selectedRoom: SelectedRoomInfo | null;
  selectedRatePlan: SelectedRatePlan | null;
  addOns: AddOnSelection[];
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests: string;
    gdprConsent: boolean;
  };
  totalAmount: number;
  currency: string;
}

interface BookingContextType {
  state: BookingState;
  updateState: (updates: Partial<BookingState>) => void;
  setStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  calculateTotal: (customState?: Partial<BookingState>) => number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
}

export function calculateAddOnPrice(
  addOn: AddOnSelection,
  nights: number,
  totalGuests: number
): number {
  const qty = addOn.quantity || 0;
  if (qty <= 0) return 0;

  switch (addOn.pricingType) {
    case 'PER_NIGHT':
      return addOn.price * qty * nights;
    case 'PER_PERSON_PER_NIGHT':
      return addOn.price * qty * nights * totalGuests;
    case 'PER_PERSON':
      return addOn.price * qty * totalGuests;
    case 'PER_STAY':
    default:
      return addOn.price * qty;
  }
}

export function BookingProvider({ 
  children,
  initialSearchParams 
}: { 
  children: React.ReactNode;
  initialSearchParams?: Record<string, string>;
}) {
  const defaultCheckIn = format(new Date(), 'yyyy-MM-dd');
  const defaultCheckOut = format(addDays(new Date(), 2), 'yyyy-MM-dd');

  const [state, setState] = useState<BookingState>(() => {
    const checkIn = initialSearchParams?.checkIn || defaultCheckIn;
    const checkOut = initialSearchParams?.checkOut || defaultCheckOut;
    const adults = parseInt(initialSearchParams?.adults || '2', 10);
    const childrenCount = parseInt(initialSearchParams?.children || '0', 10);
    const roomTypeId = initialSearchParams?.roomType || null;

    return {
      step: 1,
      checkIn,
      checkOut,
      adults: isNaN(adults) || adults < 1 ? 1 : adults,
      children: isNaN(childrenCount) || childrenCount < 0 ? 0 : childrenCount,
      roomTypeId,
      ratePlanId: null,
      selectedRoom: null,
      selectedRatePlan: null,
      addOns: [],
      guestDetails: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: '',
        gdprConsent: false,
      },
      totalAmount: 0,
      currency: 'EUR',
    };
  });

  const calculateTotal = (customState?: Partial<BookingState>): number => {
    const currentState = { ...state, ...customState };
    const roomPrice = currentState.selectedRatePlan?.totalPrice || 0;
    const nights = calculateNights(currentState.checkIn, currentState.checkOut);
    const totalGuests = (currentState.adults || 1) + (currentState.children || 0);

    const addOnsTotal = (currentState.addOns || []).reduce((sum, item) => {
      return sum + calculateAddOnPrice(item, nights, totalGuests);
    }, 0);

    return Math.round((roomPrice + addOnsTotal) * 100) / 100;
  };

  const updateState = (updates: Partial<BookingState>) => {
    setState((prev) => {
      const mergedGuestDetails = updates.guestDetails 
        ? { ...prev.guestDetails, ...updates.guestDetails } 
        : prev.guestDetails;

      const next = {
        ...prev,
        ...updates,
        guestDetails: mergedGuestDetails,
      };

      // Recalculate total amount when room, rate plan, or add-ons change
      const roomPrice = next.selectedRatePlan?.totalPrice || 0;
      const nights = calculateNights(next.checkIn, next.checkOut);
      const totalGuests = (next.adults || 1) + (next.children || 0);

      const addOnsTotal = (next.addOns || []).reduce((sum, item) => {
        return sum + calculateAddOnPrice(item, nights, totalGuests);
      }, 0);

      next.totalAmount = Math.round((roomPrice + addOnsTotal) * 100) / 100;
      return next;
    });
  };

  const setStep = (step: BookingStep) => {
    setState((prev) => ({ ...prev, step }));
  };

  const nextStep = () => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 4) as BookingStep }));
  };

  const prevStep = () => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) as BookingStep }));
  };

  return (
    <BookingContext.Provider value={{ state, updateState, setStep, nextStep, prevStep, calculateTotal }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

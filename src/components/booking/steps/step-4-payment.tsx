'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking, calculateNights, calculateAddOnPrice } from '../booking-flow-context';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar, 
  User, 
  Clock, 
  Sparkles, 
  RefreshCw,
  Wallet,
  Check
} from 'lucide-react';

export function Step4Payment() {
  const router = useRouter();
  const { state, prevStep } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState<'stripe_cc' | 'apple_pay' | 'pay_at_hotel'>('stripe_cc');
  const [cardholderName, setCardholderName] = useState(
    state.guestDetails.firstName && state.guestDetails.lastName
      ? `${state.guestDetails.firstName} ${state.guestDetails.lastName}`
      : ''
  );
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [postalCode, setPostalCode] = useState('80331');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nights = calculateNights(state.checkIn, state.checkOut);
  const totalGuests = (state.adults || 1) + (state.children || 0);

  // Price calculations
  const roomSubtotal = state.selectedRatePlan?.totalPrice || 0;
  const addOnsTotal = state.addOns.reduce((sum, item) => {
    return sum + calculateAddOnPrice(item, nights, totalGuests);
  }, 0);
  const totalAmount = Math.round((roomSubtotal + addOnsTotal) * 100) / 100;
  const estimatedTax = Math.round(roomSubtotal * 0.07 * 100) / 100; // 7% VAT included/estimated

  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (!state.roomTypeId) {
        throw new Error('Please go back and select a room to proceed.');
      }
      if (!state.guestDetails.email || !state.guestDetails.firstName) {
        throw new Error('Guest details are missing. Please go back and fill out the form.');
      }

      // Format payload according to API schema
      const payload = {
        guest: {
          firstName: state.guestDetails.firstName,
          lastName: state.guestDetails.lastName,
          email: state.guestDetails.email,
          phone: state.guestDetails.phone,
        },
        roomTypeId: state.roomTypeId,
        ratePlanId: state.ratePlanId || undefined,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        adults: state.adults,
        children: state.children,
        specialRequests: state.guestDetails.specialRequests || undefined,
        addOns: state.addOns.map((a) => ({
          addOnId: a.addOnId,
          quantity: a.quantity,
        })),
        gdprConsent: state.guestDetails.gdprConsent,
      };

      const response = await fetch('/api/v1/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete reservation. Please try again.');
      }

      const reservationNumber = result.data?.reservationNumber || 'HMS-CONFIRMED';

      // Redirect to confirmation page with reservation number
      router.push(`/book/confirmation?resNumber=${encodeURIComponent(reservationNumber)}`);
    } catch (err: unknown) {
      console.error('Reservation submission error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while completing your reservation.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Payment & Confirmation
        </h2>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Review your reservation breakdown and choose your preferred secure payment method.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Booking Request Unsuccessful</h4>
            <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePayAndConfirm}>
        {/* Payment Method Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Credit Card / Stripe */}
            <button
              type="button"
              onClick={() => setPaymentMethod('stripe_cc')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                paymentMethod === 'stripe_cc'
                  ? 'border-[var(--tenant-primary)] bg-blue-50/40 ring-2 ring-[var(--tenant-primary)]/20 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <CreditCard
                  size={22}
                  className={paymentMethod === 'stripe_cc' ? 'text-[var(--tenant-primary)]' : 'text-gray-500'}
                />
                {paymentMethod === 'stripe_cc' && (
                  <span className="w-2 h-2 rounded-full bg-[var(--tenant-primary)]" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">Credit / Debit Card</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Visa, Mastercard, Amex</div>
              </div>
            </button>

            {/* Apple / Google Pay */}
            <button
              type="button"
              onClick={() => setPaymentMethod('apple_pay')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                paymentMethod === 'apple_pay'
                  ? 'border-[var(--tenant-primary)] bg-blue-50/40 ring-2 ring-[var(--tenant-primary)]/20 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Wallet
                  size={22}
                  className={paymentMethod === 'apple_pay' ? 'text-[var(--tenant-primary)]' : 'text-gray-500'}
                />
                {paymentMethod === 'apple_pay' && (
                  <span className="w-2 h-2 rounded-full bg-[var(--tenant-primary)]" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">Apple Pay / G Pay</div>
                <div className="text-[11px] text-gray-500 mt-0.5">1-click express checkout</div>
              </div>
            </button>

            {/* Pay at Hotel */}
            <button
              type="button"
              onClick={() => setPaymentMethod('pay_at_hotel')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                paymentMethod === 'pay_at_hotel'
                  ? 'border-[var(--tenant-primary)] bg-blue-50/40 ring-2 ring-[var(--tenant-primary)]/20 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Building2
                  size={22}
                  className={paymentMethod === 'pay_at_hotel' ? 'text-[var(--tenant-primary)]' : 'text-gray-500'}
                />
                {paymentMethod === 'pay_at_hotel' && (
                  <span className="w-2 h-2 rounded-full bg-[var(--tenant-primary)]" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">Pay at Hotel</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Card required as guarantee</div>
              </div>
            </button>
          </div>
        </div>

        {/* Card Form (Stripe Mockup) */}
        <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-5 md:p-6 mb-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/80">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                256-Bit SSL Encrypted Payment
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="font-mono font-semibold text-gray-600">Stripe Verified</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Name on card"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20 transition-all"
                required
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full pl-3.5 pr-12 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono font-medium text-gray-900 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20 transition-all"
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <CreditCard size={18} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Expiry, CVC & Zip */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expires (MM/YY)
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono font-medium text-gray-900 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20 transition-all text-center"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  CVC / CVV
                </label>
                <input
                  type="password"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono font-medium text-gray-900 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20 transition-all text-center"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="ZIP"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20 transition-all text-center"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total Summary Block */}
        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 mb-8 space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>Room & Rate Plan ({nights} {nights === 1 ? 'night' : 'nights'}):</span>
            <span className="font-semibold text-gray-900">€{roomSubtotal.toFixed(2)}</span>
          </div>

          {state.addOns.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Selected Add-ons ({state.addOns.length}):</span>
              <span className="font-semibold text-gray-900">+€{addOnsTotal.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>VAT & Local Tourism Taxes (included):</span>
            <span>€{estimatedTax.toFixed(2)}</span>
          </div>

          <div className="pt-3 border-t border-blue-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Total Amount Due
              </span>
              <span className="text-xs text-green-700 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={13} />
                No hidden fees • Instant booking
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[var(--tenant-primary,#1a365d)]">
              €{totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Navigation / Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Back to Guest Details
          </button>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>Authorizing & Booking...</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Pay & Confirm Booking (€{totalAmount.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

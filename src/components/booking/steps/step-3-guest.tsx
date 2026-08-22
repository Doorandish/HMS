'use client';

import React, { useState } from 'react';
import { useBooking } from '../booking-flow-context';
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gdprConsent?: string;
}

export function Step3Guest() {
  const { state, updateState, nextStep, prevStep } = useBooking();

  const [formData, setFormData] = useState({
    firstName: state.guestDetails.firstName || '',
    lastName: state.guestDetails.lastName || '',
    email: state.guestDetails.email || '',
    phone: state.guestDetails.phone || '',
    specialRequests: state.guestDetails.specialRequests || '',
    gdprConsent: state.guestDetails.gdprConsent || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (values: typeof formData): FormErrors => {
    const errs: FormErrors = {};

    if (!values.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (values.firstName.trim().length < 2) {
      errs.firstName = 'First name must be at least 2 characters';
    }

    if (!values.lastName.trim()) {
      errs.lastName = 'Last name is required';
    } else if (values.lastName.trim().length < 2) {
      errs.lastName = 'Last name must be at least 2 characters';
    }

    if (!values.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!values.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (values.phone.trim().length < 6) {
      errs.phone = 'Please enter a valid phone number';
    }

    if (!values.gdprConsent) {
      errs.gdprConsent = 'You must accept the privacy policy & GDPR terms to proceed';
    }

    return errs;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const nextValues = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };

    setFormData(nextValues);

    if (touched[name]) {
      const validationErrors = validate(nextValues);
      setErrors(validationErrors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate(formData);
    setErrors(validationErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      gdprConsent: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      updateState({
        guestDetails: formData,
      });
      nextStep();
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Guest Information
        </h2>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Please enter the primary guest details to finalize your reservation and receive your booking confirmation.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur('firstName')}
                placeholder="e.g. Alexander"
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all ${
                  touched.firstName && errors.firstName
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20'
                }`}
                required
              />
            </div>
            {touched.firstName && errors.firstName && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={13} />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur('lastName')}
                placeholder="e.g. Weber"
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all ${
                  touched.lastName && errors.lastName
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20'
                }`}
                required
              />
            </div>
            {touched.lastName && errors.lastName && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={13} />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="alexander.weber@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all ${
                  touched.email && errors.email
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20'
                }`}
                required
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Your instant booking confirmation and receipt will be sent here.
            </p>
            {touched.email && errors.email && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={13} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="+49 170 1234567"
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all ${
                  touched.phone && errors.phone
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20'
                }`}
                required
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Used for essential pre-arrival updates and check-in assistance.
            </p>
            {touched.phone && errors.phone && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={13} />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Special Requests */}
        <div className="mb-6">
          <label
            htmlFor="specialRequests"
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
          >
            Special Requests & Estimated Arrival Time <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <textarea
              id="specialRequests"
              name="specialRequests"
              rows={3}
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="e.g. Quiet high floor room, early check-in preference, dietary allergies, celebrating an anniversary..."
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary)]/20 transition-all resize-none"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Special requests cannot be guaranteed but our front desk will do its absolute best to accommodate them.
          </p>
        </div>

        {/* GDPR & Privacy Consent */}
        <div className="mb-8 p-4 md:p-5 rounded-2xl bg-gray-50/90 border border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="gdprConsent"
              checked={formData.gdprConsent}
              onChange={handleChange}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-[var(--tenant-primary)] focus:ring-[var(--tenant-primary)] rounded-md cursor-pointer shrink-0"
            />
            <div className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">
                I agree to the Terms of Service, Privacy Policy & GDPR Data Processing.*
              </span>
              <p className="mt-1 text-gray-500">
                By ticking this box, you confirm that you consent to our hotel securely storing and processing your personal data for the purpose of managing your reservation, providing guest services, and issuing your official guest registration in accordance with EU GDPR regulations.
              </p>
            </div>
          </label>
          {touched.gdprConsent && errors.gdprConsent && (
            <p className="text-xs text-red-500 mt-2 ml-8 flex items-center gap-1 font-medium">
              <AlertCircle size={13} />
              {errors.gdprConsent}
            </p>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Add-ons
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--tenant-primary,#1a365d)] hover:opacity-95 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>Proceed to Payment</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React from 'react';
import { useBooking } from './booking-flow-context';
import { BookingSummarySidebar } from './booking-summary-sidebar';
import { Step1Search } from './steps/step-1-search';
import { Step2Addons } from './steps/step-2-addons';
import { Step3Guest } from './steps/step-3-guest';
import { Step4Payment } from './steps/step-4-payment';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BookingStepsContainer() {
  const { state } = useBooking();

  const steps = [
    { id: 1, name: 'Search' },
    { id: 2, name: 'Add-ons' },
    { id: 3, name: 'Details' },
    { id: 4, name: 'Payment' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Progress Stepper */}
        <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hidden md:block">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                    state.step > step.id ? "bg-green-500 text-white" : 
                    state.step === step.id ? "bg-[var(--tenant-primary)] text-white" : 
                    "bg-gray-100 text-gray-400"
                  )}>
                    {state.step > step.id ? <Check size={16} /> : step.id}
                  </div>
                  <span className={cn(
                    "font-medium",
                    state.step >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-px bg-gray-200 mx-4" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
          {state.step === 1 && <Step1Search />}
          {state.step === 2 && <Step2Addons />}
          {state.step === 3 && <Step3Guest />}
          {state.step === 4 && <Step4Payment />}
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="w-full lg:w-[350px]">
        <div className="sticky top-24">
          <BookingSummarySidebar />
        </div>
      </div>
    </div>
  );
}

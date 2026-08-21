/**
 * Payment Gateway Adapter
 *
 * This module provides the interface and mock implementation for
 * payment processing. Designed for Stripe Connect or Adyen integration.
 *
 * HOOK POINT: Replace the MockPaymentAdapter with a real Stripe/Adyen
 * implementation by providing API credentials.
 *
 * Features planned:
 * - Stripe Connect for multi-tenant split payments
 * - 3D Secure / PSD2 Strong Customer Authentication
 * - Automatic refund handling on cancellation
 */

// ============================================================
// Interfaces
// ============================================================

export interface PaymentConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
}

export interface CreatePaymentIntentInput {
  amount: number; // In smallest currency unit (cents)
  currency: string;
  reservationId: string;
  tenantId: string;
  guestEmail: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'cancelled';
  amount: number;
  currency: string;
}

export interface RefundInput {
  paymentIntentId: string;
  amount?: number; // Partial refund if specified
  reason?: string;
}

export interface RefundResult {
  id: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
}

export interface PaymentAdapter {
  /**
   * Create a payment intent for a reservation.
   * Returns a client secret for frontend completion.
   */
  createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<PaymentIntentResult>;

  /**
   * Process a refund (full or partial).
   */
  refund(input: RefundInput): Promise<RefundResult>;

  /**
   * Verify a webhook signature for security.
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): Promise<boolean>;
}

// ============================================================
// Mock Implementation
// ============================================================

/**
 * Mock Payment Adapter for development and testing.
 *
 * TODO: Replace with real Stripe/Adyen integration.
 *
 * Stripe Integration Guide:
 * ```typescript
 * import Stripe from 'stripe';
 *
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 *   apiVersion: '2023-10-16',
 * });
 *
 * // Create payment intent
 * const intent = await stripe.paymentIntents.create({
 *   amount: input.amount,
 *   currency: input.currency,
 *   metadata: { reservation_id: input.reservationId },
 *   // For Stripe Connect multi-tenant:
 *   // transfer_data: { destination: tenantStripeAccountId },
 * });
 * ```
 */
export class MockPaymentAdapter implements PaymentAdapter {
  constructor(config: PaymentConfig) {
    console.log('[Payment] Initialized mock payment adapter');
    // Suppress unused variable warning
    void config;
  }

  async createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<PaymentIntentResult> {
    const mockId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log(
      `[Payment] MOCK: Created payment intent ${mockId} for €${(input.amount / 100).toFixed(2)}`
    );

    return {
      id: mockId,
      clientSecret: `${mockId}_secret_mock`,
      status: 'requires_payment_method',
      amount: input.amount,
      currency: input.currency,
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const mockId = `re_mock_${Date.now()}`;
    console.log(
      `[Payment] MOCK: Refunded ${input.amount || 'full amount'} for ${input.paymentIntentId}`
    );

    return {
      id: mockId,
      amount: input.amount || 0,
      status: 'succeeded',
    };
  }

  async verifyWebhookSignature(
    _payload: string,
    _signature: string
  ): Promise<boolean> {
    console.log('[Payment] MOCK: Webhook signature verified');
    return true;
  }
}

// ============================================================
// Factory
// ============================================================

/**
 * Creates a payment adapter instance.
 * Switch to real implementation by changing this factory.
 */
export function createPaymentAdapter(
  config: PaymentConfig
): PaymentAdapter {
  // TODO: When ready for production, replace with:
  // return new StripePaymentAdapter(config);
  // return new AdyenPaymentAdapter(config);
  return new MockPaymentAdapter(config);
}

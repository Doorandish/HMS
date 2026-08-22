import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-07-29.dahlia' }) 
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const reservationId = session.metadata?.reservationId;
      const tenantId = session.metadata?.tenantId;

      if (reservationId && tenantId) {
        // Update Reservation Payment Status
        await prisma.reservation.update({
          where: { id: reservationId },
          data: {
            paymentStatus: 'PAID',
            paymentIntentId: session.payment_intent as string,
            payments: {
              create: {
                amount: (session.amount_total || 0) / 100,
                currency: session.currency?.toUpperCase() || 'EUR',
                method: 'stripe_cc',
                status: 'PAID',
                gatewayRef: session.id,
                paidAt: new Date()
              }
            }
          }
        });
        console.log(`[Stripe Webhook] Successfully marked reservation ${reservationId} as PAID.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

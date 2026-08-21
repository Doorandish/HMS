/**
 * API Route: Webhook receiver for Channel Manager
 *
 * POST /api/webhooks/channel-manager
 *
 * Receives incoming reservation notifications from the channel manager.
 * This is a standardized webhook endpoint that channel managers can POST to.
 *
 * HOOK POINT: Implement signature verification and payload parsing
 * specific to your chosen channel manager provider.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Verify webhook signature from channel manager
    // const signature = request.headers.get('x-webhook-signature');
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    console.log(
      '[Webhook] Channel Manager event received:',
      JSON.stringify(body, null, 2)
    );

    const { event_type } = body;

    switch (event_type) {
      case 'reservation.new':
        // TODO: Create reservation from OTA booking
        console.log('[Webhook] New OTA reservation received');
        break;

      case 'reservation.modified':
        // TODO: Update existing reservation
        console.log('[Webhook] OTA reservation modified');
        break;

      case 'reservation.cancelled':
        // TODO: Cancel reservation
        console.log('[Webhook] OTA reservation cancelled');
        break;

      default:
        console.log(`[Webhook] Unknown event type: ${event_type}`);
    }

    // Always acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Webhook] Channel Manager error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

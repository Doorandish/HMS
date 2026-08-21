/**
 * API Route: Channel Manager Distribution Sync
 *
 * POST /api/v1/distribution/sync — Push availability updates to channel manager
 * POST /api/v1/distribution/pull — Pull reservations from channel manager
 * GET  /api/v1/distribution/health — Test channel manager connection
 *
 * HOOK POINT: This controller uses the ChannelManagerAdapter interface.
 * Replace the mock adapter with a real implementation when ready.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createChannelManagerAdapter,
  type AvailabilityUpdate,
} from '@/lib/adapters/channel-manager';

// Initialize with mock config — replace with real credentials
const channelManager = createChannelManagerAdapter({
  apiKey: process.env.CHANNEL_MANAGER_API_KEY || 'mock_key',
  apiUrl: process.env.CHANNEL_MANAGER_API_URL || 'https://api.mock-cm.com',
  propertyId: 'prop_demo',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'push_availability': {
        const updates: AvailabilityUpdate[] = body.updates;
        if (!updates || !Array.isArray(updates)) {
          return NextResponse.json(
            { error: 'Missing or invalid updates array' },
            { status: 400 }
          );
        }
        await channelManager.pushAvailability(updates);
        return NextResponse.json({
          success: true,
          message: `Pushed ${updates.length} availability updates`,
        });
      }

      case 'pull_reservations': {
        const reservations = await channelManager.pullReservations();
        return NextResponse.json({
          success: true,
          data: reservations,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: push_availability, pull_reservations' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[API] Distribution sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const healthy = await channelManager.testConnection();
    return NextResponse.json({
      success: true,
      connected: healthy,
      adapter: 'MockChannelManagerAdapter',
      note: 'Replace with real adapter (Channex/SiteMinder) for production',
    });
  } catch (error) {
    console.error('[API] Distribution health check error:', error);
    return NextResponse.json(
      { error: 'Channel manager connection failed' },
      { status: 503 }
    );
  }
}

/**
 * API Route: Health Check
 *
 * GET /api/health
 *
 * Returns system health status.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'unknown',
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'connected';
  } catch {
    health.services.database = 'disconnected';
    health.status = 'degraded';
  }

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503,
  });
}

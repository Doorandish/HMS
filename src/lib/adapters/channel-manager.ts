/**
 * Channel Manager Integration Adapter
 *
 * This module provides the interface and mock implementation for
 * two-way inventory synchronization with external channel managers
 * (e.g., Channex, SiteMinder, BookingSync).
 *
 * HOOK POINT: Replace the MockChannelManagerAdapter with a real
 * implementation by providing API credentials and mapping logic.
 */

// ============================================================
// Interfaces
// ============================================================

export interface ChannelManagerConfig {
  apiKey: string;
  apiUrl: string;
  propertyId: string;
}

export interface AvailabilityUpdate {
  roomTypeId: string;
  date: string; // ISO date string YYYY-MM-DD
  availableCount: number;
  price: number;
  minStay?: number;
  maxStay?: number;
  stopSell?: boolean;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
}

export interface IncomingReservation {
  externalId: string;
  channelCode: string; // "BOOKING_COM", "EXPEDIA", "AIRBNB"
  roomTypeExternalId: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number;
  currency: string;
  status: 'NEW' | 'MODIFIED' | 'CANCELLED';
}

export interface ChannelManagerAdapter {
  /**
   * Push availability and rate updates to the channel manager.
   * Called when rates or inventory change in the PMS.
   */
  pushAvailability(updates: AvailabilityUpdate[]): Promise<void>;

  /**
   * Pull new/modified/cancelled reservations from the channel manager.
   * Typically called on a webhook or polling interval.
   */
  pullReservations(): Promise<IncomingReservation[]>;

  /**
   * Confirm a reservation has been processed.
   */
  acknowledgeReservation(externalId: string): Promise<void>;

  /**
   * Health check for the channel manager connection.
   */
  testConnection(): Promise<boolean>;
}

// ============================================================
// Mock Implementation
// ============================================================

/**
 * Mock Channel Manager Adapter for development.
 *
 * TODO: Replace with real API integration.
 * Example providers:
 * - Channex: https://docs.channex.io/
 * - SiteMinder: https://developer.siteminder.com/
 */
export class MockChannelManagerAdapter implements ChannelManagerAdapter {
  private config: ChannelManagerConfig;

  constructor(config: ChannelManagerConfig) {
    this.config = config;
    console.log(
      `[ChannelManager] Initialized mock adapter for property: ${config.propertyId}`
    );
  }

  async pushAvailability(updates: AvailabilityUpdate[]): Promise<void> {
    console.log(
      `[ChannelManager] MOCK: Pushing ${updates.length} availability updates`,
      JSON.stringify(updates, null, 2)
    );
    // TODO: POST to channel manager API
    // await fetch(`${this.config.apiUrl}/availability`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.config.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     property_id: this.config.propertyId,
    //     updates,
    //   }),
    // });
  }

  async pullReservations(): Promise<IncomingReservation[]> {
    console.log('[ChannelManager] MOCK: Pulling reservations (returning empty)');
    // TODO: GET from channel manager API
    // const response = await fetch(
    //   `${this.config.apiUrl}/reservations?property_id=${this.config.propertyId}`,
    //   {
    //     headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
    //   }
    // );
    // return response.json();
    return [];
  }

  async acknowledgeReservation(externalId: string): Promise<void> {
    console.log(
      `[ChannelManager] MOCK: Acknowledging reservation ${externalId}`
    );
    // TODO: PUT to channel manager API
  }

  async testConnection(): Promise<boolean> {
    console.log('[ChannelManager] MOCK: Testing connection → OK');
    return true;
  }
}

// ============================================================
// Factory
// ============================================================

/**
 * Creates a channel manager adapter instance.
 * Switch to real implementation by changing this factory.
 */
export function createChannelManagerAdapter(
  config: ChannelManagerConfig
): ChannelManagerAdapter {
  // TODO: When ready for production, replace with:
  // return new ChannexAdapter(config);
  // return new SiteMinderAdapter(config);
  return new MockChannelManagerAdapter(config);
}

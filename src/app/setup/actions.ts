'use server';

import { prisma } from '@/lib/db/prisma';

export async function createTenant(formData: FormData, hostname: string) {
  
  const name = formData.get('name') as string;
  const subdomain = formData.get('subdomain') as string;
  const email = formData.get('email') as string;
  
  try {
    // Determine if we should map this to a customDomain (Render domain) or subdomain
    // For Render default domains (e.g. app.onrender.com), we map it to customDomain
    // so the middleware's `domain:app.onrender.com` logic picks it up.
    let customDomain = null;
    let finalSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // If they are accessing via a Render domain, bind it as a custom domain
    if (hostname && hostname.includes('onrender.com')) {
      customDomain = hostname;
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        subdomain: finalSubdomain,
        customDomain,
        email,
        brandingConfig: {
          primaryColor: '#0f172a',
          secondaryColor: '#f8fafc',
          logoUrl: 'https://via.placeholder.com/150x50?text=Logo'
        }
      }
    });

    // Create a default Room Type for them
    await prisma.roomType.create({
      data: {
        tenantId: tenant.id,
        name: 'Deluxe Double Room',
        category: 'Double',
        description: 'A beautiful and spacious double room with modern amenities.',
        maxOccupancy: 2,
        amenities: ['WiFi', 'Air Conditioning', 'TV'],
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop'],
        rooms: {
          create: [
            { roomNumber: '101' },
            { roomNumber: '102' },
            { roomNumber: '103' }
          ]
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Setup Error:', error);
    return { error: error.message || 'Failed to create tenant.' };
  }
}

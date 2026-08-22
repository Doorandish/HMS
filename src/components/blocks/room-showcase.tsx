import React from 'react';
import Link from 'next/link';
import { Wifi, Tv, Coffee, Maximize, Users } from 'lucide-react';

interface RoomType {
  id: string;
  name: string;
  description: string | null;
  baseOccupancy: number;
  maxOccupancy: number;
  size: number | null;
  images: any;
  amenities: any;
}

export function RoomShowcase({ rooms }: { rooms: RoomType[] }) {
  if (!rooms || rooms.length === 0) return null;

  return (
    <section id="rooms" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--tenant-primary)]">Accommodations</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience comfort and luxury in our thoughtfully designed rooms and suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => {
            const images = Array.isArray(room.images) ? room.images : [];
            const imgUrl = images[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop';
            
            return (
              <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={imgUrl} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-foreground">{room.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {room.description || 'A beautiful room for your stay.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users size={16} className="text-[var(--tenant-primary)]" />
                      <span>Up to {room.maxOccupancy}</span>
                    </div>
                    {room.size && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Maximize size={16} className="text-[var(--tenant-primary)]" />
                        <span>{room.size} m²</span>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  <div className="flex gap-3 mb-6 text-gray-400">
                    <Wifi size={18} />
                    <Tv size={18} />
                    <Coffee size={18} />
                  </div>
                  
                  <Link 
                    href={`/book?roomType=${room.id}`}
                    className="block w-full text-center py-3 px-4 bg-[var(--tenant-primary)] hover:bg-[var(--tenant-accent)] text-white font-medium rounded-lg transition-colors"
                  >
                    View Rates
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

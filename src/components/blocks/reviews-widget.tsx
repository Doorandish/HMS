import React from 'react';
import { Star, Quote } from 'lucide-react';

export function ReviewsWidget() {
  const reviews = [
    {
      author: "Sarah Jenkins",
      rating: 5,
      date: "August 2024",
      text: "Absolutely stunning property! The attention to detail in the rooms and the exceptional service from the staff made our anniversary trip unforgettable."
    },
    {
      author: "Michael Chen",
      rating: 5,
      date: "July 2024",
      text: "The perfect blend of luxury and comfort. We loved the breakfast buffet and the central location made exploring the city a breeze."
    },
    {
      author: "Emma Thompson",
      rating: 4,
      date: "June 2024",
      text: "Beautiful hotel with great amenities. The spa treatments were incredible. Would definitely return for another relaxing weekend."
    }
  ];

  return (
    <section id="reviews" className="py-20 bg-[var(--tenant-primary)] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Guest Experiences</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our recent guests have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 relative">
              <Quote className="absolute top-6 right-6 text-white/20" size={48} />
              
              <div className="flex gap-1 mb-6 text-[var(--tenant-accent)]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
              
              <p className="text-lg mb-6 leading-relaxed italic text-white/90">
                "{review.text}"
              </p>
              
              <div>
                <p className="font-bold">{review.author}</p>
                <p className="text-sm text-white/60">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

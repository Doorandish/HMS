import React from 'react';
import { Dumbbell, Utensils, Wifi, Car, Briefcase } from 'lucide-react';

export function ServicesSection() {
  const services = [
    {
      icon: <Utensils size={32} />,
      title: "Fine Dining",
      description: "Experience culinary excellence at our award-winning restaurant featuring local and international cuisine."
    },
    {
      icon: <Wifi size={32} />,
      title: "High-Speed WiFi",
      description: "Stay connected with complimentary high-speed fiber internet available throughout the property."
    },
    {
      icon: <Dumbbell size={32} />,
      title: "Fitness Center",
      description: "Maintain your workout routine in our fully-equipped, 24/7 fitness center."
    },
    {
      icon: <Car size={32} />,
      title: "Valet Parking",
      description: "Secure, on-site parking with optional valet service for your convenience."
    },
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--tenant-primary)]">Hotel Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for a perfect stay, designed with your comfort in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[var(--tenant-accent)] hover:shadow-lg transition-all duration-300 text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-[var(--tenant-primary)] group-hover:text-white group-hover:bg-[var(--tenant-accent)] transition-colors mb-6 shadow-sm">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Shield,
  Hotel, X, Wifi, Coffee, Car, Dumbbell,
  MapPin, Phone, Mail, Star, Clock
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const rooms = [
    {
      id: 1,
      name: 'Deluxe Suite',
      price: 2999,
      image: 'https://images.unsplash.com/photo-1758448755969-8791367cf5c5?crop=entropy&cs=srgb&fm=jpg&q=85',
      description: 'Spacious suite with king bed and city views'
    },
    {
      id: 2,
      name: 'Executive Room',
      price: 3999,
      image: 'https://images.unsplash.com/photo-1759264244746-140bbbc54e1b?crop=entropy&cs=srgb&fm=jpg&q=85',
      description: 'Modern comfort with premium amenities'
    },
    {
      id: 3,
      name: 'Premium Suite',
      price: 4999,
      image: 'https://images.unsplash.com/photo-1766928210443-0be92ed5884a?crop=entropy&cs=srgb&fm=jpg&q=85',
      description: 'Luxurious accommodation with living area'
    },
    {
      id: 4,
      name: 'Standard Room',
      price: 5999,
      image: 'https://images.unsplash.com/photo-1759264244764-2cb80f1a67bd?crop=entropy&cs=srgb&fm=jpg&q=85',
      description: 'Comfortable stay with essential amenities'
    },
  ];

  const features = [
    { icon: Shield, title: '24/7 Security', description: 'Round-the-clock security for your peace of mind' },
    { icon: Wifi, title: 'High-Speed WiFi', description: 'Stay connected with complimentary high-speed internet' },
    { icon: Coffee, title: 'Fine Dining', description: 'Exquisite culinary experiences at our restaurant' },
    { icon: Car, title: 'Valet Parking', description: 'Complimentary valet parking for all guests' },
    { icon: Dumbbell, title: 'Fitness Center', description: 'State-of-the-art gym equipment and facilities' },
    { icon: Clock, title: '24/7 Concierge', description: 'Dedicated staff to assist you anytime' },
  ];

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1758448755969-8791367cf5c5?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Luxury Hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-900/40 to-slate-900/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Experience Luxury
              <span className="block text-[#C6A87C]">Redefined</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Indulge in unparalleled comfort and sophistication at HM Hotel, where every moment is crafted to perfection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/rooms')}
                className="px-8 py-6 text-base font-medium bg-[#C6A87C] hover:bg-[#B09265] text-white rounded-lg transition-colors shadow-sm"
                data-testid="hero-book-button"
              >
                Book Your Stay
              </button>

              <a
                href="#rooms"
                data-testid="hero-explore-button"
                className="inline-block px-8 py-6 text-base font-medium bg-white/10 backdrop-blur-sm text-white border border-white hover:bg-white hover:text-slate-900 rounded-lg transition-colors"
              >
                Explore Rooms
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Luxury Rooms</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose from our selection of exquisitely designed rooms and suites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{room.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">₹{room.price}</span>
                      <span className="text-sm text-slate-600">/night</span>
                    </div>
                    <button
                      onClick={() => navigate('/rooms')}
                      className="px-4 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose-us" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why Choose HM Hotel</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover the amenities and services that make your stay exceptional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl bg-slate-50 p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100"
              >
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#C6A87C] transition-colors">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">About HM Hotel</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                HM Hotel stands as a beacon of luxury and sophistication in the heart of the city. With over two decades of excellence, we've mastered the art of hospitality, creating unforgettable experiences for our distinguished guests.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our commitment to exceptional service, combined with world-class amenities and elegant accommodations, ensures that every stay with us is nothing short of extraordinary.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div>
                  <div className="text-3xl font-bold text-[#C6A87C] mb-1">20+</div>
                  <div className="text-sm text-slate-600">Years of Excellence</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#C6A87C] mb-1">150+</div>
                  <div className="text-sm text-slate-600">Luxury Rooms</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#C6A87C] mb-1">50K+</div>
                  <div className="text-sm text-slate-600">Happy Guests</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1765439178218-e54dcbb64bcb?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Hotel Exterior"
                  className="rounded-2xl w-full h-64 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1736203301099-4602b44f2621?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Hotel Lobby"
                  className="rounded-2xl w-full h-64 object-cover mt-8"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Have questions? We're here to help you plan your perfect stay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Address</h3>
              <p className="text-slate-600">123 Luxury Avenue<br />Indore</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }} className="text-center">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Phone</h3>
              <p className="text-slate-600">+91 6267294142<br />24/7 Available</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="text-center">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Email</h3>
              <p className="text-slate-600">info@hmhotel.com<br />reservations@hmhotel.com</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#C6A87C] rounded-lg flex items-center justify-center">
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HM Hotel</span>
              </div>
              <p className="text-slate-400 text-sm">
                Experience luxury and comfort at its finest.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#rooms" className="hover:text-white transition-colors">Rooms</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Room Service</li>
                <li>Spa & Wellness</li>
                <li>Fine Dining</li>
                <li>Event Hosting</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>+91 6267294142</li>
                <li>info@hmhotel.com</li>
                <li>123 Luxury Avenue</li>
                <li>Indore</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>© {new Date().getFullYear()} HM Hotel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
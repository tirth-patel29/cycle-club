import React from 'react';
import { Camera, MapPin, Sparkles, Trophy } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';

interface GalleryItem {
  id: string;
  title: string;
  tag: string;
  location: string;
  description: string;
  imageUrl: string;
  alt: string;
  category: 'peloton' | 'route' | 'safety' | 'community';
}

const GALLERY_COLLECTION: GalleryItem[] = [
  {
    id: 'gal-01',
    title: 'Dawn Roll-Out from Town Hall',
    tag: 'Sunrise Stage',
    location: 'Anand Town Hall, Anand',
    description: 'Riders gathering in crisp morning air for safety briefings and gear checks before sunrise roll-out.',
    imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cyclists gathering at dawn before flag off',
    category: 'peloton'
  },
  {
    id: 'gal-02',
    title: 'Mahi Canal Paceline Cadence',
    tag: 'Paceline Training',
    location: 'Mahi Irrigation Canal Route',
    description: 'A disciplined rotating double echelon averaging 28 km/h along the smooth tarmac canal service roads.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    alt: 'Road cyclists in close paceline formation along canal road',
    category: 'peloton'
  },
  {
    id: 'gal-03',
    title: 'Charotar Century Highway Brevet',
    tag: '100K Century',
    location: 'Karamsad – Borsad Highway',
    description: 'Endurance riders conquering headwind stretches through lush banana and tobacco plantation corridors.',
    imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Endurance cyclist cruising along scenic rural highway',
    category: 'route'
  },
  {
    id: 'gal-04',
    title: 'SAG Vehicle & Mechanical Checkpoint',
    tag: 'Zero-Drop Escort',
    location: 'Mogar Highway Junction',
    description: 'Route marshals providing instant tire changes, floor pump air, and high-electrolyte hydration refills.',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Bicycle maintenance check and floor pump at support station',
    category: 'safety'
  },
  {
    id: 'gal-05',
    title: 'Mahi River Vantage Point',
    tag: 'Gravel & Canal Trails',
    location: 'Umreth River Bank',
    description: 'Evening leisure squad pausing by the water for sunset reflections and community camaraderie.',
    imageUrl: 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cyclist silhouette overlooking serene river at dusk',
    category: 'route'
  },
  {
    id: 'gal-06',
    title: 'Post-Ride Chai & Finishers Fellowship',
    tag: 'Club Culture',
    location: 'Anand Pelotons Grounds',
    description: 'Celebrating personal bests over steaming Gujarati masala chai, fresh breakfast, and route storytelling.',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    alt: 'Group of happy cyclists celebrating post-ride completion',
    category: 'community'
  }
];

export function GallerySection() {
  return (
    <section className="w-full bg-[#FFFFFF] border-t border-[#E5E6DE] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E6DE]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAEDE2] border border-[#E5E6DE] text-[#3F6212] text-xs font-bold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              <span>THE PELOTON IN ACTION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#171914] leading-tight">
              Moments from the Tarmac
            </h2>
            <p className="text-xs sm:text-sm text-[#62645C] font-medium leading-relaxed">
              Authentic glimpses of our morning pacelines, brevet checkpoints, highway SAG escorts, and post-ride celebrations across Anand and Charotar.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#62645C]">
            <Trophy className="w-4 h-4 text-[#3F6212]" />
            <span>Over 48+ Verified Club Rides Recorded</span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {GALLERY_COLLECTION.map((item) => (
            <div
              key={item.id}
              className="surface-card rounded-2xl sm:rounded-3xl border border-[#E5E6DE] overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all duration-300"
            >
              {/* Photo Container */}
              <div className="relative w-full aspect-[4/3] bg-[#171914] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.alt}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171914]/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5">
                  <span className="px-3 py-1 rounded-lg bg-[#FFFFFF]/90 backdrop-blur-md border border-[#E5E6DE] text-[10px] font-mono font-bold text-[#171914] uppercase tracking-wider shadow-xs">
                    {item.tag}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[11px] font-mono text-white/90">
                  <MapPin className="w-3.5 h-3.5 text-[#C7F36B] shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              {/* Caption & Context */}
              <div className="p-5 sm:p-6 space-y-2 flex-1 flex flex-col justify-between bg-[#FFFFFF]">
                <div>
                  <h3 className="text-base font-black uppercase text-[#171914] tracking-tight group-hover:text-[#3F6212] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#62645C] mt-1.5 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#E5E6DE] flex items-center justify-between text-[10px] font-mono font-bold text-[#8B8D83] uppercase">
                  <span>{CLUB_NAME} ARCHIVE</span>
                  <span className="text-[#3F6212]">VERIFIED STAGE</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

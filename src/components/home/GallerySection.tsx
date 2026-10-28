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
    title: 'Statue of Unity Expedition',
    tag: 'Landmark Brevet',
    location: 'Statue of Unity, Kevadia',
    description: 'Anand Cycling Club peloton gathered before the iconic 182-metre national landmark with the Indian Tricolor.',
    imageUrl: '/IMG_2032.JPG.jpeg',
    alt: 'The Anand Cycling Club riders at Statue of Unity holding the Indian flag',
    category: 'peloton'
  },
  {
    id: 'gal-02',
    title: 'Charotar Green Canopy Roll',
    tag: 'Weekend Group Ride',
    location: 'Charotar Rural Corridor, Anand',
    description: 'Lush morning road tour under ancient tree canopies featuring road, hybrid, and mountain bike riders.',
    imageUrl: '/IMG_0934.JPG.jpeg',
    alt: 'Anand Cycling Club riders lined up with bikes on scenic tree-lined highway',
    category: 'route'
  },
  {
    id: 'gal-03',
    title: 'Dawn Muster & Roll-Out',
    tag: 'Club Muster',
    location: 'R. K. & Sons Cycle Shop, Anand',
    description: 'Riders lined up with bicycles prepped, tires inflated, and helmets secured before morning roll-out.',
    imageUrl: '/IMG_1293.JPG.jpeg',
    alt: 'Cyclists on bikes gathered in the morning outside R. K. & Sons Cycle Shop',
    category: 'community'
  },
  {
    id: 'gal-04',
    title: 'Independence Day Cycling Rally',
    tag: 'Community Ride',
    location: 'Anand City Center',
    description: 'Celebrating national pride and fitness with junior riders, families, and seasoned endurance cyclists.',
    imageUrl: '/IMG_6852.JPG.jpeg',
    alt: 'Club riders with national flag and cycles outside R. K. & Sons',
    category: 'community'
  },
  {
    id: 'gal-05',
    title: 'The Anand Cycling Club Fellowship',
    tag: 'Official Club Portrait',
    location: 'R. K. & Sons Cycle Shop, Anand',
    description: 'Our diverse rider community in signature club jerseys united by the passion for two wheels.',
    imageUrl: '/main.jpeg',
    alt: 'Official group photograph of The Anand Cycling Club outside R. K. & Sons',
    category: 'peloton'
  },
  {
    id: 'gal-06',
    title: 'SAG Support & Zero-Drop Checkpoint',
    tag: 'Zero-Drop Support',
    location: 'Mahi Expressway Corridor',
    description: 'Every Anand Cycling Club ride is backed by hydration points, mobile mechanics, and a zero-drop escort van.',
    imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cyclists riding safely in paceline with route support',
    category: 'safety'
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

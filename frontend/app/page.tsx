'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../providers/auth-provider';
import { useLanguage } from '../providers/language-provider';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import api from './lib/api';
import { 
  BookOpen, 
  Video, 
  ShoppingBag, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award, 
  Compass, 
  Star, 
  ArrowRight, 
  Check, 
  Menu, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles,
  Laptop,
  GraduationCap,
  Briefcase,
  UserCheck,
  Building2,
  ChevronRight,
  ChevronLeft,
  Music,
  Palette,
  Code2,
  Cpu,
  Bot,
  Camera,
  PenTool,
  ShieldCheck,
  ClipboardList,
  BarChart2,
  Newspaper,
  Trophy,
  Globe,
  Send,
  Heart,
  MessageSquare
} from 'lucide-react';

// Custom interfaces for better typing
interface PopularTrack {
  id: string;
  name: string;
  count: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function Home() {
  const { user } = useAuth();
  const { language, t, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener for sticky header blur effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real hobbies/courses from backend as a fallback/enhancement
  const { data: hobbies } = useQuery({
    queryKey: ['hobbies-popular'],
    queryFn: async () => {
      try {
        const response = await api.get('/hobbies?limit=6');
        return response.data?.data || [];
      } catch {
        // Backend not available — silently fall back to static data
        return [];
      }
    },
    retry: 1,
  });

  // Popular tracks data as specified in UI/UX Prompt
  const popularTracks: PopularTrack[] = [
    { id: '1', name: language === 'am' ? 'ሙዚቃ' : 'Music', count: language === 'am' ? '12 ኮርሶች' : '12 Courses', icon: <Music className="w-6 h-6 text-[#FF7A45]" />, color: '#FF7A45', bg: 'bg-white border border-gray-100 shadow-sm' },
    { id: '2', name: language === 'am' ? 'ስዕል እና እደ ጥበብ' : 'Art & Craft', count: language === 'am' ? '18 ኮርሶች' : '18 Courses', icon: <Palette className="w-6 h-6 text-[#FF7A45]" />, color: '#FF7A45', bg: 'bg-white border border-gray-100 shadow-sm' },
    { id: '3', name: language === 'am' ? 'ኮዲንግ' : 'Coding', count: language === 'am' ? '15 ኮርሶች' : '15 Courses', icon: <Code2 className="w-6 h-6 text-[#FF7A45]" />, color: '#FF7A45', bg: 'bg-white border border-gray-100 shadow-sm' },
    { id: '4', name: language === 'am' ? 'ውዝዋዜ' : 'Dance', count: language === 'am' ? '24 ኮርሶች' : '24 Courses', icon: <Sparkles className="w-6 h-6 text-[#FF7A45]" />, color: '#FF7A45', bg: 'bg-white border border-gray-100 shadow-sm' },
    { id: '5', name: language === 'am' ? 'ሮቦቲክስ' : 'Robotics', count: language === 'am' ? '10 ኮርሶች' : '10 Courses', icon: <Cpu className="w-6 h-6 text-[#FF7A45]" />, color: '#FF7A45', bg: 'bg-white border border-gray-100 shadow-sm' },
    { id: '6', name: language === 'am' ? 'ፎቶግራፊ' : 'Photography', count: language === 'am' ? '8 ኮርሶች' : '8 Courses', icon: <Camera className="w-6 h-6 text-[#FF7A45]" />, color: '#FF7A45', bg: 'bg-white border border-gray-100 shadow-sm' },
    { id: '7', name: language === 'am' ? 'ፅሁፍ' : 'Writing', count: language === 'am' ? '14 ኮርሶች' : '14 Courses', icon: <PenTool className="w-6 h-6 text-[#FF7A45]" />, color: '#FF7A45', bg: 'bg-white border border-gray-100 shadow-sm' },
  ];

  // How it works steps
  const steps = [
    { number: '01', title: language === 'am' ? 'የፍላጎት ጥያቄዎችን ይመልሱ' : 'Take Interest Quiz', description: language === 'am' ? 'ከባህሪዎ እና ከእድሜዎ ጋር የሚዛመዱ የትርፍ ጊዜ ፍላጎቶችን ለማግኘት አዝናኝ ጥያቄዎችን ይመልሱ።' : 'Answer fun questions to discover hobbies that match your personality and age.' },
    { number: '02', title: language === 'am' ? 'ከባለሙያዎች ይማሩ' : 'Learn from Experts', description: language === 'am' ? 'ከባለሙያ መምህራን ጋር በቀጥታ የቀጥታ ክፍሎች ውስጥ ይሳተፉ።' : 'Join live interactive classes with professional teachers.' },
    { number: '03', title: language === 'am' ? 'ሂደትዎን ይከታተሉ' : 'Track & Achieve', description: language === 'am' ? 'ሂደትዎን ይከታተሉ፣ የምስክር ወረቀቶችን ያግኙ እና ስኬቶችን ይክፈቱ።' : 'Track your progress, earn certificates, and unlock achievements.' },
    { number: '04', title: language === 'am' ? 'ስራዎን ያሳዩ' : 'Showcase & Grow', description: language === 'am' ? 'ፕሮጀክቶችዎን ያጋሩ፣ በሁነቶች ላይ ይሳተፉ እና ሽልማቶችንና የስኮላርሺፕ ዕድሎችን ያሸንፉ።' : 'Share your projects, join events, and win prizes and scholarships.' },
  ];

  // Who is it for cards
  const targets = [
    { 
      title: language === 'am' ? 'ተማሪዎች (5-18)' : 'Students (5-18)', 
      desc: language === 'am' ? 'ፍላጎትዎን ያግኙ።' : 'Discover your passion.', 
      details: language === 'am' ? 'አዳዲስ ክህሎቶችን ይማሩ፣ የምስክር ወረቀቶችን ያግኙ እና ስራዎን ያጋሩ።' : 'Learn new skills, earn certificates, and share your work.',
      icon: <GraduationCap className="w-8 h-8 text-[#FF7A45]" /> 
    },
    { 
      title: language === 'am' ? 'ወላጆች' : 'Parents', 
      desc: language === 'am' ? 'እድገታቸውን ይደግፉ።' : 'Support their growth.', 
      details: language === 'am' ? 'የልጆችን ሂደት ይከታተሉ፣ ክፍያዎችን ይፈጽሙ እና ስለ ስኬቶቻቸው መረጃዎችን ያግኙ።' : 'Monitor progress, make payments, and get updates on achievements.',
      icon: <Users className="w-8 h-8 text-[#FF7A45]" /> 
    },
    { 
      title: language === 'am' ? 'መምህራን እና ባለሙያዎች' : 'Teachers & Experts', 
      desc: language === 'am' ? 'እውቀትዎን ያጋሩ።' : 'Share your knowledge.', 
      details: language === 'am' ? 'የቀጥታ ትምህርት ያስተምሩ፣ ተማሪዎችን ያስተዳድሩ፣ ገቢ ያግኙ እና የማስተማር ስራዎን ያሳድጉ።' : 'Teach live, manage students, earn income, and grow your teaching business.',
      icon: <UserCheck className="w-8 h-8 text-[#FF7A45]" /> 
    },
    { 
      title: language === 'am' ? 'ትምህርት ቤቶች' : 'Schools', 
      desc: language === 'am' ? 'ካሪኩለምን ያበልጽጉ።' : 'Enrich curriculum.', 
      details: language === 'am' ? 'የተደራጁ የክህሎት ማበልፀጊያ ፕሮግራሞችን ያቅርቡ፣ የተሳትፎ ሪፖርቶችን ያግኙ።' : 'Offer organized programs, track participation, and generate reports.',
      icon: <Building2 className="w-8 h-8 text-[#FF7A45]" /> 
    },
  ];

  // Everything in One Platform (replaces features)
  const features = [
    { title: language === 'am' ? 'የፍላጎት ጥያቄዎች' : 'Interest Quiz', desc: language === 'am' ? 'ከእድሜዎ እና ከስብዕናዎ ጋር የሚስማሙ የትርፍ ጊዜ ክህሎቶችን ያግኙ።' : 'Find hobbies that fit your age and personality traits.', icon: <ClipboardList className="w-6 h-6 text-[#FF7A45]" /> },
    { title: language === 'am' ? 'የቀጥታ ክፍሎች' : 'Live Sessions', desc: language === 'am' ? 'በአነስተኛ ቡድኖች ውስጥ ከባለሙያ መምህራን ጋር ይገናኙ።' : 'Interact with professional teachers in small-group cohorts.', icon: <Video className="w-6 h-6 text-[#FF7A45]" /> },
    { title: language === 'am' ? 'የሂደት ክትትል' : 'Progress Tracking', desc: language === 'am' ? 'የሂደት ገበታዎች፣ ደረጃዎች እና ሊከፈቱ የሚችሉ ስኬቶች።' : 'Gamified dashboards, milestones, and unlockable achievements.', icon: <BarChart2 className="w-6 h-6 text-[#FF7A45]" /> },
    { title: language === 'am' ? 'የገበያ ቦታ' : 'Marketplace', desc: language === 'am' ? 'ለፕሮጀክቶች የሚያስፈልጉ ቁሳቁሶችን፣ የመማሪያ ኪቶችን እና መጽሃፎችን ይግዙ።' : 'Secure project materials, starter kits, and learning books.', icon: <ShoppingBag className="w-6 h-6 text-[#FF7A45]" /> },
    { title: language === 'am' ? 'የተማሪ ብሎግ' : 'Student Blog', desc: language === 'am' ? 'ታሪኮችን ያንብቡ፣ የመማሪያ ማስታወሻዎችን ያጋሩ እና የመማሪያ ምክሮችን ያግኙ።' : 'Read stories, share your learning logs, and read tutorial tips.', icon: <Newspaper className="w-6 h-6 text-[#FF7A45]" /> },
    { title: language === 'am' ? 'ወርሃዊ ሁነቶች' : 'Monthly Events', desc: language === 'am' ? 'ፕሮጀክቶችን ያሳዩ፣ በውድድሮች ላይ ይሳተፉ እና ሽልማቶችን ያሸንፉ።' : 'Showcase projects, compete in hackathons, and win awards.', icon: <Trophy className="w-6 h-6 text-[#FF7A45]" /> },
    { title: language === 'am' ? 'የስኮላርሺፕ ዕድሎች' : 'Scholarships', desc: language === 'am' ? 'በስፖንሰሮች የተሸፈኑ የትምህርት ክፍሎችን እና ሙሉ የገንዘብ ድጋፍ ያላቸውን ፕሮግራሞች ያግኙ።' : 'Unlock sponsored learning tracks and fully funded programs.', icon: <GraduationCap className="w-6 h-6 text-[#FF7A45]" /> },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Mekdes A.',
      role: language === 'am' ? 'ወላጅ' : 'Parent',
      stars: 5,
      text: language === 'am' ? 'ሆቢሀብ ልጄ ለስዕል ጥበብ ያላትን ፍቅር እንድታገኝ ረድቷታል። መምህራኖቹ በጣም ጥሩ እና ትምህርቱን አስደሳች ያደርጉታል።' : 'HobbyHub helped my daughter discover her love for art. The teachers are amazing and make learning fun.',
      image: '/logo.png'
    },
    {
      name: 'Samuel T.',
      role: language === 'am' ? 'ተማሪ' : 'Student',
      stars: 5,
      text: language === 'am' ? 'ኮዲንግ ተምሬ የመጀመሪያውን መተግበሪያዬን ሰራሁ! የቀጥታ ክፍሎቹ በጣም አስደሳች እና ለመከታተል ቀላል ናቸው።' : 'I learned coding and built my first app! The live classes are fun and easy to follow.',
      image: '/logo.png'
    },
    {
      name: 'Mr. Tesfaye',
      role: language === 'am' ? 'የትምህርት ቤት አስተዳዳሪ' : 'School Administrator',
      stars: 5,
      text: language === 'am' ? 'በትምህርት ቤታችን ውስጥ የትርፍ ጊዜ ስራዎችን እና ማበልፀጊያ ፕሮግራሞችን በሆቢሀብ የትምህርት ቤት ዳሽቦርድ ማስተዳደር በጣም ቀላል ሆኗል።' : "Managing extracurricular programs is now so easy with HobbyHub's school dashboard.",
      image: '/logo.png'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937] font-sans selection:bg-[#FF7A45] selection:text-white">
      
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:py-40 bg-[#FFF2EB] overflow-hidden relative">
        {/* Soft Peach Blob Background */}
        <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FFE2D4] filter blur-3xl opacity-60 z-0 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Details */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <h1 className="text-4xl md:text-5xl lg:text-[64px] lg:leading-[72px] font-extrabold text-[#1F2937] tracking-tight mb-6">
                {language === 'am' ? 'ያግኙ። ይማሩ።' : 'Discover. Learn.'} <br />
                <span className="text-[#FF7A45]">{language === 'am' ? 'ይፍጠሩ። ያብሩ።' : 'Create. Shine.'}</span>
              </h1>
              
              <p className="text-base md:text-lg lg:text-[18px] text-[#6B7280] leading-relaxed mb-8 max-w-xl">
                {language === 'am' 
                  ? 'ሆቢሀብ ኢዱኬሽን ተማሪዎች ተስማሚ የትርፍ ጊዜ ፍላጎቶቻቸውን እንዲያገኙ፣ ከባለሙያዎች እንዲማሩ፣ ሂደታቸውን እንዲከታተሉ እና ክህሎቶቻቸውን እንዲያሳዩ ይረዳል።' 
                  : 'HobbyHub Education helps students discover their ideal hobbies, learn from experts, track progress, and showcase their talents.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
                <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-[#FF7A45] text-[#1F2937] font-bold hover:bg-[#ff8f61] hover:scale-103 active:scale-98 transition-all duration-200 shadow-lg shadow-[#FF7A45]/30">
                    {t('nav.getStarted')}
                  </button>
                </Link>
                <Link href="/hobbies" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-14 px-10 rounded-2xl border border-[#FF7A45] text-[#FF7A45] hover:bg-[#FF7A45]/5 font-bold transition-all">
                    {language === 'am' ? 'የፍላጎት ጥያቄዎችን ይመልሱ' : 'Take Interest Quiz'}
                  </button>
                </Link>
              </div>

              {/* Badges Under Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-orange-200/60 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#FF7A45]">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937]">{language === 'am' ? 'ባለሙያ መምህራን' : 'Expert Teachers'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#FF7A45]">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937]"> {language === 'am' ? 'የቀጥታ ክፍሎች' : 'Live Classes'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#FF7A45]">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937]">{language === 'am' ? 'ሰርተፊኬቶች' : 'Certificates'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#FF7A45]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937]">{language === 'am' ? 'ደህንነቱ የተጠበቀ' : 'Safe & Secure'}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Column */}
            <div className="lg:col-span-6 flex justify-center relative">
              <div className="relative w-full max-w-[520px] h-[480px] md:h-[540px]">
                {/* Decorative background blob */}
                <div className="absolute inset-0 bg-[#FFE2D4] rounded-[48px] rounded-tr-[120px] rounded-bl-[120px] -rotate-2 -z-10" />
                
                {/* Main Student Image */}
                <div className="w-full h-full rounded-[48px] rounded-tr-[120px] rounded-bl-[120px] overflow-hidden shadow-2xl relative bg-white">
                  <Image 
                    src="/hero-girl.png" 
                    alt="HobbyHub Student" 
                    fill 
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORY SECTION: Popular Hobby Categories */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-[36px] font-extrabold text-[#1F2937] tracking-tight">
              {language === 'am' ? 'ተወዳጅ የትርፍ ጊዜ ምድቦች' : 'Popular Hobby Categories'}
            </h2>
            <div className="flex gap-4 items-center">
              <Link href="/hobbies" className="text-sm font-bold text-[#FF7A45] hover:text-[#ff8f61] transition-colors">
                {language === 'am' ? 'ሁሉንም አሳይ' : 'View all'}
              </Link>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById('categories-scroll-container');
                    if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-full border border-gray-200 text-[#1F2937] hover:bg-gray-50 active:scale-90 transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('categories-scroll-container');
                    if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-full border border-gray-200 text-[#1F2937] hover:bg-gray-50 active:scale-90 transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Scroll Carousel */}
          <div 
            id="categories-scroll-container"
            className="flex gap-5 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x"
            style={{ scrollbarWidth: 'none' }}
          >
            {popularTracks.map((track) => (
              <div 
                key={track.id}
                className="min-w-[140px] w-[140px] h-[140px] flex-shrink-0 snap-start bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:translate-y-[-4px] hover:shadow-md hover:border-[#FF7A45]/20 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] mb-3 group-hover:scale-105 transition-transform duration-300">
                  {track.icon}
                </div>
                <h3 className="font-bold text-xs text-[#1F2937] text-center leading-snug">{track.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Student Circular Container */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] rounded-full bg-[#FFF2EB] border-2 border-dashed border-[#FF7A45]/20 p-4 flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden shadow-xl relative bg-white">
                  <Image 
                    src="/how-it-works-boy.png" 
                    alt="HobbyHub Methodology" 
                    fill
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-105 transition-transform duration-500 animate-pulse-subtle"
                  />
                </div>
              </div>
            </div>

            {/* Right 4-step Process */}
            <div className="lg:col-span-7 flex flex-col items-start pl-0 lg:pl-8">
              <h2 className="text-2xl md:text-3xl lg:text-[40px] font-extrabold text-[#1F2937] tracking-tight mb-8">
                {language === 'am' ? 'ሆቢሀብ እንዴት ይሰራል?' : 'How HobbyHub Works'}
              </h2>
              
              <div className="flex flex-col gap-8 w-full">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-full bg-[#FF7A45] text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-md shadow-[#FF7A45]/20">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1F2937] mb-1">{step.title}</h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed max-w-xl">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHO IS IT FOR SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-[36px] font-extrabold text-[#1F2937] tracking-tight mb-12">
            {language === 'am' ? 'ሆቢሀብ ለማን ነው?' : 'Who is HobbyHub For?'}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targets.map((target, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100 rounded-[24px] p-8 flex flex-col items-center text-center hover:translate-y-[-6px] hover:shadow-xl hover:border-orange-100 transition-all duration-300 group cursor-default"
              >
                <div className="w-16 h-16 rounded-full bg-[#FFF2EB] flex items-center justify-center mb-6 group-hover:bg-[#FF7A45] group-hover:text-white transition-colors duration-300">
                  {target.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{target.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{target.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVERYTHING IN ONE PLATFORM SECTION */}
      <section className="py-20 bg-[#FAFAFA] border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-[36px] font-extrabold text-[#1F2937] tracking-tight mb-4">
              {language === 'am' ? 'ሁሉም በአንድ መድረክ' : 'Everything in One Platform'}
            </h2>
            <p className="text-base text-[#6B7280]">
              {language === 'am' 
                ? 'ለፈጠራ እድገት በተዘጋጁት አጠቃላይ ባህሪያቶቻችን በመጠቀም ይወቁ፣ ይማሩ እና ያድጉ።' 
                : 'Discover, learn, and grow using our comprehensive features built for creative development.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 justify-center">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-orange-100 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFF2EB] text-[#FF7A45] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-[#1F2937] leading-tight">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-[36px] font-extrabold text-[#1F2937] tracking-tight">
              {language === 'am' ? 'የተማሪዎቻችን ምስክርነት' : 'What People Say'}
            </h2>
            <Link href="/testimonials" className="text-sm font-bold text-[#FF7A45] hover:text-[#ff8f61] transition-colors">
              {language === 'am' ? 'ሁሉንም አሳይ' : 'View all'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100 rounded-[24px] p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-orange-100"
                style={{ height: '260px' }}
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[#6B7280] text-sm md:text-base leading-relaxed italic mb-6">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFE2D4] relative overflow-hidden flex items-center justify-center font-bold text-[#FF7A45]">
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1F2937] text-sm">{item.name}</h4>
                    <span className="text-xs text-[#9CA3AF]">{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-[#FFF2EB] rounded-[32px] p-8 md:p-16 relative overflow-hidden shadow-xl shadow-[#FF7A45]/5 flex flex-col items-center text-center border border-orange-100/50">
            
            {/* Interactive Grid Accent */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#FF7A45_1px,transparent_1px),linear-gradient(to_bottom,#FF7A45_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
            
            {/* Floating illustrations on desktop */}
            <div className="hidden lg:block absolute left-12 bottom-0 w-[220px] h-[220px]">
              <Image src="/cta-boy.png" alt="HobbyHub student" fill style={{ objectFit: 'contain' }} />
            </div>
            <div className="hidden lg:block absolute right-12 bottom-0 w-[220px] h-[220px]">
              <Image src="/cta-girl.png" alt="HobbyHub student learning" fill style={{ objectFit: 'contain' }} />
            </div>

            <div className="max-w-2xl relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#1F2937] tracking-tight leading-tight mb-4">
                {language === 'am' ? 'ዛሬውኑ የሆቢሀብ አባል ይሁኑ!' : 'Join HobbyHub Education Today!'}
              </h2>
              <p className="text-base md:text-lg text-[#6B7280] leading-relaxed mb-8 max-w-lg mx-auto">
                {language === 'am' ? 'ፍላጎትዎን ያግኙ። አዳዲስ ክህሎቶችን ይማሩ። የወደፊት ህይወትዎን ይገንቡ።' : 'Discover your passion. Learn new skills. Build your future.'}
              </p>
              
              <Link href="/register">
                <button className="h-14 px-10 rounded-2xl bg-[#FF7A45] text-white font-bold hover:bg-[#ff8f61] hover:scale-103 active:scale-98 transition-all duration-200 shadow-lg shadow-[#FF7A45]/30">
                  {language === 'am' ? 'አሁን ይመዝገቡ' : 'Sign Up Now'}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1F2937] text-white pt-20 pb-10 border-t border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            
            {/* Column Brand Info */}
            <div className="col-span-2 flex flex-col items-start gap-5">
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="HobbyHub Education" 
                  width={150} 
                  height={38} 
                  className="h-9 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-sm">
                {t('footer.desc')}
              </p>
              <div className="flex gap-4 mt-2">
                <a href="#" className="p-2 rounded-lg bg-gray-800 text-[#9CA3AF] hover:text-[#FF7A45] hover:bg-gray-700 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-gray-800 text-[#9CA3AF] hover:text-[#FF7A45] hover:bg-gray-700 transition-colors">
                  <Send className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-gray-800 text-[#9CA3AF] hover:text-[#FF7A45] hover:bg-gray-700 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-gray-800 text-[#9CA3AF] hover:text-[#FF7A45] hover:bg-gray-700 transition-colors">
                  <Video className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Column 1: Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">
                {language === 'am' ? 'ፈጣን ሊንኮች' : 'Quick Links'}
              </h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="/" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.home')}</Link></li>
                <li><Link href="/hobbies" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.courses')}</Link></li>
                <li><Link href="/events" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.events')}</Link></li>
                <li><Link href="/blog" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.blog')}</Link></li>
                <li><Link href="/about" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.about')}</Link></li>
              </ul>
            </div>

            {/* Column 2: Support */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">
                {language === 'am' ? 'ድጋፍ' : 'Support'}
              </h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="/help" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{language === 'am' ? 'የእርዳታ ማዕከል' : 'Help Center'}</Link></li>
                <li><Link href="/contact" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{language === 'am' ? 'አግኙን' : 'Contact Us'}</Link></li>
                <li><Link href="/privacy" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{language === 'am' ? 'የግላዊነት ፖሊሲ' : 'Privacy Policy'}</Link></li>
                <li><Link href="/terms" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{language === 'am' ? 'የአጠቃቀም ደንቦች' : 'Terms of Use'}</Link></li>
                <li><Link href="/faq" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{language === 'am' ? 'ተደጋጋሚ ጥያቄዎች (FAQ)' : 'FAQ'}</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact & Language */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">
                {language === 'am' ? 'አድራሻ' : 'Contact'}
              </h4>
              <ul className="flex flex-col gap-4 mb-6">
                <li className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <Phone className="w-4 h-4 text-[#FF7A45]" />
                  <span>+251 911 234 567</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <Mail className="w-4 h-4 text-[#FF7A45]" />
                  <span>info@hobbyhub.et</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <MapPin className="w-4 h-4 text-[#FF7A45]" />
                  <span>{language === 'am' ? 'አዲስ አበባ፣ ኢትዮጵያ' : 'Addis Ababa, Ethiopia'}</span>
                </li>
              </ul>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    language === 'en' ? 'bg-[#FF7A45] text-[#1F2937]' : 'bg-gray-800 text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('am')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    language === 'am' ? 'bg-[#FF7A45] text-[#1F2937]' : 'bg-gray-800 text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  አማርኛ
                </button>
              </div>
            </div>

          </div>

          {/* Copyright Area */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#9CA3AF]">
              © {new Date().getFullYear()} HobbyHub Education. {language === 'am' ? 'መብቱ በህግ የተጠበቀ ነው።' : 'All rights reserved.'}
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-xs text-[#9CA3AF] hover:text-white transition-colors">{language === 'am' ? 'የአጠቃቀም ደንቦች' : 'Terms of Use'}</Link>
              <Link href="/privacy" className="text-xs text-[#9CA3AF] hover:text-white transition-colors">{language === 'am' ? 'የግላዊነት ፖሊሲ' : 'Privacy Policy'}</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
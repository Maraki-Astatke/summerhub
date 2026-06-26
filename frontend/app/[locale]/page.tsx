'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {
  BookOpen, Video, ShoppingBag, Users, Calendar, Award,
  Mail, Phone, MapPin, Sparkles, GraduationCap,
  UserCheck, Building2, Music, Palette, Code2, Cpu, Camera,
  PenTool, ShieldCheck, ClipboardList, BarChart2, Newspaper, Trophy,
  Star, ChevronLeft, ChevronRight, Globe, Send, MessageSquare
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: hobbies } = useQuery({
    queryKey: ['hobbies-popular'],
    queryFn: async () => {
      try {
        const response = await api.get('/hobbies?limit=6');
        return response.data?.data || [];
      } catch {
        return [];
      }
    },
    retry: 1,
  });

  const popularTracks = [
    { id: '1', name: t('categories.music'), icon: <Music className="w-6 h-6 text-[#FF7A45]" /> },
    { id: '2', name: t('categories.art'), icon: <Palette className="w-6 h-6 text-[#FF7A45]" /> },
    { id: '3', name: t('categories.coding'), icon: <Code2 className="w-6 h-6 text-[#FF7A45]" /> },
    { id: '4', name: t('categories.dance'), icon: <Sparkles className="w-6 h-6 text-[#FF7A45]" /> },
    { id: '5', name: t('categories.robotics'), icon: <Cpu className="w-6 h-6 text-[#FF7A45]" /> },
    { id: '6', name: t('categories.photography'), icon: <Camera className="w-6 h-6 text-[#FF7A45]" /> },
    { id: '7', name: t('categories.writing'), icon: <PenTool className="w-6 h-6 text-[#FF7A45]" /> },
  ];

  const steps = [
    { number: '01', title: t('step1.title'), description: t('step1.desc') },
    { number: '02', title: t('step2.title'), description: t('step2.desc') },
    { number: '03', title: t('step3.title'), description: t('step3.desc') },
    { number: '04', title: t('step4.title'), description: t('step4.desc') },
  ];

  const targets = [
    { title: t('target.students.title'), details: t('target.students.details'), icon: <GraduationCap className="w-8 h-8 text-[#FF7A45]" /> },
    { title: t('target.parents.title'), details: t('target.parents.details'), icon: <Users className="w-8 h-8 text-[#FF7A45]" /> },
    { title: t('target.teachers.title'), details: t('target.teachers.details'), icon: <UserCheck className="w-8 h-8 text-[#FF7A45]" /> },
    { title: t('target.schools.title'), details: t('target.schools.details'), icon: <Building2 className="w-8 h-8 text-[#FF7A45]" /> },
  ];

  const features = [
    { title: t('features.quiz.title'), icon: <ClipboardList className="w-6 h-6 text-[#FF7A45]" /> },
    { title: t('features.live.title'), icon: <Video className="w-6 h-6 text-[#FF7A45]" /> },
    { title: t('features.progress.title'), icon: <BarChart2 className="w-6 h-6 text-[#FF7A45]" /> },
    { title: t('features.marketplace.title'), icon: <ShoppingBag className="w-6 h-6 text-[#FF7A45]" /> },
    { title: t('features.blog.title'), icon: <Newspaper className="w-6 h-6 text-[#FF7A45]" /> },
    { title: t('features.events.title'), icon: <Trophy className="w-6 h-6 text-[#FF7A45]" /> },
    { title: t('features.scholarships.title'), icon: <GraduationCap className="w-6 h-6 text-[#FF7A45]" /> },
  ];

  const testimonials = [
    { name: 'Mekdes A.', role: t('testimonials.parent'), text: t('testimonials.mekdes.text') },
    { name: 'Samuel T.', role: t('testimonials.student'), text: t('testimonials.samuel.text') },
    { name: 'Mr. Tesfaye', role: t('testimonials.admin'), text: t('testimonials.tesfaye.text') },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937] font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:py-40 bg-[#FFF2EB] overflow-hidden relative">
        <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FFE2D4] filter blur-3xl opacity-60 z-0 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <h1 className="text-4xl md:text-5xl lg:text-[64px] lg:leading-[72px] font-extrabold text-[#1F2937] tracking-tight mb-6">
                {t('hero.title')} <br />
                <span className="text-[#FF7A45]">{t('hero.titleHighlight')}</span>
              </h1>

              <p className="text-base md:text-lg lg:text-[18px] text-[#6B7280] leading-relaxed mb-8 max-w-xl">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
                <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-[#FF7A45] text-[#1F2937] font-bold hover:bg-[#ff8f61] transition-all duration-200 shadow-lg shadow-[#FF7A45]/30">
                    {t('nav.getStarted')}
                  </button>
                </Link>
                <Link href="/quiz" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-14 px-10 rounded-2xl border border-[#FF7A45] text-[#FF7A45] hover:bg-[#FF7A45]/5 font-bold transition-all">
                    {t('button.takeQuiz')}
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-orange-200/60 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#FF7A45]">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937]">{t('badges.expertTeachers')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#FF7A45]">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937]">{t('badges.liveClasses')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#FF7A45]">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937]">{t('badges.certificates')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#FF7A45]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#1F2937]">{t('badges.safeSecure')}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center relative">
              <div className="relative w-full max-w-[520px] h-[480px] md:h-[540px]">
                <div className="absolute inset-0 bg-[#FFE2D4] rounded-[48px] rounded-tr-[120px] rounded-bl-[120px] -rotate-2 -z-10" />
                <div className="w-full h-full rounded-[48px] rounded-tr-[120px] rounded-bl-[120px] overflow-hidden shadow-2xl relative bg-white">
                  <Image src="/hero-girl.png" alt="HobbyHub Student" fill style={{ objectFit: 'cover' }} className="hover:scale-105 transition-transform duration-500" priority />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-[36px] font-extrabold text-[#1F2937] tracking-tight">
              {t('categories.title')}
            </h2>
            <div className="flex gap-4 items-center">
              <Link href="/hobbies" className="text-sm font-bold text-[#FF7A45] hover:text-[#ff8f61] transition-colors">
                {t('button.viewAll')}
              </Link>
            </div>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none">
            {popularTracks.map((track) => (
              <div key={track.id} className="min-w-[140px] w-[140px] h-[140px] flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 group cursor-pointer">
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
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] rounded-full bg-[#FFF2EB] border-2 border-dashed border-[#FF7A45]/20 p-4 flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden shadow-xl relative bg-white">
                  <Image src="/how-it-works-boy.png" alt="HobbyHub Methodology" fill style={{ objectFit: 'cover' }} className="hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col items-start pl-0 lg:pl-8">
              <h2 className="text-2xl md:text-3xl lg:text-[40px] font-extrabold text-[#1F2937] tracking-tight mb-8">
                {t('howItWorks.title')}
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
            {t('whoIsFor.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targets.map((target, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-[24px] p-8 flex flex-col items-center text-center hover:translate-y-[-6px] hover:shadow-xl transition-all duration-300 group cursor-default">
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
              {t('platform.title')}
            </h2>
            <p className="text-base text-[#6B7280]">{t('platform.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 justify-center">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF2EB] text-[#FF7A45] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-[#1F2937] leading-tight">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-[36px] font-extrabold text-[#1F2937] tracking-tight">
              {t('testimonials.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-[24px] p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg" style={{ height: '260px' }}>
                <div>
                  <p className="text-[#6B7280] text-sm md:text-base leading-relaxed italic mb-6">&ldquo;{item.text}&rdquo;</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFE2D4] flex items-center justify-center font-bold text-[#FF7A45]">
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
          <div className="bg-[#FFF2EB] rounded-[32px] p-8 md:p-16 relative overflow-hidden shadow-xl flex flex-col items-center text-center border border-orange-100/50">
            <div className="max-w-2xl relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#1F2937] tracking-tight leading-tight mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-base md:text-lg text-[#6B7280] leading-relaxed mb-8 max-w-lg mx-auto">
                {t('cta.subtitle')}
              </p>
              <Link href="/register">
                <button className="h-14 px-10 rounded-2xl bg-[#FF7A45] text-white font-bold hover:bg-[#ff8f61] transition-all duration-200 shadow-lg shadow-[#FF7A45]/30">
                  {t('button.signUp')}
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
            <div className="col-span-2 flex flex-col items-start gap-5">
              <Image src="/logo.png" alt="HobbyHub Education" width={150} height={38} className="h-9 w-auto object-contain brightness-0 invert" />
              <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-sm">{t('footer.desc')}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">{t('footer.quickLinks')}</h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="/" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.home')}</Link></li>
                <li><Link href="/hobbies" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.courses')}</Link></li>
                <li><Link href="/events" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.events')}</Link></li>
                <li><Link href="/blog" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.blog')}</Link></li>
                <li><Link href="/about" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('nav.about')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">{t('footer.support')}</h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="/help" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('footer.helpCenter')}</Link></li>
                <li><Link href="/privacy" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link href="/terms" className="text-sm text-[#9CA3AF] hover:text-white transition-colors">{t('footer.terms')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6">{t('footer.contact')}</h4>
              <ul className="flex flex-col gap-4 mb-6">
                <li className="flex items-center gap-2 text-sm text-[#9CA3AF]"><Phone className="w-4 h-4 text-[#FF7A45]" />+251 911 234 567</li>
                <li className="flex items-center gap-2 text-sm text-[#9CA3AF]"><Mail className="w-4 h-4 text-[#FF7A45]" />info@hobbyhub.et</li>
                <li className="flex items-center gap-2 text-sm text-[#9CA3AF]"><MapPin className="w-4 h-4 text-[#FF7A45]" />{t('footer.address')}</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#9CA3AF]">© {new Date().getFullYear()} HobbyHub Education. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
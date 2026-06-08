'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { Target, Users, ShieldCheck, ArrowRight, BookOpen, Video, ShoppingBag, Trophy, Heart, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

   {/* Hero Banner Section */}
      <section className="py-20 bg-[#FFF2EB] relative overflow-hidden">
        <div className="absolute top-1/2 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFE2D4] filter blur-3xl opacity-60 z-0 pointer-events-none" />
        <div className="max-w-[1440px] mt-8 mx-auto px-4 md:px-10 lg:px-14 relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-3 block">Our Vision</span>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-[#1F2937] tracking-tight leading-tight mb-6">
            Empowering the Next Generation of Leaders
          </h1>
          <p className="text-base md:text-lg text-[#6B7280] leading-relaxed mb-8">
            HobbyHub Education is a premium educational platform dedicated to building state-of-the-art career skills. We bring hands-on project-based classes, expert industry mentorship, and verified credentials to students all across Ethiopia.
          </p>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">Our Approach</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-6">
                Why HobbyHub Works
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-8">
                We believe learning should be fun, engaging, and practical. Our platform turns curiosity into 
                real skills through hands-on projects, expert guidance, and a supportive community.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937] mb-1">Personalized Discovery</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      Our smart quiz matches students with hobbies that fit their personality, age, and interests.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937] mb-1">Expert Teachers</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      Learn from passionate educators who bring real-world experience and genuine enthusiasm.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937] mb-1">Verified Achievement</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      Earn certificates, track progress, and build a portfolio that showcases your growth.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FAFAFA] rounded-[32px] p-8 md:p-10 border border-gray-100 flex flex-col justify-center">
              <h3 className="text-2xl font-extrabold text-[#1F2937] mb-4">Our Commitment</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
                We are committed to making quality hobby education accessible to every Ethiopian student. 
                From a child discovering their first passion to a teenager building advanced skills, 
                HobbyHub provides the support structure for every learner to shine.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200/60">
                <div>
                  <span className="text-3xl font-extrabold text-[#FF7A45] block">100%</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student Focused</span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-[#1F2937] block">24/7</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Learning Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-4">
              A Complete Learning Ecosystem
            </h2>
            <p className="text-base text-[#6B7280]">
              Everything students need to discover, learn, and grow in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF2EB] flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-[#FF7A45]" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Find Your Hobby</h3>
              <p className="text-sm text-[#6B7280]">Take our quiz to discover activities you'll love</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF2EB] flex items-center justify-center mx-auto mb-4">
                <Video className="w-7 h-7 text-[#FF7A45]" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Learn Live</h3>
              <p className="text-sm text-[#6B7280]">Join interactive classes with expert teachers</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF2EB] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-7 h-7 text-[#FF7A45]" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Get Supplies</h3>
              <p className="text-sm text-[#6B7280]">Shop for materials and equipment you need</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF2EB] flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-7 h-7 text-[#FF7A45]" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Showcase Talent</h3>
              <p className="text-sm text-[#6B7280]">Share your work and win in monthly events</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#FFF2EB]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 text-center max-w-2xl">
          <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">
            Explore live classes, discover your passion, and start building real skills today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-bold h-12 px-8 rounded-xl inline-flex items-center gap-2 group transition-all">
                Join HobbyHub Today
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/hobbies">
              <Button variant="outline" className="border-[#FF7A45] text-[#FF7A45] hover:bg-[#FF7A45]/5 h-12 px-8 rounded-xl">
                Explore Hobbies
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
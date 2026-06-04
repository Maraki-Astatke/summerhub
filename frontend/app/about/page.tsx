'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import { Sparkles, Trophy, Users, ShieldCheck, Target, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const { user } = useAuth();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      {/* Hero Banner Section */}
      <section className="py-20 bg-[#FFF2EB] relative overflow-hidden">
        <div className="absolute top-1/2 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFE2D4] filter blur-3xl opacity-60 z-0 pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-3 block">{language === 'am' ? 'ራዕያችን' : 'Our Vision'}</span>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-[#1F2937] tracking-tight leading-tight mb-6">
            {language === 'am' ? 'ቀጣዩን የውሳኔ ሰጭዎች ትውልድ ማብቃት' : 'Empowering the Next Generation of Leaders'}
          </h1>
          <p className="text-base md:text-lg text-[#6B7280] leading-relaxed mb-8">
            {language === 'am' 
              ? 'ሆቢሀብ ትምህርት ዘመናዊ የሙያ ክህሎቶችን ለመገንባት የተቋቋመ የትምህርት መድረክ ነው። በተግባር ላይ የተመሰረቱ ትምህርቶችን፣ የባለሙያዎችን ምክር እና የተረጋገጡ የምስክር ወረቀቶችን ለመላው ኢትዮጵያ ተማሪዎች እናቀርባለን።' 
              : 'HobbyHub Education is a premium educational platform dedicated to building state-of-the-art career skills. We bring hands-on project-based classes, expert industry mentorship, and verified credentials to students all across Ethiopia.'}
          </p>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">{language === 'am' ? 'ዋና ዋና ምሰሶቻችን' : 'Our Core Pillars'}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-6">
                {language === 'am' ? 'ለምን ሆቢሀብ ትምህርት?' : 'Why HobbyHub Education?'}
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed mb-8">
                {language === 'am'
                  ? 'ትምህርት አሳታፊ፣ በይነተገናኝ እና እውነተኛ ውጤት የሚያስገኝ መሆን አለበት ብለን እናምናለን። የእኛ ልዩ የማስተማር ዘዴ በንድፈ-ሀሳብ እና በተግባር መካከል ያለውን ልዩነት ያጠባል።'
                  : 'We believe that learning should be engaging, highly interactive, and oriented around real-world results. Our custom methodology bridges the gap between theory and actual industry deployment.'}
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937] mb-1">{language === 'am' ? 'ግልጽ የሙያ መስኮች' : 'Targeted Career Paths'}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {language === 'am'
                        ? 'ለአለም አቀፍ ዲጂታል ክህሎት ፍላጎቶች በግልጽ የተቀረጹ እና ከሀገራዊ ሁኔታ ጋር የተጣጣሙ ስርዓተ-ትምህርቶች።'
                        : 'Curriculums mapped explicitly to global digital skill demands, tailored to the regional landscape.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937] mb-1">{language === 'am' ? 'በይነተገናኝ ማህበረሰብ' : 'Interactive Community'}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {language === 'am'
                        ? 'ከእኩዮችዎ ጋር ይተባበሩ፣ በውድድሮች ላይ ይሳተፉ እና ከባለሙያ አማካሪዎች ጋር የቀጥታ ስብሰባዎችን ይቀላቀሉ።'
                        : 'Collaborate with peers, compete in events, and join live online meetups with seasoned mentors.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F2937] mb-1">{language === 'am' ? 'የተረጋገጡ የምስክር ወረቀቶች' : 'Verified Credentials'}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {language === 'am'
                        ? 'በሙያዊ መገለጫዎ እና በስራ ማቅረቢያዎ ላይ ጎልተው የሚታዩ እውቅና ያላቸው የምስክር ወረቀቶችን ያግኙ።'
                        : 'Get recognized certification tokens that stand out in your professional profile and portfolio showcase.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FAFAFA] rounded-[32px] p-8 md:p-10 border border-gray-100 flex flex-col justify-center">
              <h3 className="text-2xl font-extrabold text-[#1F2937] mb-4">{language === 'am' ? 'የእኛ ቁርጠኝነት' : 'Our Commitment'}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
                {language === 'am'
                  ? 'ለሁሉም እድሜ ተማሪዎች ጥራት ያለው እና ተደራሽ የቴክኖሎጂ ትምህርትን ለማቅረብ ቁርጠኞች ነን። የዲጂታል ጥበብን ከሚቃኙ የሁለተኛ ደረጃ ተማሪዎች ጀምሮ የሙያ ገንቢዎችን እስከሚጀምሩ ተመራቂዎች ድረስ፣ ስኬታማ እንዲሆኑ የሚረዳዎትን መዋቅር እንገነባለን።'
                  : 'We are committed to delivering premium quality, accessible tech education for learners of all ages. From high school students exploring digital arts to graduates launching professional developer paths, we build the support structure to let you shine.'}
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200/60">
                <div>
                  <span className="text-3xl font-extrabold text-[#FF7A45] block">100%</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{language === 'am' ? 'በኢትዮጵያውያን የሚመራ' : 'Ethiopian Led'}</span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-[#1F2937] block">6-Week</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{language === 'am' ? 'ፈጣን የ6-ሳምንት ኮርሶች' : 'Fast-Pace Tracks'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#FAFAFA] border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 text-center max-w-2xl">
          <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight mb-4">
            {language === 'am' ? 'የትምህርት ጉዞዎን ለመጀመር ዝግጁ ነዎት?' : 'Ready to Begin Your Educational Journey?'}
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">
            {language === 'am' ? 'የቀጥታ ክፍሎችን ያስሱ፣ ከፍተኛ ዋጋ ያላቸውን የክህሎት ማህደሮች ይገንቡ እና የምስክር ወረቀት ያግኙ።' : 'Explore live classes, build high-value skill portfolios, and get certified.'}
          </p>
          <Link href="/register">
            <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-12 px-8 rounded-xl inline-flex items-center gap-2 group transition-all">
              {language === 'am' ? 'ዛሬውኑ ሆቢሀብ ትምህርትን ይቀላቀሉ' : 'Join HobbyHub Education Today'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

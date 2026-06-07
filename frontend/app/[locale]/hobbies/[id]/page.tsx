'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Calendar, User, Clock, Users } from 'lucide-react';

export default function HobbyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations();

  const { data: hobby, isLoading } = useQuery({
    queryKey: ['hobby', id],
    queryFn: async () => {
      const response = await api.get(`/hobbies/${id}`);
      return response.data;
    },
  });

  const { data: lessons, refetch: refetchLessons } = useQuery({
    queryKey: ['lessons', id],
    queryFn: async () => {
      const response = await api.get(`/lessons?hobbyId=${id}&upcoming=true`);
      return response.data.data;
    },
  });

  const registerForLesson = async (lessonId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await api.post(`/lessons/${lessonId}/register`);
      refetchLessons();
      alert(false ? 'በትምህርቱ በተሳካ ሁኔታ ተመዝግበዋል!' : 'Successfully registered for the lesson!');
    } catch (error: any) {
      alert(error.response?.data?.error || (false ? 'ምዝገባው አልተሳካም' : 'Registration failed'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">{false ? 'ዝርዝሮችን በመጫን ላይ...' : 'Loading details...'}</div>
      </div>
    );
  }

  if (!hobby) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center max-w-sm px-6 py-8 bg-white rounded-[24px] shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium mb-4">{false ? 'ኮርሱ ወይም ተግባሩ አልተገኘም' : 'Course or activity not found'}</p>
          <Link href="/hobbies">
            <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] rounded-xl text-[#1F2937] font-bold h-11 px-6">
              {false ? 'ወደ ካታሎግ ይመለሱ' : 'Back to Catalog'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        {/* Hobby Info Hero Banner */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-8 md:p-10 shadow-sm mb-10 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#FFF2EB] filter blur-3xl opacity-60 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2.5 mb-4">
              {hobby.category && (
                <span className="text-xs font-bold text-[#FF7A45] bg-[#FFF2EB] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  {hobby.category.name}
                </span>
              )}
              {hobby.ageGroup && (
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  {false ? `ዕድሜ ${hobby.ageGroup}` : `Ages ${hobby.ageGroup}`}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] leading-tight mb-4">
              {hobby.name}
            </h1>
            <p className="text-base md:text-lg text-[#6B7280] leading-relaxed max-w-3xl">
              {hobby.description}
            </p>
          </div>
        </div>

        <Tabs defaultValue="lessons" className="space-y-8">
          <TabsList className="bg-gray-100/70 p-1.5 rounded-xl border border-gray-100 max-w-md">
            <TabsTrigger value="lessons" className="rounded-lg py-2.5 font-semibold text-sm">{false ? 'የሚቀጥሉ ትምህርቶች' : 'Upcoming Lessons'}</TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg py-2.5 font-semibold text-sm">{false ? 'ስለ ኮርሱ ማጠቃለያ' : 'Course Overview'}</TabsTrigger>
            {user && <TabsTrigger value="my-progress" className="rounded-lg py-2.5 font-semibold text-sm">{false ? 'የእኔ ሂደት' : 'My Progress'}</TabsTrigger>}
          </TabsList>

          <TabsContent value="lessons">
            {lessons?.length === 0 ? (
              <Card className="rounded-[24px] border-gray-100 shadow-sm">
                <CardContent className="text-center py-16">
                  <p className="text-gray-500 font-medium mb-1">{false ? 'በአሁኑ ጊዜ ምንም የታቀዱ ትምህርቶች የሉም' : 'No lessons scheduled currently'}</p>
                  <p className="text-sm text-gray-400">{false ? 'እባክዎን ከጥቂት ቀናት በኋላ ተመልሰው ያረጋግጡ ወይም ድጋፍ ሰጪዎችን ያግኙ።' : 'Please check back in a few days or contact support.'}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {lessons?.map((lesson: any) => (
                  <Card key={lesson.id} className="rounded-[24px] border-gray-100 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden shadow-sm">
                    <CardHeader className="p-6 pb-4">
                      <CardTitle className="text-xl font-bold text-[#1F2937] tracking-tight">{lesson.title}</CardTitle>
                      <CardDescription className="text-sm text-[#6B7280] mt-1.5 line-clamp-2">{lesson.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                        <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                          <User className="h-4.5 w-4.5 text-[#FF7A45]" />
                          <span className="truncate">
                            {lesson.teacher?.profile?.firstName} {lesson.teacher?.profile?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                          <Calendar className="h-4.5 w-4.5 text-[#FF7A45]" />
                          <span>{new Date(lesson.dateTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                          <Clock className="h-4.5 w-4.5 text-[#FF7A45]" />
                          <span>{lesson.durationMinutes} {false ? 'ደቂቃ' : 'mins'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-[#6B7280]">
                          <Users className="h-4.5 w-4.5 text-[#FF7A45]" />
                          <span>{lesson.registrations?.length || 0} / {lesson.maxStudents} {false ? 'ተቀላቅለዋል' : 'joined'}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full h-11 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl transition-all duration-200"
                        onClick={() => registerForLesson(lesson.id)}
                        disabled={lesson.registrations?.length >= lesson.maxStudents}
                      >
                        {lesson.registrations?.length >= lesson.maxStudents 
                          ? (false ? 'ክፍሉ ሞልቷል' : 'Class Capacity Reached') 
                          : (false ? 'ክፍል ያስይዙ' : 'Book Class Spot')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card className="rounded-[24px] border-gray-100 bg-white p-2 shadow-sm">
              <CardContent className="p-6 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-3">{false ? 'ስለዚህ ኮርስ' : 'About this course'}</h3>
                  <p className="text-base text-[#6B7280] leading-relaxed">{hobby.description}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div>
                    <h4 className="text-lg font-bold text-[#1F2937] mb-3">{false ? 'ምን ይማራሉ' : 'What you will learn'}</h4>
                    <ul className="space-y-2.5 text-sm text-[#6B7280]">
                      <li className="flex gap-2.5 items-start">
                        <span className="text-[#FF7A45] font-bold">✓</span>
                        <span>{false ? 'መሰረታዊ የክህሎት ግንባታ እና የፅንሰ-ሀሳብ ትምህርት' : 'Fundamental skill building and conceptual learning templates'}</span>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="text-[#FF7A45] font-bold">✓</span>
                        <span>{false ? 'በተረጋገጡ አስተማሪዎች የሚመሩ የተግባር መመሪያዎች' : 'Direct practice guidelines accompanied by certified educators'}</span>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="text-[#FF7A45] font-bold">✓</span>
                        <span>{false ? 'አጠቃላይ የስራ ማቅረቢያዎች እና በይነተገናኝ ፕሮጀክቶች መፍጠር' : 'Comprehensive portfolios and interactive project creations'}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1F2937] mb-3">{false ? 'ቅድመ-ሁኔታዎች' : 'Pre-requisites'}</h4>
                    <ul className="space-y-2.5 text-sm text-[#6B7280]">
                      <li className="flex gap-2.5 items-start">
                        <span className="text-[#FF7A45] font-bold">✓</span>
                        <span>{false ? 'ምንም ቅድመ ልምድ ለሌላቸው ጀማሪዎች ሙሉ በሙሉ የተነደፈ' : 'Fully designed for beginners with zero prior experience'}</span>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="text-[#FF7A45] font-bold">✓</span>
                        <span>{false ? 'ለራስ-ልምምድ መሰረታዊ የጥናት ቁሳቁስ እና የማስታወሻ ደብተር' : 'Basic study material and notebook supplies for self-practice'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user && (
            <TabsContent value="my-progress">
              <Card className="rounded-[24px] border-gray-100 bg-white p-2 shadow-sm">
                <CardContent className="p-10 text-center">
                  <p className="text-[#6B7280] font-medium mb-4">{false ? 'የአፈጻጸም ግንዛቤዎችን ለማየት ትምህርቶችን መያዝ እና መከታተል ይጀምሩ' : 'Start booking and attending lessons to view performance insights'}</p>
                  <Button 
                    className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl h-11 px-6"
                    onClick={() => {
                      const tab = document.querySelector('[value="lessons"]') as HTMLElement;
                      if (tab) tab.click();
                    }}
                  >
                    {false ? 'ትምህርቶችን ፈልግ' : 'Find Lessons'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
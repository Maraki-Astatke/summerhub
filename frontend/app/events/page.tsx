'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import Navbar from '@/components/Navbar';
import api from '../lib/api';
import { Calendar, Users, Trophy, Clock, Award } from 'lucide-react';

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events?upcoming=true');
      return response.data;
    },
  });

  const { data: myEvents } = useQuery({
    queryKey: ['my-events'],
    queryFn: async () => {
      const response = await api.get('/my-events');
      return response.data;
    },
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await api.post(`/events/${eventId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      alert(language === 'am' ? 'ለዝግጅቱ በተሳካ ሁኔታ ተመዝግበዋል!' : 'Successfully registered for the event!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || (language === 'am' ? 'ምዝገባው አልተሳካም' : 'Registration failed'));
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await api.delete(`/events/${eventId}/unregister`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      alert(language === 'am' ? 'ከዝግጅቱ ምዝገባዎ በተሳካ ሁኔታ ተሰርዟል' : 'Successfully unregistered from the event');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || (language === 'am' ? 'ምዝገባውን መሰረዝ አልተሳካም' : 'Failed to unregister'));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">{language === 'am' ? 'ውድድሮችን በመጫን ላይ...' : 'Loading events...'}</div>
      </div>
    );
  }

  const upcomingEvents = eventsData?.data || [];
  const myUpcomingEvents = myEvents?.upcoming || [];
  const myPastEvents = myEvents?.past || [];

  const EventCard = ({ event, showRegister = true }: { event: any; showRegister?: boolean }) => {
    const isRegistered = myUpcomingEvents?.some((e: any) => e.eventId === event.id);
    const spotsLeft = event.maxParticipants - (event.registeredCount || 0);
    const isFull = spotsLeft === 0;

    return (
      <Card className="border border-gray-100 bg-white rounded-[24px] hover:shadow-xl hover:shadow-[#FF7A45]/5 transition-all duration-300 overflow-hidden shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-[#1F2937] tracking-tight">{event.name}</CardTitle>
              <CardDescription className="text-sm text-[#6B7280] mt-1.5 line-clamp-2">{event.description}</CardDescription>
            </div>
            {event.prize && (
              <div className="flex items-center gap-1 text-[#FF7A45] bg-[#FFF2EB] px-3 py-1.5 rounded-full shrink-0 font-bold text-xs uppercase tracking-wider">
                <Trophy className="h-4 w-4" />
                <span>{event.prize}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-gray-100 text-sm text-[#6B7280] font-semibold">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4.5 w-4.5 text-[#FF7A45]" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4.5 w-4.5 text-[#FF7A45]" />
              <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="h-4.5 w-4.5 text-[#FF7A45]" />
              <span>{event.registeredCount || 0} / {event.maxParticipants} {language === 'am' ? 'ቦታዎች ተይዘዋል' : 'spots taken'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Award className="h-4.5 w-4.5 text-[#FF7A45]" />
              <span>{spotsLeft} {language === 'am' ? 'የቀሩ ቦታዎች' : 'remaining slots'}</span>
            </div>
          </div>

          {showRegister && (
            <div className="flex gap-3 pt-2">
              {isRegistered ? (
                <Button 
                  variant="outline" 
                  className="w-full h-11 rounded-xl border-[#FF7A45]/30 text-[#FF7A45] hover:bg-[#FFF2EB] font-semibold transition-colors"
                  onClick={() => unregisterMutation.mutate(event.id)}
                >
                  {language === 'am' ? 'ምዝገባውን ሰርዝ' : 'Cancel Registration'}
                </Button>
              ) : (
                <Button 
                  className="w-full h-11 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl transition-all duration-200"
                  onClick={() => registerMutation.mutate(event.id)}
                  disabled={isFull}
                >
                  {isFull 
                    ? (language === 'am' ? 'ምዝገባው ተዘግቷል' : 'Event Registration Closed') 
                    : (language === 'am' ? 'አሁን ተሳተፍ' : 'Join Event Now')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">{language === 'am' ? 'ውድድሮች እና ዝግጅቶች' : 'Events & Tournaments'}</span>
          <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] mb-4">
            {language === 'am' ? 'ችሎታዎን ያሳዩ' : 'Showcase Your Talent'}
          </h1>
          <p className="text-base text-[#6B7280]">
            {language === 'am' ? 'በበይነተገናኝ ዝግጅቶች ላይ ይሳተፉ፣ ፕሮጀክቶችዎን ያሳዩ እና ሽልማቶችን ያሸንፉ።' : 'Participate in interactive events, display your projects, and win awards.'}
          </p>
        </div>

        {user ? (
          <Tabs defaultValue="upcoming" className="space-y-8">
            <TabsList className="bg-gray-100/70 p-1.5 rounded-xl border border-gray-100 max-w-lg">
              <TabsTrigger value="upcoming" className="rounded-lg py-2.5 font-semibold text-sm">{language === 'am' ? 'የሚቀጥሉ' : 'Upcoming'} ({upcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="my-upcoming" className="rounded-lg py-2.5 font-semibold text-sm">{language === 'am' ? 'የተመዘገቡበት' : 'Registered'} ({myUpcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="my-past" className="rounded-lg py-2.5 font-semibold text-sm">{language === 'am' ? 'ያለፉ ዝግጅቶች' : 'Past Events'} ({myPastEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingEvents.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                  <CardContent>
                    <Calendar className="h-14 w-14 mx-auto text-[#FF7A45] mb-4 opacity-80" />
                    <p className="text-gray-500 font-medium">{language === 'am' ? 'በአሁኑ ጊዜ ምንም የታቀዱ ዝግጅቶች የሉም' : 'No upcoming events scheduled right now'}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {upcomingEvents.map((event: any) => (
                    <EventCard key={event.id} event={event} showRegister={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-upcoming" className="space-y-6">
              {myUpcomingEvents.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                  <CardContent>
                    <p className="text-gray-500 font-medium mb-3">{language === 'am' ? 'እስካሁን ምንም ውድድር አልተቀላቀሉም' : "You haven't joined any events yet"}</p>
                    <Button 
                      variant="link" 
                      className="text-[#FF7A45] font-semibold hover:underline"
                      onClick={() => {
                        const tab = document.querySelector('[value="upcoming"]') as HTMLElement;
                        if (tab) tab.click();
                      }}
                    >
                      {language === 'am' ? 'የሚቀጥሉ ውድድሮችን ያስሱ' : 'Browse Upcoming Events'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {myUpcomingEvents.map((reg: any) => (
                    <EventCard key={reg.event.id} event={reg.event} showRegister={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-past" className="space-y-6">
              {myPastEvents.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                  <CardContent>
                    <p className="text-gray-500 font-medium">{language === 'am' ? 'ምንም ያለፉ ዝግጅቶች አልተመዘገቡም' : 'No past events recorded'}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {myPastEvents.map((reg: any) => (
                    <EventCard key={reg.event.id} event={reg.event} showRegister={false} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.length === 0 ? (
                <Card className="col-span-full rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                  <CardContent>
                    <Calendar className="h-14 w-14 mx-auto text-[#FF7A45] mb-4 opacity-80" />
                    <p className="text-gray-500 font-medium">{language === 'am' ? 'በአሁኑ ጊዜ ምንም የታቀዱ ዝግጅቶች የሉም' : 'No upcoming events scheduled right now'}</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} showRegister={false} />
                ))
              )}
            </div>
            
            <Card className="rounded-[24px] border border-gray-155 bg-white p-2 shadow-sm text-center py-10 max-w-xl mx-auto">
              <CardContent className="space-y-4">
                <p className="text-base text-[#6B7280]">
                  {language === 'am' ? 'በሚቀጥሉ ዝግጅቶች ላይ ለመመዝገብ እና ክህሎትዎን ለማሳየት ዝግጁ ነዎት?' : 'Ready to register for upcoming events and showcase your skills?'}
                </p>
                <Link href="/login">
                  <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-8 rounded-xl transition-all">
                    {language === 'am' ? 'ለመሳተፍ ይግቡ' : 'Login to Participate'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
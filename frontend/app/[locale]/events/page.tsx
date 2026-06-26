'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Calendar, Users, Trophy, Clock, Award } from 'lucide-react';
import EventPostCard from '@/components/events/EventPostCard';
export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events-all'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data;
    },
  });

  const { data: talentEventsData, isLoading: talentLoading } = useQuery({
    queryKey: ['talent-events'],
    queryFn: async () => {
      const response = await api.get('/event-posts');
      return response.data;
    },
  });

  const isLoading = eventsLoading || talentLoading;

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
      alert('Successfully registered for the event!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Registration failed');
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await api.delete(`/events/${eventId}/unregister`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      alert('Successfully unregistered from the event');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to unregister');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">Loading events...</div>
      </div>
    );
  }

  const allEvents = eventsData?.data || [];
  const upcomingEvents = allEvents.filter((e: any) => new Date(e.date) > new Date());
  const talentEvents = talentEventsData || [];
  const upcomingTalentEvents = talentEvents.filter((e: any) => new Date(e.date) > new Date());
  const pastTalentEvents = talentEvents.filter((e: any) => new Date(e.date) <= new Date());

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
              <span>{event.registeredCount || 0} / {event.maxParticipants} spots taken</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Award className="h-4.5 w-4.5 text-[#FF7A45]" />
              <span>{spotsLeft} remaining slots</span>
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
                  Cancel Registration
                </Button>
              ) : (
                <Button 
                  className="w-full h-11 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-semibold rounded-xl transition-all duration-200"
                  onClick={() => registerMutation.mutate(event.id)}
                  disabled={isFull}
                >
                  {isFull ? 'Event Registration Closed' : 'Join Event Now'}
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
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block">Events & Tournaments</span>
          <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] mb-4">
            Showcase Your Talent
          </h1>
          <p className="text-base text-[#6B7280]">
            Participate in interactive events, display your projects, and win awards.
          </p>
        </div>

        {user ? (
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="bg-gray-100/70 p-1.5 rounded-xl border border-gray-100 flex flex-wrap gap-1 max-w-fit mx-auto md:mx-0">
              <TabsTrigger value="all" className="rounded-lg py-2.5 font-semibold text-sm">All ({allEvents.length + talentEvents.length})</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-lg py-2.5 font-semibold text-sm">Upcoming ({upcomingEvents.length + upcomingTalentEvents.length})</TabsTrigger>
              <TabsTrigger value="my-upcoming" className="rounded-lg py-2.5 font-semibold text-sm">Registered ({myUpcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="my-past" className="rounded-lg py-2.5 font-semibold text-sm">Past Events ({myPastEvents.length + pastTalentEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {allEvents.length === 0 && talentEvents.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                  <CardContent>
                    <p className="text-gray-500 font-medium">No events found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-12">
                  {talentEvents.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900">Talent Event Announcements</h2>
                      <div className="grid gap-8">
                        {talentEvents.map((post: any) => (
                          <EventPostCard 
                            key={`post-${post.id}`} 
                            post={post} 
                            currentUser={user} 
                            onPostUpdated={() => queryClient.invalidateQueries({ queryKey: ['talent-events'] })} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {allEvents.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900">Standard Events & Tournaments</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {allEvents.map((event: any) => (
                          <EventCard key={`event-${event.id}`} event={event} showRegister={true} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingEvents.length === 0 && upcomingTalentEvents.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                  <CardContent>
                    <Calendar className="h-14 w-14 mx-auto text-[#FF7A45] mb-4 opacity-80" />
                    <p className="text-gray-500 font-medium">No upcoming events scheduled right now</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-12">
                  {upcomingTalentEvents.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Upcoming Talent Events</h2>
                      <div className="grid gap-8">
                        {upcomingTalentEvents.map((post: any) => (
                          <EventPostCard 
                            key={`post-${post.id}`} 
                            post={post} 
                            currentUser={user} 
                            onPostUpdated={() => queryClient.invalidateQueries({ queryKey: ['talent-events'] })} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {upcomingEvents.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Upcoming Standard Events</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {upcomingEvents.map((event: any) => (
                          <EventCard key={event.id} event={event} showRegister={true} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-upcoming" className="space-y-6">
              {myUpcomingEvents.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                  <CardContent>
                    <p className="text-gray-500 font-medium mb-3">You haven't joined any events yet</p>
                    <Button 
                      variant="link" 
                      className="text-[#FF7A45] font-semibold hover:underline"
                      onClick={() => {
                        const tab = document.querySelector('[value="upcoming"]') as HTMLElement;
                        if (tab) tab.click();
                      }}
                    >
                      Browse Upcoming Events
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
              {myPastEvents.length === 0 && pastTalentEvents.length === 0 ? (
                <Card className="rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                  <CardContent>
                    <p className="text-gray-500 font-medium">No past events recorded</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-12">
                  {pastTalentEvents.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Past Talent Events</h2>
                      <div className="grid gap-8">
                        {pastTalentEvents.map((post: any) => (
                          <EventPostCard 
                            key={`post-${post.id}`} 
                            post={post} 
                            currentUser={user} 
                            onPostUpdated={() => queryClient.invalidateQueries({ queryKey: ['talent-events'] })} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {myPastEvents.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Past Standard Events</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {myPastEvents.map((reg: any) => (
                          <EventCard key={reg.event.id} event={reg.event} showRegister={false} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="space-y-12">
              {talentEvents.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Talent Event Announcements</h2>
                  <div className="grid gap-8">
                    {talentEvents.map((post: any) => (
                      <EventPostCard 
                        key={`post-${post.id}`} 
                        post={post} 
                        currentUser={user} 
                        onPostUpdated={() => queryClient.invalidateQueries({ queryKey: ['talent-events'] })} 
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Standard Events & Tournaments</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {upcomingEvents.length === 0 ? (
                    <Card className="col-span-full rounded-[24px] border-gray-100 shadow-sm text-center py-16">
                      <CardContent>
                        <Calendar className="h-14 w-14 mx-auto text-[#FF7A45] mb-4 opacity-80" />
                        <p className="text-gray-500 font-medium">No upcoming events scheduled right now</p>
                      </CardContent>
                    </Card>
                  ) : (
                    upcomingEvents.map((event: any) => (
                      <EventCard key={`event-${event.id}`} event={event} showRegister={false} />
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <Card className="rounded-[24px] border border-gray-155 bg-white p-2 shadow-sm text-center py-10 max-w-xl mx-auto">
              <CardContent className="space-y-4">
                <p className="text-base text-[#6B7280]">
                  Ready to register for upcoming events and showcase your skills?
                </p>
                <Link href="/login">
                  <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-8 rounded-xl transition-all">
                    Login to Participate
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

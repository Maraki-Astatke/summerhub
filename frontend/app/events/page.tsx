'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../lib/api';
import { Calendar, Users, Trophy, MapPin, Clock, Award } from 'lucide-react';

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
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
      alert('Successfully registered for event!');
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
      alert('Successfully unregistered from event');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to unregister');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
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
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription className="mt-1">{event.description}</CardDescription>
            </div>
            {event.prize && (
              <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">{event.prize}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.registeredCount || 0} / {event.maxParticipants} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>{spotsLeft} spots left</span>
            </div>
          </div>

          {showRegister && (
            <div className="flex gap-3 pt-2">
              {isRegistered ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => unregisterMutation.mutate(event.id)}
                >
                  Cancel Registration
                </Button>
              ) : (
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => registerMutation.mutate(event.id)}
                  disabled={isFull}
                >
                  {isFull ? 'Event Full' : 'Register Now'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub</Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Talent Events</h1>
          <p className="text-gray-600">Showcase your skills and win amazing prizes</p>
        </div>

        {user ? (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="my-upcoming">My Events ({myUpcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="my-past">Past Events ({myPastEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No upcoming events at the moment</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} showRegister={true} />
                ))
              )}
            </TabsContent>

            <TabsContent value="my-upcoming" className="space-y-4">
              {myUpcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">You haven't registered for any events</p>
                    <Button variant="link" onClick={() => document.querySelector('[value="upcoming"]')?.dispatchEvent(new Event('click'))}>
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myUpcomingEvents.map((reg: any) => (
                  <EventCard key={reg.event.id} event={reg.event} showRegister={true} />
                ))
              )}
            </TabsContent>

            <TabsContent value="my-past" className="space-y-4">
              {myPastEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">No past events</p>
                  </CardContent>
                </Card>
              ) : (
                myPastEvents.map((reg: any) => (
                  <EventCard key={reg.event.id} event={reg.event} showRegister={false} />
                ))
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No upcoming events at the moment</p>
                </CardContent>
              </Card>
            ) : (
              upcomingEvents.map((event: any) => (
                <EventCard key={event.id} event={event} showRegister={false} />
              ))
            )}
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-gray-600">Login to register for events and showcase your talent!</p>
                <Link href="/login">
                  <Button className="mt-3">Login to Register</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
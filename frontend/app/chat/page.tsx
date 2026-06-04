'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import io from 'socket.io-client';
import { Send, User } from 'lucide-react';

let socket: any;

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/chat/conversations');
      return response.data;
    },
    enabled: !!user,
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const response = await api.get(`/chat/messages/${selectedUser.id}`);
      return response.data;
    },
    enabled: !!selectedUser && !!user,
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  useEffect(() => {
    if (!user) return;

    socket = io('http://localhost:5001', {
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join-room', `user-${user.id}`);
    });

    socket.on('new-message', (newMessage: any) => {
      if (selectedUser?.id === newMessage.senderId || selectedUser?.id === newMessage.receiverId) {
        setMessages(prev => [...prev, newMessage]);
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on('user-typing', (data: { userId: number; isTyping: boolean }) => {
      if (data.userId === selectedUser?.id) {
        setTypingUser(data.isTyping ? data.userId : null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: number; content: string }) => {
      const response = await api.post('/chat/messages/send', { receiverId, content });
      return response.data;
    },
    onSuccess: (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedUser.id,
      content: message
    });
  };

  const handleTyping = () => {
    if (!isTyping && selectedUser) {
      setIsTyping(true);
      socket?.emit('typing', { receiverId: selectedUser.id, isTyping: true });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedUser) {
        socket?.emit('typing', { receiverId: selectedUser.id, isTyping: false });
      }
      setIsTyping(false);
    }, 1000);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub Chat</Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-6 h-[80vh]">
          {/* Conversations List */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[calc(80vh-80px)] overflow-y-auto">
                {conversations?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No conversations yet</p>
                ) : (
                  conversations?.map((conv: any) => (
                    <div
                      key={conv.user.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === conv.user.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                      }`}
                      onClick={() => setSelectedUser(conv.user)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {conv.user.profile?.firstName?.[0] || conv.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {conv.user.profile?.firstName} {conv.user.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{conv.user.email}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 overflow-hidden flex flex-col">
            {selectedUser ? (
              <>
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {selectedUser.profile?.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                      </CardTitle>
                      {typingUser === selectedUser.id && (
                        <p className="text-xs text-gray-500">Typing...</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.senderId === user.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
                <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleTyping}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sendMessageMutation.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      {/* Sticky Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center focus:outline-none">
            <Image 
              src="/logo.png" 
              alt="HobbyHub Education" 
              width={150} 
              height={38} 
              priority 
              className="h-9 w-auto object-contain"
            />
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45]">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-8">
        <div className="grid md:grid-cols-3 gap-6 h-[80vh]">
          {/* Conversations List */}
          <Card className="overflow-hidden border border-gray-100 bg-white rounded-[24px] shadow-sm flex flex-col">
            <CardHeader className="p-6 pb-4 border-b border-gray-50">
              <CardTitle className="text-lg font-bold text-[#1F2937]">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-2 overflow-y-auto flex-1">
              <div className="space-y-1">
                {conversations?.length === 0 ? (
                  <p className="text-center text-[#6B7280] text-sm py-8">No active chats yet</p>
                ) : (
                  conversations?.map((conv: any) => (
                    <div
                      key={conv.user.id}
                      className={`flex items-center gap-3.5 p-3.5 cursor-pointer rounded-2xl transition-all duration-200 ${
                        selectedUser?.id === conv.user.id 
                          ? 'bg-[#FFF2EB] text-[#FF7A45]' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => setSelectedUser(conv.user)}
                    >
                      <Avatar className="h-10 w-10 border border-white shadow-sm">
                        <AvatarFallback className="bg-[#FF7A45] text-white font-bold">
                          {conv.user.profile?.firstName?.[0] || conv.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#1F2937] truncate">
                          {conv.user.profile?.firstName} {conv.user.profile?.lastName}
                        </p>
                        <p className="text-xs text-[#6B7280] truncate">{conv.user.email}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#FF7A45] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
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
          <Card className="md:col-span-2 overflow-hidden border border-gray-100 bg-white rounded-[24px] shadow-sm flex flex-col h-full">
            {selectedUser ? (
              <>
                <CardHeader className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="border border-white shadow-sm">
                      <AvatarFallback className="bg-[#FF7A45] text-white font-bold">
                        {selectedUser.profile?.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-bold text-[#1F2937]">
                        {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                      </CardTitle>
                      {typingUser === selectedUser.id && (
                        <p className="text-xs text-green-500 font-semibold animate-pulse">Typing...</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                          msg.senderId === user.id
                            ? 'bg-[#FF7A45] text-white rounded-tr-none'
                            : 'bg-white text-[#1F2937] border border-gray-100 rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className="text-[10px] opacity-75 mt-1.5 font-semibold text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
                
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                  <Input
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleTyping}
                    className="flex-1 h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
                  />
                  <Button 
                    type="submit" 
                    disabled={sendMessageMutation.isPending}
                    className="bg-[#FF7A45] hover:bg-[#ff8f61] h-11 w-11 p-0 rounded-xl flex items-center justify-center shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50/20">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] mx-auto shadow-sm">
                    <User className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-[#6B7280]">Select a contact to begin messaging.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
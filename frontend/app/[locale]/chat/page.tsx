'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import io from 'socket.io-client';
import { Send, User, MessageCircle, Users, GraduationCap, ArrowLeft, Phone } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('conversations');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/chat/conversations');
      return response.data;
    },
    enabled: !!user,
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await api.get('/users/teachers');
      return response.data;
    },
    enabled: !!user && user?.roles?.[0] === 'student',
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/users/students');
      return response.data;
    },
    enabled: !!user && (user?.roles?.[0] === 'teacher' || user?.roles?.[0] === 'seller'),
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
      refetchConversations();
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
      refetchConversations();
      setActiveTab('conversations');
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

  const startNewChat = (contact: any) => {
    setSelectedUser(contact);
    setMessages([]);
    setActiveTab('conversations');
  };

  const userRole = user?.roles?.[0] || 'student';
  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';
  const isSeller = userRole === 'seller';

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
          {}
          <Card className="overflow-hidden border border-gray-100 bg-white rounded-[24px] shadow-sm flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent p-0">
                <TabsTrigger 
                  value="conversations" 
                  className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#FF7A45] data-[state=active]:text-[#FF7A45]"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chats ({conversations?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="contacts" 
                  className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#FF7A45] data-[state=active]:text-[#FF7A45]"
                >
                  <Users className="w-4 h-4 mr-2" />
                  New Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conversations" className="flex-1 overflow-y-auto mt-0 p-2">
                {!conversations || conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#6B7280] text-sm">No active chats yet</p>
                    <p className="text-xs text-gray-400 mt-1">Go to "New Chat" to start a conversation</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations?.map((conv: any) => (
                      <div
                        key={conv.user.id}
                        className={`flex items-center gap-3.5 p-3.5 cursor-pointer rounded-2xl transition-all duration-200 ${
                          selectedUser?.id === conv.user.id 
                            ? 'bg-[#FFF2EB] text-[#FF7A45]' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => {
                          setSelectedUser(conv.user);
                          setActiveTab('conversations');
                        }}
                      >
                        <Avatar className="h-10 w-10 border border-white shadow-sm">
                          <AvatarFallback className={`font-bold ${
                            conv.user.role === 'teacher' ? 'bg-blue-500' : 'bg-[#FF7A45]'
                          } text-white`}>
                            {conv.user.profile?.firstName?.[0] || conv.user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-sm text-[#1F2937] truncate">
                              {conv.user.profile?.firstName} {conv.user.profile?.lastName}
                            </p>
                            <span className="text-[10px] text-gray-400 ml-2">
                              {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {conv.user.role === 'teacher' ? '👨‍🏫 Teacher' : 'Student'}
                          </p>
                          {conv.lastMessage && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {conv.lastMessage}
                            </p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-[#FF7A45] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contacts" className="flex-1 overflow-y-auto mt-0 p-2">
                {isStudent && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#1F2937] mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-500" />
                        Teachers
                        <span className="text-xs text-gray-400 font-normal">({teachers?.length || 0})</span>
                      </h3>
                      <div className="space-y-2">
                        {!teachers || teachers.length === 0 ? (
                          <p className="text-xs text-gray-400 py-4 text-center">No teachers available</p>
                        ) : (
                          teachers?.map((teacher: any) => (
                            <div
                              key={teacher.id}
                              className="flex items-center gap-3.5 p-3.5 cursor-pointer rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
                              onClick={() => startNewChat(teacher)}
                            >
                              <Avatar className="h-10 w-10 border border-white shadow-sm">
                                <AvatarFallback className="bg-blue-500 text-white font-bold">
                                  {teacher.profile?.firstName?.[0] || teacher.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-[#1F2937]">
                                  {teacher.profile?.firstName} {teacher.profile?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {teacher.profile?.profession || 'Teacher'}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Message
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isTeacher && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#1F2937] mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-green-500" />
                      Students
                      <span className="text-xs text-gray-400 font-normal">({students?.length || 0})</span>
                    </h3>
                    <div className="space-y-2">
                      {!students || students.length === 0 ? (
                        <p className="text-xs text-gray-400 py-4 text-center">No students available</p>
                      ) : (
                        students?.map((student: any) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-3.5 p-3.5 cursor-pointer rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
                            onClick={() => startNewChat(student)}
                          >
                            <Avatar className="h-10 w-10 border border-white shadow-sm">
                              <AvatarFallback className="bg-green-500 text-white font-bold">
                                {student.profile?.firstName?.[0] || student.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-[#1F2937]">
                                {student.profile?.firstName} {student.profile?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Grade: {student.profile?.grade || 'Not specified'}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Message
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {isSeller && (
                  <div className="text-center py-12">
                    <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Contact Sellers by Phone</p>
                    <p className="text-xs text-gray-400 mt-2">
                      For product inquiries, please use the phone number provided in each seller's shop page.
                    </p>
                    <Link href="/shops">
                      <Button variant="outline" className="mt-4 border-[#FF7A45] text-[#FF7A45] hover:bg-[#FFF2EB]">
                        Browse Shops
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {}
          <Card className="md:col-span-2 overflow-hidden border border-gray-100 bg-white rounded-[24px] shadow-sm flex flex-col h-full">
            {selectedUser ? (
              <>
                <CardHeader className="p-6 border-b border-gray-50 flex flex-row items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedUser(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="border border-white shadow-sm">
                    <AvatarFallback className={`font-bold ${
                      selectedUser.role === 'teacher' ? 'bg-blue-500' : 'bg-[#FF7A45]'
                    } text-white`}>
                      {selectedUser.profile?.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base font-bold text-[#1F2937]">
                      {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      {selectedUser.role === 'teacher' ? '👨‍🏫 Teacher' : 'Student'}
                    </p>
                    {typingUser === selectedUser.id && (
                      <p className="text-xs text-green-500 font-semibold animate-pulse mt-1">Typing...</p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No messages yet</p>
                      <p className="text-xs text-gray-400 mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg: any) => (
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
                          <p className={`text-[10px] mt-1.5 font-semibold text-right ${
                            msg.senderId === user.id ? 'text-orange-100' : 'text-gray-400'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
                
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                  <Input
                    placeholder={`Message ${selectedUser.profile?.firstName || selectedUser.email}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleTyping}
                    className="flex-1 h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
                  />
                  <Button 
                    type="submit" 
                    disabled={sendMessageMutation.isPending || !message.trim()}
                    className="bg-[#FF7A45] hover:bg-[#ff8f61] h-11 w-11 p-0 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50/20">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFF2EB] flex items-center justify-center text-[#FF7A45] mx-auto shadow-sm">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#6B7280]">Select a conversation</p>
                    <p className="text-xs text-gray-400 mt-1">or go to <strong>New Chat</strong> to start messaging</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

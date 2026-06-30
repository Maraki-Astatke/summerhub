'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import io from 'socket.io-client';
import { Send, MessageCircle, Users, GraduationCap, ArrowLeft, Phone } from 'lucide-react';

let socket: any;

export default function MessagesPanel() {
  const { user } = useAuth();
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
    enabled: !!user && user?.roles?.includes('student'),
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/users/students');
      return response.data;
    },
    enabled: !!user && (user?.roles?.includes('teacher') || user?.roles?.includes('seller')),
  });

  const { data: messagesData } = useQuery({
    queryKey: ['messages', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const response = await api.get(`/chat/messages/${selectedUser.id}`);
      return response.data;
    },
    enabled: !!selectedUser && !!user,
  });

  useEffect(() => {
    if (messagesData) setMessages(messagesData);
  }, [messagesData]);

  useEffect(() => {
    if (!user) return;

    socket = io('http://localhost:5001', {
      auth: { token: localStorage.getItem('token') },
    });

    socket.on('receive_message', (newMessage: any) => {
      if (selectedUser && (newMessage.senderId === selectedUser.id || newMessage.receiverId === selectedUser.id)) {
        setMessages((prev) => [...prev, newMessage]);
      }
      refetchConversations();
    });

    socket.on('user_typing', (data: { userId: number; isTyping: boolean }) => {
      if (selectedUser && data.userId === selectedUser.id) {
        setTypingUser(data.isTyping ? data.userId : null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, selectedUser, refetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: number; content: string }) => {
      const response = await api.post('/chat/messages/send', { receiverId, content });
      return response.data;
    },
    onSuccess: (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      setMessage('');
      refetchConversations();
      setActiveTab('conversations');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    sendMessageMutation.mutate({ receiverId: selectedUser.id, content: message });
  };

  const handleTyping = () => {
    if (!isTyping && selectedUser) {
      setIsTyping(true);
      socket?.emit('typing', { receiverId: selectedUser.id, isTyping: true });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedUser) socket?.emit('typing', { receiverId: selectedUser.id, isTyping: false });
      setIsTyping(false);
    }, 1000);
  };

  const startNewChat = (contact: any) => {
    setSelectedUser(contact);
    setMessages([]);
    setActiveTab('conversations');
  };

  const isStudent = user?.roles?.includes('student');
  const isTeacher = user?.roles?.includes('teacher');
  const isSeller = user?.roles?.includes('seller');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[560px]">
      <Card className="overflow-hidden border-0 shadow-sm dark:bg-gray-800 flex flex-col lg:col-span-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full min-h-[560px]">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b dark:border-gray-700 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="conversations"
              className="rounded-none py-3.5 text-sm font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#FF7A45] data-[state=active]:text-[#FF7A45] data-[state=active]:bg-[#FF7A45]/5"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chats ({conversations?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="rounded-none py-3.5 text-sm font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#FF7A45] data-[state=active]:text-[#FF7A45] data-[state=active]:bg-[#FF7A45]/5"
            >
              <Users className="w-4 h-4 mr-2" />
              New Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="flex-1 overflow-y-auto mt-0 p-3">
            {!conversations || conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No active chats yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv: any) => (
                  <button
                    key={conv.user.id}
                    type="button"
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      selectedUser?.id === conv.user.id
                        ? 'bg-[#FF7A45]/10 text-[#FF7A45]'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedUser(conv.user);
                      setActiveTab('conversations');
                    }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#FF7A45]/15 text-[#FF7A45] font-bold">
                        {conv.user.profile?.firstName?.[0] || conv.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {conv.user.profile?.firstName} {conv.user.profile?.lastName}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-[#FF7A45] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 overflow-y-auto mt-0 p-3">
            {isStudent && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 px-1">
                  <GraduationCap className="w-4 h-4 text-[#FF7A45]" />
                  Teachers
                </h3>
                {!teachers?.length ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No teachers available</p>
                ) : (
                  teachers.map((teacher: any) => (
                    <button
                      key={teacher.id}
                      type="button"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFF2EB] dark:hover:bg-gray-700/50 text-left"
                      onClick={() => startNewChat(teacher)}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-[#FF7A45]/15 text-[#FF7A45] font-bold text-sm">
                          {teacher.profile?.firstName?.[0] || teacher.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {teacher.profile?.firstName} {teacher.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Teacher</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {isTeacher && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 px-1">
                  <Users className="w-4 h-4 text-[#FF7A45]" />
                  Students
                </h3>
                {!students?.length ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No students available</p>
                ) : (
                  students.map((student: any) => (
                    <button
                      key={student.id}
                      type="button"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFF2EB] dark:hover:bg-gray-700/50 text-left"
                      onClick={() => startNewChat(student)}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-[#FF7A45]/15 text-[#FF7A45] font-bold text-sm">
                          {student.profile?.firstName?.[0] || student.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {student.profile?.firstName} {student.profile?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Student</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {isSeller && (
              <div className="text-center py-10 px-2">
                <Phone className="w-10 h-10 text-[#FF7A45]/40 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Contact via shop phone numbers</p>
                <Link href="/shops">
                  <Button variant="outline" className="mt-4 border-[#FF7A45]/30 text-[#FF7A45] hover:bg-[#FFF2EB]">
                    Browse Shops
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="lg:col-span-2 overflow-hidden border-0 shadow-sm dark:bg-gray-800 flex flex-col min-h-[560px]">
        {selectedUser ? (
          <>
            <CardHeader className="p-4 border-b dark:border-gray-700 flex flex-row items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSelectedUser(null)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-[#FF7A45]/15 text-[#FF7A45] font-bold">
                  {selectedUser.profile?.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-base font-bold">
                  {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                </CardTitle>
                {typingUser === selectedUser.id && (
                  <p className="text-xs text-[#FF7A45] font-medium animate-pulse">Typing...</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA] dark:bg-gray-900/30">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No messages yet</p>
                </div>
              ) : (
                messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.senderId === user?.id
                          ? 'bg-[#FF7A45] text-white rounded-tr-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.senderId === user?.id ? 'text-orange-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyUp={handleTyping}
                className="flex-1 h-11 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
              />
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !message.trim()}
                className="bg-[#FF7A45] hover:bg-[#ff8f61] h-11 w-11 p-0 rounded-xl shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FF7A45]/10 flex items-center justify-center text-[#FF7A45] mx-auto">
                <MessageCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

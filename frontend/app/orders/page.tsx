'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import api from '../lib/api';
import { Package, Calendar, Clock, Eye } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">{language === 'am' ? 'ትዕዛዞችዎን በመጫን ላይ...' : 'Loading your orders...'}</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const pendingOrders = orders?.filter((o: any) => o.status === 'pending' || o.status === 'approved_by_parent') || [];
  const processingOrders = orders?.filter((o: any) => o.status === 'paid' || o.status === 'shipped') || [];
  const completedOrders = orders?.filter((o: any) => o.status === 'delivered') || [];
  const cancelledOrders = orders?.filter((o: any) => o.status === 'cancelled') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border border-yellow-100';
      case 'approved_by_parent': return 'text-blue-600 bg-blue-50 border border-blue-100';
      case 'paid': return 'text-green-600 bg-green-50 border border-green-100';
      case 'shipped': return 'text-purple-600 bg-purple-50 border border-purple-100';
      case 'delivered': return 'text-green-700 bg-green-100 border border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border border-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return language === 'am' ? 'በጥበቃ ላይ' : 'Pending';
      case 'approved_by_parent': return language === 'am' ? 'በወላጅ የጸደቀ' : 'Approved by Parent';
      case 'paid': return language === 'am' ? 'የተከፈለ' : 'Paid';
      case 'shipped': return language === 'am' ? 'የተላከ' : 'Shipped';
      case 'delivered': return language === 'am' ? 'የደረሰ' : 'Delivered';
      case 'cancelled': return language === 'am' ? 'የተሰረዘ' : 'Cancelled';
      default: return status;
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="border border-gray-100 bg-white rounded-[24px] hover:shadow-lg transition-all duration-300 overflow-hidden shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-gray-400" />
              <span className="font-bold text-sm text-[#1F2937]">{language === 'am' ? 'ትዕዛዝ ቁጥር' : 'Order'} #{order.id}</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm font-semibold text-[#6B7280]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-[#FF7A45]" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-[#FF7A45]" />
                <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto shrink-0 flex flex-col md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0">
            <div>
              <p className="text-2xl font-extrabold text-[#FF7A45]">{order.totalAmount} ETB</p>
              <p className="text-xs font-semibold text-[#6B7280]">{order.items?.length || 0} {language === 'am' ? 'እቃዎች ተገዝተዋል' : 'items purchased'}</p>
            </div>
            <Link href={`/orders/${order.id}`} className="block w-full md:w-auto">
              <Button variant="outline" size="sm" className="w-full md:w-auto h-10 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs">
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                {language === 'am' ? 'ዝርዝር እይ' : 'View Details'}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">{language === 'am' ? 'ትዕዛዞችን በመጫን ላይ...' : 'Loading orders...'}</div>
      </div>
    );
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
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45]">
                {language === 'am' ? 'ዳሽቦርድ' : 'Dashboard'}
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45]">
                {language === 'am' ? 'ፕሮፋይል' : 'Profile'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12">
        <div className="mb-10">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block font-sans">{language === 'am' ? 'የግዢ ታሪክ' : 'Purchase History'}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1F2937] mb-2">{language === 'am' ? 'የእኔ ትዕዛዞች' : 'My Orders'}</h1>
          <p className="text-base text-[#6B7280]">{language === 'am' ? 'የእርስዎን የትዕዛዝ ሁኔታ ይከታተሉ እና ያስተዳድሩ።' : 'Track and manage your order statements.'}</p>
        </div>

        {orders?.length === 0 ? (
          <Card className="rounded-[24px] border-gray-150 bg-white p-2 shadow-sm text-center py-16 max-w-xl mx-auto">
            <CardContent className="space-y-6">
              <Package className="h-14 w-14 mx-auto text-[#FF7A45] mb-2 opacity-80" />
              <h2 className="text-xl font-semibold mb-2 text-[#1F2937]">{language === 'am' ? 'እስካሁን ምንም ትዕዛዝ የለም' : 'No orders yet'}</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-md mx-auto">
                {language === 'am' ? 'እስካሁን ምንም የማስተማሪያ ቁሳቁስ ወይም ተጨማሪ ዕቃዎችን አላዘዙም።' : "You haven't ordered any supplies or track additions yet."}
              </p>
              <Link href="/shops">
                <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-8 rounded-xl transition-all">
                  {language === 'am' ? 'ግዢ ጀምር' : 'Start Shopping'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="bg-gray-100/70 p-1.5 rounded-xl border border-gray-100 max-w-lg">
              <TabsTrigger value="all" className="rounded-lg py-2.5 font-semibold text-xs md:text-sm">{language === 'am' ? 'ሁሉም' : 'All'} ({orders?.length || 0})</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg py-2.5 font-semibold text-xs md:text-sm">{language === 'am' ? 'በጥበቃ ላይ' : 'Pending'} ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="processing" className="rounded-lg py-2.5 font-semibold text-xs md:text-sm">{language === 'am' ? 'በማቀናበር ላይ' : 'Processing'} ({processingOrders.length})</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg py-2.5 font-semibold text-xs md:text-sm">{language === 'am' ? 'የተጠናቀቁ' : 'Completed'} ({completedOrders.length})</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg py-2.5 font-semibold text-xs md:text-sm">{language === 'am' ? 'የተሰረዙ' : 'Cancelled'} ({cancelledOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {orders?.map((order: any) => <OrderCard key={order.id} order={order} />)}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingOrders.map((order: any) => <OrderCard key={order.id} order={order} />)}
            </TabsContent>

            <TabsContent value="processing" className="space-y-4">
              {processingOrders.map((order: any) => <OrderCard key={order.id} order={order} />)}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedOrders.map((order: any) => <OrderCard key={order.id} order={order} />)}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledOrders.map((order: any) => <OrderCard key={order.id} order={order} />)}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
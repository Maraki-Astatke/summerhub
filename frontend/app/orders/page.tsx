'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../lib/api';
import { Package, Calendar, Clock, Eye } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
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
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'approved_by_parent': return 'text-blue-600 bg-blue-50';
      case 'paid': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-purple-600 bg-purple-50';
      case 'delivered': return 'text-green-700 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved_by_parent': return 'Approved by Parent';
      case 'paid': return 'Paid';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5 text-gray-400" />
              <span className="font-semibold">Order #{order.id}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">{order.totalAmount} ETB</p>
            <p className="text-sm text-gray-500 mb-2">{order.items?.length || 0} item(s)</p>
            <Link href={`/orders/${order.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub</Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600 mb-8">Track and manage your purchases</p>

        {orders?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
              <Link href="/shops">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({orders?.length || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({processingOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
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
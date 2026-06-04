'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../../lib/api';
import { ArrowLeft, Package, Calendar, Clock, CreditCard, MapPin, CheckCircle } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!user,
  });

  if (authLoading || isLoading) {
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'approved_by_parent', 'paid', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status);
    return currentIndex + 1;
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
            <Link href="/orders">
              <Button variant="ghost">Orders</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>

        {/* Order Progress */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${getStatusStep(order.status) >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                  {getStatusStep(order.status) > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
                </div>
                <p className="text-sm font-medium">Order Placed</p>
              </div>
              <div className="flex-1 h-1 bg-gray-200">
                <div className="h-full bg-green-500" style={{ width: order.status === 'approved_by_parent' ? '33%' : order.status === 'paid' ? '50%' : order.status === 'shipped' ? '75%' : order.status === 'delivered' ? '100%' : '0%' }} />
              </div>
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${getStatusStep(order.status) >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                  {getStatusStep(order.status) > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
                </div>
                <p className="text-sm font-medium">Approved</p>
              </div>
              <div className="flex-1 h-1 bg-gray-200">
                <div className="h-full bg-green-500" style={{ width: order.status === 'paid' ? '50%' : order.status === 'shipped' ? '75%' : order.status === 'delivered' ? '100%' : '0%' }} />
              </div>
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${getStatusStep(order.status) >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                  {getStatusStep(order.status) > 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
                </div>
                <p className="text-sm font-medium">Paid</p>
              </div>
              <div className="flex-1 h-1 bg-gray-200">
                <div className="h-full bg-green-500" style={{ width: order.status === 'shipped' ? '75%' : order.status === 'delivered' ? '100%' : '0%' }} />
              </div>
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${getStatusStep(order.status) >= 4 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                  {getStatusStep(order.status) > 4 ? <CheckCircle className="h-5 w-5" /> : '4'}
                </div>
                <p className="text-sm font-medium">Shipped</p>
              </div>
              <div className="flex-1 h-1 bg-gray-200">
                <div className="h-full bg-green-500" style={{ width: order.status === 'delivered' ? '100%' : '0%' }} />
              </div>
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${order.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                  5
                </div>
                <p className="text-sm font-medium">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.priceAtTime} ETB</p>
                      <p className="text-sm text-gray-500">Total: {item.priceAtTime * item.quantity} ETB</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{order.totalAmount} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{order.totalAmount} ETB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Placed on: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Placed at: {new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
                {order.paymentMethod && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span>Payment: {order.paymentMethod}</span>
                  </div>
                )}
                {order.shippingAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>Shipping: {order.shippingAddress}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-20 text-[#1F2937]">
        <div className="max-w-[1440px] mx-auto px-4 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link href="/orders">
            <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-8 rounded-xl">
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
                Dashboard
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="ghost" className="text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45]">
                Orders
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#FF7A45] font-semibold rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1F2937]">Order #{order.id}</h1>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Order Progress */}
        <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${getStatusStep(order.status) >= 1 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusStep(order.status) > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
                </div>
                <p className="text-xs font-bold text-gray-700">Order Placed</p>
              </div>
              <div className="hidden md:block flex-1 h-1 bg-gray-100">
                <div className="h-full bg-green-500" style={{ width: order.status === 'approved_by_parent' ? '33%' : order.status === 'paid' ? '50%' : order.status === 'shipped' ? '75%' : order.status === 'delivered' ? '100%' : '0%' }} />
              </div>
              
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${getStatusStep(order.status) >= 2 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusStep(order.status) > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
                </div>
                <p className="text-xs font-bold text-gray-700">Approved</p>
              </div>
              <div className="hidden md:block flex-1 h-1 bg-gray-100">
                <div className="h-full bg-green-500" style={{ width: order.status === 'paid' ? '50%' : order.status === 'shipped' ? '75%' : order.status === 'delivered' ? '100%' : '0%' }} />
              </div>
              
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${getStatusStep(order.status) >= 3 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusStep(order.status) > 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
                </div>
                <p className="text-xs font-bold text-gray-700">Paid</p>
              </div>
              <div className="hidden md:block flex-1 h-1 bg-gray-100">
                <div className="h-full bg-green-500" style={{ width: order.status === 'shipped' ? '75%' : order.status === 'delivered' ? '100%' : '0%' }} />
              </div>
              
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${getStatusStep(order.status) >= 4 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {getStatusStep(order.status) > 4 ? <CheckCircle className="h-5 w-5" /> : '4'}
                </div>
                <p className="text-xs font-bold text-gray-700">Shipped</p>
              </div>
              <div className="hidden md:block flex-1 h-1 bg-gray-100">
                <div className="h-full bg-green-500" style={{ width: order.status === 'delivered' ? '100%' : '0%' }} />
              </div>
              
              <div className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${order.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  5
                </div>
                <p className="text-xs font-bold text-gray-700">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="md:col-span-2">
            <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b border-gray-50">
                <CardTitle className="text-lg font-bold text-[#1F2937]">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-sm text-[#1F2937]">{item.product?.name}</p>
                      <p className="text-xs font-semibold text-[#6B7280]">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[#1F2937]">{item.priceAtTime} ETB</p>
                      <p className="text-xs font-semibold text-[#FF7A45]">Total: {item.priceAtTime * item.quantity} ETB</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary side details */}
          <div className="space-y-6">
            <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b border-gray-50">
                <CardTitle className="text-lg font-bold text-[#1F2937]">Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-sm font-semibold text-[#6B7280]">
                  <span>Subtotal</span>
                  <span className="text-[#1F2937]">{order.totalAmount} ETB</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#6B7280]">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-50 pt-3">
                  <div className="flex justify-between font-extrabold text-[#1F2937]">
                    <span>Total</span>
                    <span className="text-[#FF7A45]">{order.totalAmount} ETB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b border-gray-50">
                <CardTitle className="text-lg font-bold text-[#1F2937]">Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs md:text-sm font-semibold text-[#6B7280]">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4.5 w-4.5 text-[#FF7A45]" />
                  <span>Placed on: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4.5 w-4.5 text-[#FF7A45]" />
                  <span>Placed at: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {order.paymentMethod && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4.5 w-4.5 text-[#FF7A45]" />
                    <span className="capitalize">Payment: {order.paymentMethod}</span>
                  </div>
                )}
                {order.shippingAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4.5 w-4.5 text-[#FF7A45] shrink-0" />
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
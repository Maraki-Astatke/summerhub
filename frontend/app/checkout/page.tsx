'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '../lib/api';
import { ArrowLeft, CreditCard, Building2, Smartphone } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: !!user,
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/orders/create');
      return response.data;
    },
    onSuccess: async (order) => {
      if (paymentMethod === 'chapa') {
        try {
          const paymentResponse = await api.post(`/payment/initiate/${order.id}`);
          window.location.href = paymentResponse.data.checkoutUrl;
        } catch (error: any) {
          alert(error.response?.data?.error || 'Payment initiation failed');
          setIsProcessing(false);
        }
      } else {
        router.push(`/orders/${order.id}`);
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Checkout failed');
      setIsProcessing(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress) {
      alert('Please enter shipping address');
      return;
    }

    setIsProcessing(true);
    
    try {
      await createOrderMutation.mutateAsync();
    } catch (error) {
      setIsProcessing(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center font-semibold text-gray-500">Preparing checkout details...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-20 text-[#1F2937]">
        <div className="max-w-[1440px] mx-auto px-4 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Cart is Empty</h1>
          <Link href="/shops">
            <Button className="bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold h-11 px-8 rounded-xl">
              Go to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
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
          <Link href="/cart">
            <Button variant="ghost" className="text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45]">
              Back to Cart
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#FF7A45] font-semibold rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Checkout</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
                <CardHeader className="p-6 pb-4 border-b border-gray-50">
                  <CardTitle className="text-lg font-bold text-[#1F2937]">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Address</Label>
                    <Input
                      id="address"
                      placeholder="Your street name, building number, city"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      className="h-11 px-4 rounded-xl border-gray-200 focus-visible:ring-[#FF7A45]"
                    />
                    <p className="text-xs text-[#6B7280]">
                      We will deliver your physical resource materials and kits directly to this location.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden">
                <CardHeader className="p-6 pb-4 border-b border-gray-50">
                  <CardTitle className="text-lg font-bold text-[#1F2937]">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-3 border border-gray-100 rounded-xl p-4 bg-[#FAFAFA] hover:bg-white transition-all cursor-pointer">
                      <RadioGroupItem value="chapa" id="chapa" className="text-[#FF7A45] focus:ring-[#FF7A45]" />
                      <Label htmlFor="chapa" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-[#FF7A45]" />
                        <div>
                          <p className="font-bold text-sm text-[#1F2937]">Chapa Gateway</p>
                          <p className="text-xs text-[#6B7280]">Pay with Telebirr, CBEBirr, Cards, etc.</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 border border-gray-100 rounded-xl p-4 bg-[#FAFAFA] hover:bg-white transition-all cursor-pointer">
                      <RadioGroupItem value="stripe" id="stripe" className="text-[#FF7A45] focus:ring-[#FF7A45]" />
                      <Label htmlFor="stripe" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5 text-[#FF7A45]" />
                        <div>
                          <p className="font-bold text-sm text-[#1F2937]">Stripe Card</p>
                          <p className="text-xs text-[#6B7280]">Pay securely with International Credit/Debit Card</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border border-gray-100 rounded-xl p-4 bg-[#FAFAFA] hover:bg-white transition-all cursor-pointer">
                      <RadioGroupItem value="telebirr" id="telebirr" className="text-[#FF7A45] focus:ring-[#FF7A45]" />
                      <Label htmlFor="telebirr" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-[#FF7A45]" />
                        <div>
                          <p className="font-bold text-sm text-[#1F2937]">Direct Telebirr</p>
                          <p className="text-xs text-[#6B7280]">Pay via mobile money wallet transfer</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FF7A45] hover:bg-[#ff8f61] text-[#1F2937] font-bold rounded-xl transition-all shadow-md shadow-[#FF7A45]/15"
                disabled={isProcessing || !shippingAddress}
              >
                {isProcessing ? 'Processing order...' : `Place Order - ${cart.total} ETB`}
              </Button>
            </form>
          </div>

          <div>
            <Card className="border border-gray-100 bg-white rounded-[24px] shadow-sm overflow-hidden sticky top-28">
              <CardHeader className="p-6 pb-4 border-b border-gray-50">
                <CardTitle className="text-lg font-bold text-[#1F2937]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="max-h-64 overflow-auto space-y-3 pr-2">
                  {cart.items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between text-xs font-semibold text-[#6B7280]">
                      <span className="max-w-[70%]">{item.product.name} <span className="text-[#FF7A45]">x{item.quantity}</span></span>
                      <span className="text-[#1F2937]">{item.product.price * item.quantity} ETB</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-[#6B7280]">
                    <span>Subtotal</span>
                    <span className="text-[#1F2937]">{cart.total} ETB</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#6B7280]">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-100 mt-3 pt-3">
                    <div className="flex justify-between font-extrabold text-lg text-[#1F2937]">
                      <span>Total</span>
                      <span className="text-[#FF7A45]">{cart.total} ETB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
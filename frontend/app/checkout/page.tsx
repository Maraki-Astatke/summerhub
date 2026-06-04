'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Cart is Empty</h1>
          <Link href="/shops">
            <Button>Continue Shopping</Button>
          </Link>
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
            <Link href="/cart">
              <Button variant="ghost">Back to Cart</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/cart">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      placeholder="Your full address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll deliver your items to this address
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-3 border rounded-lg p-3">
                      <RadioGroupItem value="chapa" id="chapa" />
                      <Label htmlFor="chapa" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Chapa</p>
                          <p className="text-xs text-gray-500">Pay with Chapa (Telebirr, CBEBirr, Card)</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-3">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Stripe</p>
                          <p className="text-xs text-gray-500">Pay with Credit/Debit Card</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-3">
                      <RadioGroupItem value="telebirr" id="telebirr" />
                      <Label htmlFor="telebirr" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Telebirr</p>
                          <p className="text-xs text-gray-500">Pay with Telebirr mobile money</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isProcessing || !shippingAddress}
              >
                {isProcessing ? 'Processing...' : `Place Order - ${cart.total} ETB`}
              </Button>
            </form>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 overflow-auto space-y-2">
                  {cart.items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>{item.product.price * item.quantity} ETB</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{cart.total} ETB</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t mt-3 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{cart.total} ETB</span>
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
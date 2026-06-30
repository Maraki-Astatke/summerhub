'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import {
  Package, ShoppingCart, DollarSign, AlertTriangle, Plus, Edit, Trash2,
  Menu, X, LayoutDashboard, BarChart3, Store, Upload, XCircle, Star,
  Phone, TrendingUp,
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockCount: '',
    categoryId: '',
    imageUrl: '',
    phone: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && !user?.roles?.includes('seller')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const { data: stats } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      const response = await api.get('/seller/stats');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('seller'),
  });

  const { data: products } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const response = await api.get('/seller/products');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('seller'),
  });

  const { data: orders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await api.get('/seller/orders');
      return response.data;
    },
    enabled: !!user && user?.roles?.includes('seller'),
  });

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await api.get('/product-categories');
      return response.data;
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/upload/product-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.imageUrl;
    },
    onError: (error: any) => {
      alert('Failed to upload image: ' + (error.response?.data?.error || 'Unknown error'));
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-stats'] });
      setActiveTab('products');
      setFormData({
        name: '',
        description: '',
        price: '',
        stockCount: '',
        categoryId: '',
        imageUrl: '',
        phone: '',
      });
      alert('Product created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to create product';
      alert(message);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setEditingProduct(null);
      alert('Product updated successfully!');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-stats'] });
      alert('Product deleted');
    },
  });

  const fulfillOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await api.put(`/seller/orders/${orderId}/fulfill`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      alert('Order marked as shipped');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImageMutation.mutateAsync(file);
      setFormData({ ...formData, imageUrl });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Valid price is required');
      return;
    }

    if (!formData.stockCount || parseInt(formData.stockCount) < 0) {
      alert('Valid stock count is required');
      return;
    }

    if (!formData.imageUrl) {
      alert('Product image is required');
      return;
    }

    const submitData: any = {
      name: formData.name.trim(),
      description: formData.description || '',
      price: parseFloat(formData.price),
      stockCount: parseInt(formData.stockCount),
      imageUrl: formData.imageUrl,
      phone: formData.phone || null,
    };

    if (formData.categoryId && formData.categoryId !== '') {
      submitData.categoryId = parseInt(formData.categoryId);
    }

    createProductMutation.mutate(submitData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stockCount: parseInt(formData.stockCount),
        phone: formData.phone || null,
      };

      if (formData.imageUrl) {
        updateData.imageUrl = formData.imageUrl;
      }

      if (formData.categoryId && formData.categoryId !== '') {
        updateData.categoryId = parseInt(formData.categoryId);
      }

      updateProductMutation.mutate({
        id: editingProduct.id,
        data: updateData,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !user?.roles?.includes('seller')) {
    return null;
  }

  const menuItems = [
    { id: 'stats', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'create', label: 'Add Product', icon: <Plus className="w-5 h-5" /> },
    { id: 'products', label: 'My Products', icon: <Package className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (activeTab === 'products') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products?.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-16">
                  <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg text-gray-500 font-medium">No products listed yet</p>
                  <Button className="mt-4 bg-[#FF7A45] hover:bg-[#ff8f61]" onClick={() => setActiveTab('create')}>Add First Product</Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            products?.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm group">
                <div className="relative w-full h-52 bg-gray-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FF7A45]/5">
                      <Package className="h-14 w-14 text-[#FF7A45]/30" />
                    </div>
                  )}
                  {product.stockCount < 10 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      Low Stock
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setFormData({
                          name: product.name,
                          description: product.description || '',
                          price: product.price.toString(),
                          stockCount: product.stockCount.toString(),
                          categoryId: product.categoryId?.toString() || '',
                          imageUrl: product.imageUrl || '',
                          phone: product.phone || '',
                        });
                      }}
                      className="bg-white/90 hover:bg-white p-1.5 rounded-lg shadow"
                    >
                      <Edit className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this product?')) { deleteProductMutation.mutate(product.id); } }}
                      className="bg-white/90 hover:bg-white p-1.5 rounded-lg shadow"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <CardContent className="p-5">
                  <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{product.description || 'No description'}</p>

                  {product.phone && (
                    <div className="flex items-center gap-1.5 mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-3.5 w-3.5 text-[#FF7A45]" />
                      <span>{product.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#FF7A45]">{product.price} ETB</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-600">{product.averageRating?.toFixed(1) || '0'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className={`font-semibold ${product.stockCount < 10 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                      Stock: {product.stockCount}
                    </span>
                    <span className="text-gray-400">Sold: {product.totalSold || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      );
    }

    if (activeTab === 'orders') {
      return (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Customer Orders</CardTitle>
            <CardDescription>Orders placed for your products</CardDescription>
          </CardHeader>
          <CardContent>
            {orders?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders?.map((order: any) => (
                  <div key={order.orderId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.orderId}</p>
                        <p className="text-sm text-gray-500">{order.customerName} ({order.customerEmail})</p>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.orderStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.productName} x{item.quantity}</span>
                          <span>{item.total} ETB</span>
                        </div>
                      ))}
                    </div>
                    {order.orderStatus === 'paid' && (
                      <Button size="sm" onClick={() => fulfillOrderMutation.mutate(order.orderId)}>
                        Mark as Shipped
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // ============================================
    // ANALYTICS - WITH TABLE INSTEAD OF GRAPH
    // ============================================
    if (activeTab === 'stats') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "Total Products", value: stats?.totalProducts || 0, icon: <Package className="h-6 w-6 text-[#FF7A45]" /> },
              { label: "Total Orders", value: stats?.totalOrders || 0, icon: <ShoppingCart className="h-6 w-6 text-[#FF7A45]" /> },
              { label: "Revenue (ETB)", value: stats?.totalRevenue || 0, icon: <DollarSign className="h-6 w-6 text-[#FF7A45]" /> },
              { label: "Low Stock", value: stats?.lowStockProducts || 0, icon: <AlertTriangle className="h-6 w-6 text-orange-500" /> },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FF7A45]/10 rounded-xl flex-shrink-0">{stat.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* TABLE INSTEAD OF GRAPH */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold dark:text-white">Sales Analytics</CardTitle>
              <CardDescription className="text-base dark:text-gray-400">Products, Orders, Revenue, and Stock Overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="dark:text-gray-300">Metric</TableHead>
                      <TableHead className="dark:text-gray-300 text-right">Value</TableHead>
                      <TableHead className="dark:text-gray-300 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <TableCell className="font-medium dark:text-gray-200 flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#FF7A45]" />
                        Total Products
                      </TableCell>
                      <TableCell className="text-right dark:text-gray-300">{stats?.totalProducts || 0}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full font-medium">
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <TableCell className="font-medium dark:text-gray-200 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-[#FF7A45]" />
                        Total Orders
                      </TableCell>
                      <TableCell className="text-right dark:text-gray-300">{stats?.totalOrders || 0}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${stats?.totalOrders > 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 'text-gray-500 bg-gray-50 dark:bg-gray-700/30'}`}>
                          {stats?.totalOrders > 0 ? 'Active' : 'No Orders'}
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <TableCell className="font-medium dark:text-gray-200 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-[#FF7A45]" />
                        Total Revenue
                      </TableCell>
                      <TableCell className="text-right dark:text-gray-300 font-bold text-[#FF7A45]">{stats?.totalRevenue || 0} ETB</TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full font-medium">
                          {stats?.totalRevenue > 0 ? 'Earning' : 'No Revenue'}
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <TableCell className="font-medium dark:text-gray-200 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Low Stock Products
                      </TableCell>
                      <TableCell className="text-right dark:text-gray-300">{stats?.lowStockProducts || 0}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${stats?.lowStockProducts > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-green-600 bg-green-50 dark:bg-green-900/30'}`}>
                          {stats?.lowStockProducts > 0 ? '⚠️ Need Restock' : '✅ In Stock'}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === 'create') {
      return (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>List a new product for sale</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (ETB) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stockCount">Stock Quantity *</Label>
                  <Input
                    id="stockCount"
                    type="number"
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., 0912345678"
                />
                <p className="text-xs text-gray-400 mt-1">Buyers will see this number to contact you</p>
              </div>

              <div>
                <Label htmlFor="categoryId">Category (Optional)</Label>
                <select
                  id="categoryId"
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">-- Select Category --</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Product Image *</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {formData.imageUrl ? (
                      <div className="relative inline-block">
                        <div className="w-40 h-40 relative">
                          <img
                            src={formData.imageUrl}
                            alt="Product preview"
                            className="w-full h-full object-cover rounded-lg"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#FF7A45] hover:text-[#ff8f61] focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="image-upload"
                              name="image-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                    {uploadingImage && (
                      <p className="text-sm text-[#FF7A45]">Uploading...</p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={createProductMutation.isPending || uploadingImage} className="w-full">
                {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-[#1F2937]">
      <DashboardHeader
        user={user}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        roleName="Seller"
      />

      <div className={`fixed top-16 bottom-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 pt-5 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-base font-medium ${
                  activeTab === item.id
                    ? 'bg-[#FF7A45]/10 text-[#FF7A45] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="lg:ml-72 pt-16 min-h-screen">
        <div className="p-6 md:p-8">
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Seller Dashboard</h1>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Manage your products and orders</p>
          </div>
          {renderContent()}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold dark:text-white">Edit Product</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price">Price (ETB)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-stockCount">Stock Quantity</Label>
                    <Input
                      id="edit-stockCount"
                      type="number"
                      value={formData.stockCount}
                      onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., 0912345678"
                  />
                  <p className="text-xs text-gray-400 mt-1">Buyers will see this number to contact you</p>
                </div>

                <div>
                  <Label htmlFor="edit-categoryId">Category</Label>
                  <select
                    id="edit-categoryId"
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Product Image</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      {formData.imageUrl ? (
                        <div className="relative inline-block">
                          <div className="w-40 h-40 relative">
                            <img
                              src={formData.imageUrl}
                              alt="Product preview"
                              className="w-full h-full object-cover rounded-lg"
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="edit-image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-[#FF7A45] hover:text-[#ff8f61]"
                            >
                              <span>Upload a file</span>
                              <input
                                id="edit-image-upload"
                                name="edit-image-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </>
                      )}
                      {uploadingImage && (
                        <p className="text-sm text-[#FF7A45]">Uploading...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={updateProductMutation.isPending || uploadingImage}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingProduct(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import api from '@/lib/api';
import { 
  Package, ShoppingCart, DollarSign, AlertTriangle, Plus, Edit, Trash2, 
  Menu, X, LogOut, LayoutDashboard, BookOpen, Newspaper, Trophy, 
  MessageSquare, Settings, Home, BarChart3, Store, Upload, XCircle, Star
} from 'lucide-react';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockCount: '',
    categoryId: '',
    imageUrl: '',
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
    { id: 'products', label: 'My Products', icon: <Package className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'stats', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'create', label: 'Add Product', icon: <Plus className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (activeTab === 'products') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products?.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No products listed yet</p>
                  <Button className="mt-4" onClick={() => setActiveTab('create')}>Add First Product</Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            products?.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  {product.stockCount < 10 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Low Stock
                    </div>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{product.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            name: product.name,
                            description: product.description || '',
                            price: product.price.toString(),
                            stockCount: product.stockCount.toString(),
                            categoryId: product.categoryId?.toString() || '',
                            imageUrl: product.imageUrl || '',
                          });
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Delete this product?')) {
                            deleteProductMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-xs line-clamp-2 mb-2">{product.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-bold text-purple-600">{product.price} ETB</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {product.averageRating?.toFixed(1) || '0'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
                    <span className={`font-medium ${product.stockCount < 10 ? 'text-red-500' : 'text-gray-500'}`}>
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
        <Card>
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

    if (activeTab === 'stats') {
      return (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Metric</th>
                <th className="text-right p-4 font-semibold text-gray-600">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Total Products</span>
                </td>
                <td className="p-4 text-right font-bold text-xl">{stats?.totalProducts || 0}</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Total Orders</span>
                </td>
                <td className="p-4 text-right font-bold text-xl">{stats?.totalOrders || 0}</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Revenue</span>
                </td>
                <td className="p-4 text-right font-bold text-xl">{stats?.totalRevenue || 0} ETB</td>
              </tr>
              <tr>
                <td className="p-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Low Stock Products</span>
                </td>
                <td className="p-4 text-right font-bold text-xl text-yellow-600">{stats?.lowStockProducts || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'create') {
      return (
        <Card>
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
                            className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none"
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
                      <p className="text-sm text-purple-600">Uploading...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-20 px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-purple-600">HobbyHub Seller</Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link href="/" className="text-2xl font-bold text-purple-600">HobbyHub</Link>
            <p className="text-sm text-gray-500 mt-1">Seller Portal</p>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">
                  {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>
            <Link href="/shops" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Store className="w-5 h-5" />
              <span className="font-medium">Marketplace</span>
            </Link>
            <Link href="/events" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">Events</span>
            </Link>
            <Link href="/chat" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>
           <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5" /><span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="lg:ml-72 min-h-screen">
        <div className="p-6 md:p-8 pt-20 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Seller Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your products and orders</p>
          </div>
          {renderContent()}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Edit Product</h2>
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
                  <Label htmlFor="edit-categoryId">Category</Label>
                  <select
                    id="edit-categoryId"
                    className="w-full border rounded-md px-3 py-2"
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
                              className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500"
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
                        <p className="text-sm text-purple-600">Uploading...</p>
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
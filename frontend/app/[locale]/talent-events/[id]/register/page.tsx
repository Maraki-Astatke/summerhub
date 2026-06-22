'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, 
  Upload, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function TalentEventRegisterPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/event-posts/${postId}`);
        setPost(res.data);
      } catch {
        setError('Event not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    if (file) formData.append('file', file);

    try {
      await api.post(`/event-posts/${postId}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A45]" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F5] via-white to-[#FFF2EB]">
      <Navbar alwaysWhite={true} />

      <main className="max-w-5xl mx-auto px-4 py-12 pt-32">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          
          {/* Left — Event Info */}
          <div className="space-y-6">
            {post?.imageUrl && (
              <div className="w-full h-64 rounded-[24px] overflow-hidden shadow-lg">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-4">
              <div>
                <span className="text-xs font-bold text-[#FF7A45] uppercase tracking-widest">Talent Event</span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{post?.title}</h1>
              </div>

              <div className="space-y-2.5 text-sm text-gray-600">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#FF7A45] shrink-0" />
                  <span>{post?.date}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#FF7A45] shrink-0" />
                  <span>{post?.time}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#FF7A45] shrink-0" />
                  <span>{post?.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#FF7A45] shrink-0" />
                  <span>{post?.whoCanJoin}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 leading-relaxed">{post?.about}</p>
              </div>
            </div>
          </div>

          {/* Right — Registration Form */}
          <div>
            {submitted ? (
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 text-center space-y-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">You're Registered!</h2>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Your registration for <strong>{post?.title}</strong> has been received. We'll be in touch soon!
                </p>
                <div className="pt-2 text-sm text-gray-400">Contact: {post?.contact}</div>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                {!post?.registrationOpen ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-[#FF7A45]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Registration Closed</h2>
                    <p className="text-gray-500">Registration for this event is not currently open. Please check back later or contact us at {post?.contact}.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-extrabold text-gray-900">Register Now</h2>
                      <p className="text-sm text-gray-500 mt-1">Fill in your details to apply for this event.</p>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g. Tigist Mengistu"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="e.g. +251 91 234 5678"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="e.g. tigist@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Portfolio / Audition File <span className="text-gray-400 font-normal">(Optional)</span></Label>
                        {file ? (
                          <div className="flex items-center justify-between bg-[#FFF2EB] border border-[#FF7A45]/30 rounded-xl px-4 py-3">
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                            <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#FF7A45]/40 hover:bg-[#FFF8F5] transition-all">
                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Click to upload PDF, image, or video</span>
                            <span className="text-xs text-gray-400 mt-0.5">Max 20MB</span>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mkv,.webp" onChange={handleFileChange} />
                          </label>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-[#FF7A45] hover:bg-[#ff6224] text-white font-bold rounded-xl shadow-md shadow-[#FF7A45]/20 transition-all"
                      >
                        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : 'Submit Registration'}
                      </Button>

                      <p className="text-xs text-gray-400 text-center">
                        Questions? Contact us at <a href={`mailto:${post?.contact}`} className="text-[#FF7A45] underline">{post?.contact}</a>
                      </p>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

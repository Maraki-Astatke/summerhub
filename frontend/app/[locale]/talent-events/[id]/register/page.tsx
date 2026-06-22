'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  Upload, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  AlertCircle,
  Loader2,
  FileText,
  Phone,
  Mail,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

export default function TalentEventRegisterPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [myRegistration, setMyRegistration] = useState<any | null>(null);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [unregistered, setUnregistered] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await api.get(`/event-posts/${postId}`);
        setPost(postRes.data);

        // Check if already registered
        try {
          const regRes = await api.get(`/event-posts/${postId}/my-registration`);
          if (regRes.data.registration) {
            setMyRegistration(regRes.data.registration);
          }
        } catch {
          // Not logged in or no registration — that's fine
        }
      } catch {
        setError('Event not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (form.description) formData.append('description', form.description);
    if (file) formData.append('file', file);

    try {
      const res = await api.post(`/event-posts/${postId}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMyRegistration(res.data.registration);
      setSubmitted(true);
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Already registered
        setMyRegistration(err.response.data.registration);
      } else {
        setError(err.response?.data?.error || 'Failed to submit registration. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    setIsUnregistering(true);
    try {
      await api.delete(`/event-posts/${postId}/my-registration`);
      setMyRegistration(null);
      setUnregistered(true);
      setSubmitted(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to unregister.');
    } finally {
      setIsUnregistering(false);
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

  const showRegisteredView = myRegistration && !unregistered;

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

          {/* Right — Registration Form or Status */}
          <div>
            {unregistered ? (
              /* Unregistered confirmation */
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Registration Cancelled</h2>
                <p className="text-gray-500 max-w-xs mx-auto">
                  You've been removed from <strong>{post?.title}</strong>. You can register again if you change your mind.
                </p>
                <Button
                  onClick={() => setUnregistered(false)}
                  className="bg-[#FF7A45] hover:bg-[#ff6224] text-white rounded-xl px-8 mt-2"
                >
                  Register Again
                </Button>
              </div>
            ) : showRegisteredView ? (
              /* Already registered — show their details */
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">You're Registered!</h2>
                    <p className="text-sm text-gray-500">Here's your registration summary</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A45] to-[#ff6224] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {myRegistration.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{myRegistration.name}</p>
                      <p className="text-xs text-gray-400">Registered {format(new Date(myRegistration.createdAt), 'MMM d, yyyy • h:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{myRegistration.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{myRegistration.phone}</span>
                  </div>
                  {myRegistration.description && (
                    <div className="border-t border-gray-200 pt-3 mt-1">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm text-gray-600">{myRegistration.description}</p>
                    </div>
                  )}
                  {myRegistration.fileUrl && (
                    <a
                      href={myRegistration.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#FF7A45] font-semibold hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      {myRegistration.fileName || 'View Uploaded File'}
                    </a>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Questions? Contact us at <a href={`mailto:${post?.contact}`} className="text-[#FF7A45] underline">{post?.contact}</a>
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleUnregister}
                    disabled={isUnregistering}
                    className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-semibold gap-2"
                  >
                    {isUnregistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Cancel My Registration
                  </Button>
                </div>
              </div>
            ) : submitted ? (
              /* Just submitted */
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
            ) : !post?.registrationOpen ? (
              /* Registration closed */
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 text-center space-y-4">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-[#FF7A45]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Registration Closed</h2>
                <p className="text-gray-500">Registration for this event is not currently open. Please check back later or contact {post?.contact}.</p>
              </div>
            ) : (
              /* New registration form */
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
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
                    <Label htmlFor="description">
                      About You / Why You Want to Join{' '}
                      <span className="text-gray-400 font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Tell us a bit about yourself or your talent..."
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      className="rounded-xl resize-none"
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

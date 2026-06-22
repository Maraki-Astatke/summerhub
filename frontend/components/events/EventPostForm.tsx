'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Users, Mail, Image as ImageIcon, CheckCircle } from 'lucide-react';

interface EventPostFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EventPostForm({ initialData, onSubmit, onCancel, isLoading }: EventPostFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    about: initialData?.about || '',
    whoCanJoin: initialData?.whoCanJoin || '',
    contact: initialData?.contact || '',
    imageUrl: initialData?.imageUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. HobbyHub Monthly Talent Event"
            value={formData.title}
            onChange={handleChange}
            required
            className="text-lg font-semibold"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" /> Date
          </Label>
          <Input
            id="date"
            name="date"
            type="text"
            placeholder="e.g. October 15, 2026"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" /> Time
          </Label>
          <Input
            id="time"
            name="time"
            placeholder="e.g. 2:00 PM - 5:00 PM"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" /> Location (Venue or Link)
          </Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. Main Auditorium or Zoom Link"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="about" className="flex items-center gap-2">
            About the Event
          </Label>
          <Textarea
            id="about"
            name="about"
            placeholder="What is this event about?"
            value={formData.about}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whoCanJoin" className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" /> Who Can Join
          </Label>
          <Input
            id="whoCanJoin"
            name="whoCanJoin"
            placeholder="e.g. All students and scholars"
            value={formData.whoCanJoin}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contact" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" /> Contact Info
          </Label>
          <Input
            id="contact"
            name="contact"
            placeholder="e.g. talent@hobbieshub.com"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="imageUrl" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500" /> Image URL (Optional)
          </Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            placeholder="https://example.com/banner.jpg"
            value={formData.imageUrl}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#FF7A45] hover:bg-[#ff6224] text-white" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Event Post' : 'Publish Event Post'}
        </Button>
      </div>
    </form>
  );
}

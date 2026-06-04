'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '../providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import api from './lib/api';

const features = [
  {
    title: 'Relevant Skill Set',
    description: 'Learn practical skills that matter in today\'s world',
    icon: '🎯',
  },
  {
    title: 'Growth Mindset',
    description: 'Develop resilience and a passion for continuous learning',
    icon: '🌱',
  },
  {
    title: '1-on-1 Mentoring',
    description: 'Get personalized guidance from expert mentors',
    icon: '👨‍🏫',
  },
  {
    title: 'Hiring Partners',
    description: 'Connect with companies looking for talented youth',
    icon: '🤝',
  },
];

const extraFeatures = [
  {
    title: 'CV & Resume Prep',
    description: 'Build professional CVs that stand out to employers',
    icon: '📄',
  },
  {
    title: 'Interview Coaching',
    description: 'Practice and prepare for job interviews',
    icon: '🎤',
  },
  {
    title: 'Buddy System',
    description: 'Learn and grow with a peer mentor',
    icon: '👥',
  },
  {
    title: 'Career Opportunity',
    description: 'Access job and internship opportunities',
    icon: '💼',
  },
];

const faqs = [
  {
    question: 'Can I access course materials offline?',
    answer: 'Yes, you can download course materials and watch lessons offline through our mobile app.',
  },
  {
    question: 'Is there any prequalification for courses?',
    answer: 'Most courses are open to all. Some advanced courses may require basic knowledge.',
  },
  {
    question: 'How long do I have access to a course?',
    answer: 'You get lifetime access to all courses you enroll in.',
  },
  {
    question: 'How can I make a payment for a course?',
    answer: 'We support Chapa, Stripe, Telebirr, and CBEBirr payments.',
  },
  {
    question: 'How can I contact the course instructor?',
    answer: 'You can message instructors directly through the platform chat.',
  },
];

export default function Home() {
  const { user } = useAuth();

  const { data: hobbies, isLoading } = useQuery({
    queryKey: ['hobbies'],
    queryFn: async () => {
      try {
        const response = await api.get('/hobbies?limit=4');
        return response.data?.data || [];
      } catch (err) {
        console.error('Failed to load hobbies:', err);
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="HobbyHub Logo" 
              width={40} 
              height={40}
              className="h-10 w-auto"
              priority
            />
            <span className="text-xl font-bold text-purple-600">HobbyHub</span>
          </Link>
          
          {/* Navigation */}
          <nav className="flex flex-wrap gap-6 items-center">
            <Link href="/" className="text-gray-600 hover:text-purple-600">Home</Link>
            <Link href="/hobbies" className="text-gray-600 hover:text-purple-600">Course</Link>
            <Link href="/bootcamp" className="text-gray-600 hover:text-purple-600">Bootcamp</Link>
            <Link href="/blog" className="text-gray-600 hover:text-purple-600">Blog</Link>
            <Link href="/contact" className="text-gray-600 hover:text-purple-600">Contact</Link>
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700">Dashboard</Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-purple-600 hover:bg-purple-700">Register</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Passion</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Learn from expert teachers, join live lessons, and build skills for life
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              Start Learning Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">The Advantages of HobbyHub</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hobby Cards Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4">Popular Hobbies</h3>
          <p className="text-center text-gray-600 mb-12">Discover activities that match your interests</p>
          
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : hobbies?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hobbies available yet. Check back soon!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hobbies?.map((hobby: any) => (
                <Card key={hobby.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{hobby.name}</CardTitle>
                    <CardDescription>{hobby.description?.substring(0, 80)}...</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{hobby.ageGroup}</span>
                      {hobby.category && <span>• {hobby.category.name}</span>}
                    </div>
                    <Link href={`/hobbies/${hobby.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        Start Learning
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Extra Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {extraFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h3 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image 
                src="/logo.png" 
                alt="HobbyHub Logo" 
                width={50} 
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">HobbyHub</h2>
            <p className="text-gray-400 mb-4">BUILD YOUR FUTURE WITH US</p>
            <p className="text-gray-500 text-sm">© 2026 HobbyHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
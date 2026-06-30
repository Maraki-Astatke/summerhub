import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#1F2937]">
      <Navbar alwaysWhite />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-32">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#FF7A45] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-[#6B7280] mb-8">Last updated: June 30, 2026</p>
        <div className="prose prose-gray max-w-none space-y-6 text-[#6B7280] leading-relaxed">
          <p>
            HobbyHub Education collects information you provide during registration, including your
            name, email, phone number, and national ID, to verify your identity and deliver our services.
          </p>
          <p>
            We use your data to manage your account, personalize learning experiences, process orders,
            and communicate important updates. We do not sell your personal information to third parties.
          </p>
          <p>
            You may request access to or correction of your personal data by contacting our support team.
            We implement reasonable security measures to protect your information.
          </p>
        </div>
      </main>
    </div>
  );
}

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default async function TermsPage({
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
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-[#6B7280] mb-8">Last updated: June 30, 2026</p>
        <div className="prose prose-gray max-w-none space-y-6 text-[#6B7280] leading-relaxed">
          <p>
            By using HobbyHub Education, you agree to use the platform responsibly, provide accurate
            registration information, and respect teachers, students, and community guidelines.
          </p>
          <p>
            Accounts must be created with valid contact details. You are responsible for keeping your
            login credentials secure and for all activity under your account.
          </p>
          <p>
            HobbyHub may update these terms from time to time. Continued use of the platform after
            changes are posted constitutes acceptance of the updated terms.
          </p>
        </div>
      </main>
    </div>
  );
}

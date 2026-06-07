'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { BookOpen, FileText, Download, PlayCircle, ExternalLink } from 'lucide-react';

export default function ResourcesPage() {
  const { user } = useAuth();

  const resources = [
    {
      title: 'UI/UX Starter Pack & Figma Guide',
      category: 'Design & Product',
      description: 'A comprehensive pack containing templates, typography guides, and best practice layouts for starting in product design.',
      type: 'Design Template',
      format: 'Figma Library',
    },
    {
      title: 'Introductory HTML & Tailwind V4 Cheat Sheet',
      category: 'Web Development',
      description: 'Master semantic layouts, flexbox grid alignments, and custom color mappings in the new Tailwind version.',
      type: 'PDF Document',
      format: 'PDF Guide',
    },
    {
      title: 'Ethiopian Career Landscape Report 2026',
      category: 'Professional Development',
      description: 'Detailed analysis of high-demand digital skills, remote job opportunities, and startup ecosystems.',
      type: 'Case Study',
      format: 'Interactive Report',
    },
    {
      title: 'React & Next.js Project Architecture Blueprint',
      category: 'Software Engineering',
      description: 'Ideal boilerplate layouts, hook managers, state selectors, and API handlers for building scalable products.',
      type: 'Code Boilerplate',
      format: 'GitHub Repository',
    },
    {
      title: 'Digital Marketing & Content Strategy Checklist',
      category: 'Marketing & SEO',
      description: 'Checklist guide for crafting marketing schedules, executing campaigns, and reviewing landing page conversion analytics.',
      type: 'Spreadsheet',
      format: 'Google Sheets Template',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F2937]">
      <Navbar alwaysWhite={true} />

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-14 py-12 pt-32">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#FF7A45] tracking-wider uppercase mb-2 block font-sans">Learning Center</span>
          <h1 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold tracking-tight text-[#1F2937] mb-3">
            Free Curated Resources
          </h1>
          <p className="text-base text-[#6B7280]">Download guidebooks, boilerplates, and cheat sheets to support your curriculum pace.</p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((res, index) => (
            <Card key={index} className="border border-gray-100 bg-white rounded-[24px] hover:translate-y-[-6px] hover:shadow-xl hover:shadow-[#FF7A45]/5 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm">
              <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold text-[#FF7A45] bg-[#FFF2EB] px-3 py-1 rounded-full uppercase tracking-wider">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">{res.format}</span>
                </div>
                <CardTitle className="text-xl font-bold text-[#1F2937] leading-snug tracking-tight mb-2">
                  {res.title}
                </CardTitle>
                <CardDescription className="text-sm text-[#6B7280] leading-relaxed">
                  {res.description}
                </CardDescription>
              </div>
              <CardContent className="p-6 pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                <span className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#FF7A45]" />
                  {res.type}
                </span>
                <Button 
                  onClick={() => alert('Download started successfully!')}
                  className="bg-[#FF7A45] hover:bg-[#ff8f61] text-white font-semibold rounded-xl h-10 text-xs px-4 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Get Asset
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

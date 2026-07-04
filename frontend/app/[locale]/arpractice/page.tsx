"use client";

import ARPractice from '@/components/ARPractice';
import { useTranslations } from 'next-intl';

export default function ARPracticePage() {
    const t = useTranslations('common');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <ARPractice />
            </div>
        </div>
    );
}
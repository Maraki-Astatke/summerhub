'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          locale === 'en' ? 'bg-[#FF7A45] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
        }`}
      >
        English
      </button>
      <button
        onClick={() => switchLanguage('am')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          locale === 'am' ? 'bg-[#FF7A45] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
        }`}
      >
        አማርኛ
      </button>
    </div>
  );
}
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const locales = [
  { code: 'en', name: 'english' },
  { code: 'pt', name: 'portuguese' },
  { code: 'es', name: 'spanish' },
];

export default function LanguageSelector() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname and add the new one
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPathname = `/${newLocale}${pathnameWithoutLocale}`;
    router.push(newPathname);
  };

  return (
    <div className="flex items-center space-x-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder={t('select')} />
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => (
            <SelectItem key={loc.code} value={loc.code}>
              {t(loc.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
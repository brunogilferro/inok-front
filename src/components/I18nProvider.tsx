'use client';


import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

function I18nProvider({ children }: { children: React.ReactNode }) {
  // Render children immediately to avoid re-mounting
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

export { I18nProvider };
export default I18nProvider; 
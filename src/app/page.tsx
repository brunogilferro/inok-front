'use client';

import ChatContainer from '@/components/chat/ChatContainer';
import I18nProvider from '@/components/I18nProvider';

export default function ChatPage() {
  return (
    <I18nProvider>
      <ChatContainer />
    </I18nProvider>
  );
}
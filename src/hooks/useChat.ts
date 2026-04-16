import { useState, useCallback } from 'react';
import type { ChatMessage } from '@/types/terminology';
import { fetchTermExplanation } from '@/services/terminologyService';
import { useUserStore } from '@/stores/userStore';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    const lang = useUserStore.getState().language;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      lang,
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const result = await fetchTermExplanation(text, lang);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.formalDefinition,
        timestamp: new Date(),
        data: result,
        lang,
      };
      setMessages((m) => [...m, assistantMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, sendMessage };
}

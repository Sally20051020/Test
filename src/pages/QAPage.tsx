import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, Tag, Clock, ThumbsUp, ThumbsDown, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import type { ChatMessage } from '@/types/terminology';
import { fetchTermExplanation } from '@/services/terminologyService';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { useSpeechRecognition, useSpeechSynthesis } from '@/hooks/useSpeech';
import { toast } from '@/hooks/use-toast';
import { ChatAvatar } from '@/components/ChatAvatar';

const SUGGESTED_EN = ['dividend', 'ETF', 'P/E ratio', 'RSI', 'market cap', 'yield', 'blue chip', 'IPO'];
const SUGGESTED_ZH = ['股息', '市盈率', '市值', '收益率', '衍生品', '蓝筹股', 'ETF', '熊市'];

const QAPage = () => {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentTerms, setRecentTerms] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { listening, startListening, stopListening, isSupported: micSupported } = useSpeechRecognition(language);
  const { speaking, speak, stop: stopSpeaking, isSupported: ttsSupported } = useSpeechSynthesis(language);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0 || (prev.length === 1 && prev[0].id === 'welcome')) {
        return [{
          id: 'welcome',
          role: 'assistant' as const,
          content: t('welcomeMsg'),
          timestamp: new Date(),
        }];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: t('welcomeMsg'),
        timestamp: new Date(),
      }]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track when TTS stops
  useEffect(() => {
    if (!speaking) setSpeakingMsgId(null);
  }, [speaking]);

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || loading) return;
    setInput('');

    const lang = language;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
      lang,
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const result = await fetchTermExplanation(query, lang);
      setRecentTerms((prev) => [result.term, ...prev.filter((t) => t !== result.term)].slice(0, 15));
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.formalDefinition,
        timestamp: new Date(),
        data: result,
        lang,
        feedback: null,
      };
      setMessages((m) => [...m, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setMessages((msgs) =>
      msgs.map((m) => (m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m))
    );
  };

  const handleMicClick = () => {
    if (!micSupported) {
      toast({ title: t('speechNotSupported'), variant: 'destructive' });
      return;
    }
    if (listening) {
      stopListening();
    } else {
      startListening(
        (transcript) => setInput((prev) => prev + transcript),
        (err) => {
          if (err === 'Microphone permission denied') {
            toast({ title: t('micPermissionDenied'), variant: 'destructive' });
          } else {
            toast({ title: t('speechNotSupported'), variant: 'destructive' });
          }
        }
      );
    }
  };

  const handleSpeak = (msgId: string, data: ChatMessage['data']) => {
    if (!ttsSupported) {
      toast({ title: t('speechNotSupported'), variant: 'destructive' });
      return;
    }
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      const text = data
        ? `${data.term}. ${data.formalDefinition}. ${data.simpleExplanation}. ${data.example}`
        : '';
      setSpeakingMsgId(msgId);
      speak(text);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            {/* Avatar floating in top-right of chat */}
            <div className="flex justify-end sticky top-0 z-10 pointer-events-none">
              <div className="pointer-events-auto">
                <ChatAvatar isThinking={loading} />
              </div>
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'panel-glass'}`}>
                  {msg.role === 'assistant' && msg.data ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-semibold text-foreground">{msg.data.term}</h4>
                        {ttsSupported && (
                          <button
                            onClick={() => handleSpeak(msg.id, msg.data)}
                            className={`p-1.5 rounded-md transition-colors shrink-0 ${
                              speakingMsgId === msg.id
                                ? 'bg-primary/20 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                            title={speakingMsgId === msg.id ? t('stopReading') : t('readAloud')}
                          >
                            {speakingMsgId === msg.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          📖 {t('definition')}
                        </span>
                        <p className="text-sm text-foreground mt-1">{msg.data.formalDefinition}</p>
                      </div>
                      <div className="flex items-start gap-2 rounded-md px-3 py-2.5 bg-warning/10 border border-warning/20">
                        <span className="text-base leading-none mt-0.5">💡</span>
                        <p className="text-sm italic text-foreground/90">{msg.data.simpleExplanation}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          📘 {t('example')}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">{msg.data.example}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        🔗 {t('source')}: {msg.data.source}
                      </div>
                      {msg.data.relatedTerms.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            🔍 {t('relatedTerms')}
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {msg.data.relatedTerms.map((rt) => (
                              <button key={rt} onClick={() => handleSend(rt)}
                                className="px-2.5 py-1 bg-secondary text-xs text-foreground rounded-md hover:bg-primary/20 hover:text-primary transition-colors">
                                {rt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <span className="text-[10px] text-muted-foreground">{t('wasHelpful')}</span>
                        <button onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1 rounded transition-colors ${msg.feedback === 'up' ? 'bg-gain/20 text-gain' : 'text-muted-foreground hover:text-foreground'}`}>
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleFeedback(msg.id, 'down')}
                          className={`p-1 rounded transition-colors ${msg.feedback === 'down' ? 'bg-loss/20 text-loss' : 'text-muted-foreground hover:text-foreground'}`}>
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        {msg.feedback === 'up' && <span className="text-[10px] text-gain">{t('thanks')}</span>}
                        {msg.feedback === 'down' && <span className="text-[10px] text-loss">{t('noted')}</span>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-foreground whitespace-pre-line">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="panel-glass px-4 py-3 text-sm text-muted-foreground">
                  {t('aiGenerating')}
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested terms */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">English:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_EN.map((term) => (
                    <button key={term} onClick={() => handleSend(term)}
                      className="px-3 py-1.5 bg-secondary text-xs font-mono text-foreground rounded-md hover:bg-primary/20 hover:text-primary transition-colors">
                      {term}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">中文：</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_ZH.map((term) => (
                    <button key={term} onClick={() => handleSend(term)}
                      className="px-3 py-1.5 bg-secondary text-xs text-foreground rounded-md hover:bg-primary/20 hover:text-primary transition-colors">
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-4">
            {listening && (
              <div className="flex items-center gap-2 mb-2 text-xs text-primary animate-pulse">
                <Mic className="h-3.5 w-3.5" />
                {t('listening')}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('inputPlaceholder')}
                className="flex-1 bg-secondary text-foreground text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
              <button
                onClick={handleMicClick}
                className={`px-3 py-2.5 rounded-lg transition-colors ${
                  listening
                    ? 'bg-loss/20 text-loss hover:bg-loss/30'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
                title={listening ? t('stopReading') : t('readAloud')}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button onClick={() => handleSend()} disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent terms sidebar */}
        {recentTerms.length > 0 && (
          <aside className="w-56 border-l border-border bg-card/30 p-4 hidden lg:block">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {t('recentQueries')}
            </h3>
            <div className="space-y-1.5">
              {recentTerms.map((term) => (
                <button key={term} onClick={() => handleSend(term)}
                  className="w-full text-left text-sm text-foreground px-2.5 py-1.5 rounded-md hover:bg-secondary transition-colors flex items-center gap-2">
                  <Tag className="h-3 w-3 text-primary shrink-0" />
                  {term}
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
      
    </AppLayout>
  );
};

export default QAPage;

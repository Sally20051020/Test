import type { ResolvedTermExplanation } from '@/types/terminology';
import type { Language } from '@/i18n/translations';
import { supabase } from '@/integrations/supabase/client';

type EdgeLang = 'en' | 'zh' | 'zh-TW';

function toEdgeLang(lang: Language): EdgeLang {
  return lang as EdgeLang;
}

export async function fetchTermExplanation(term: string, langOverride?: Language): Promise<ResolvedTermExplanation> {
  const lang = toEdgeLang(langOverride ?? 'en');

  try {
    const { data, error } = await supabase.functions.invoke('explain-term', {
      body: { term: term.trim(), lang },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (data?.error) {
      console.error('AI error:', data.error);
      throw new Error(data.error);
    }

    return {
      term: data.term ?? term,
      formalDefinition: data.formalDefinition ?? '',
      simpleExplanation: data.simpleExplanation ?? '',
      example: data.example ?? '',
      source: data.source ?? (lang === 'zh' ? 'AI 生成，僅供參考' : 'AI-generated, for reference only'),
      relatedTerms: Array.isArray(data.relatedTerms) ? data.relatedTerms : [],
    };
  } catch (err) {
    console.warn('Falling back to basic explanation:', err);
    return getFallback(term, lang);
  }
}

function getFallback(term: string, lang: EdgeLang): ResolvedTermExplanation {
  if (lang === 'zh') {
    return {
      term,
      formalDefinition: `${term}是一个金融概念或指标，用于评估证券、风险或衡量表现。目前 AI 服务暂时不可用，请稍后重试。`,
      simpleExplanation: '简单来说：这是一个帮助投资者做决定的工具或数字。',
      example: `在分析港股时，${term}帮助投资者评估是否应该买入、卖出或持有。`,
      source: 'AI 服务暂时不可用',
      relatedTerms: ['市盈率', '市值', '股息'],
    };
  }
  if (lang === 'zh-TW') {
    return {
      term,
      formalDefinition: `${term}是一個金融概念或指標，用於評估證券、風險或衡量表現。目前 AI 服務暫時不可用，請稍後重試。`,
      simpleExplanation: '簡單來說：這是一個幫助投資者做決定的工具或數字。',
      example: `在分析港股時，${term}幫助投資者評估是否應該買入、賣出或持有。`,
      source: 'AI 服務暫時不可用',
      relatedTerms: ['市盈率', '市值', '股息'],
    };
  }
  return {
    term,
    formalDefinition: `${term} is a financial concept or metric used in capital markets. The AI service is temporarily unavailable — please try again later.`,
    simpleExplanation: "In simple words: it's a tool or number that helps investors make decisions.",
    example: `When analysing stocks, ${term} helps investors evaluate opportunities.`,
    source: 'AI service temporarily unavailable',
    relatedTerms: ['P/E ratio', 'market cap', 'dividend'],
  };
}

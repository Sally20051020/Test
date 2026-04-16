export type Lang = 'en' | 'zh' | 'zh-TW';

export interface BilingualText {
  en: string;
  zh: string;
}

export interface TermExplanation {
  term: BilingualText;
  formalDefinition: BilingualText;
  simpleExplanation: BilingualText;
  example: BilingualText;
  source: BilingualText;
  relatedTerms: { en: string[]; zh: string[] };
}

/** Resolved single-language version for display */
export interface ResolvedTermExplanation {
  term: string;
  formalDefinition: string;
  simpleExplanation: string;
  example: string;
  source: string;
  relatedTerms: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: ResolvedTermExplanation;
  lang?: Lang;
  feedback?: 'up' | 'down' | null;
}

/** Detect if input contains Chinese characters */
export function detectLang(text: string): Lang {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text) ? 'zh' : 'en';
}

/** Resolve bilingual term to a single language */
export function resolveTerm(term: TermExplanation, lang: Lang): ResolvedTermExplanation {
  return {
    term: term.term[lang],
    formalDefinition: term.formalDefinition[lang],
    simpleExplanation: term.simpleExplanation[lang],
    example: term.example[lang],
    source: term.source[lang],
    relatedTerms: term.relatedTerms[lang],
  };
}

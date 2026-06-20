import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Lang = 'zh' | 'en';

type Dict = Record<string, string>;

const cache: Record<Lang, Dict> = { zh: {} };

export function tr(key: string, dict: Dict): string {
  return dict[key] ?? key;
}

async function loadLang(lang: Lang): Promise<Dict> {
  if (cache[lang]) return cache[lang];
  try {
    const mod = await import(`../lang/${lang}.json`);
    cache[lang] = mod.default;
    return cache[lang];
  } catch {
    return {};
  }
}

export interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'zh',
  setLang: () => {},
  t: (k: string) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'zh';
    return (localStorage.getItem('lang') === 'en' ? 'en' : 'zh') as Lang;
  });
  const [dict, setDict] = useState<Dict>({});

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    if (l === 'zh') { setDict({}); return; }
    loadLang(l).then(d => setDict(d));
  }, []);

  React.useEffect(() => {
    if (lang !== 'zh') loadLang(lang).then(d => setDict(d));
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    if (lang === 'zh') return key;
    let val = dict[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  }, [lang, dict]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

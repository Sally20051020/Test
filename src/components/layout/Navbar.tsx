import { Globe, User, LogOut, MessageSquare, LineChart, BarChart3, ChevronDown } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useRef, useEffect } from 'react';
import type { Language } from '@/i18n/translations';

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '简体' },
  { value: 'zh-TW', label: '繁體' },
];

export function Navbar() {
  const { username, language, setLanguage, logout } = useUserStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentLabel = LANG_OPTIONS.find((o) => o.value === language)?.label ?? 'EN';

  const navItems = [
    { to: '/qa', label: t('qa'), icon: MessageSquare },
    { to: '/trading', label: t('trading'), icon: LineChart },
    { to: '/analysis', label: t('analysis'), icon: BarChart3 },
  ];

  return (
    <header className="h-14 border-b border-border bg-card/90 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-mono">RF</span>
          </div>
          <h1 className="text-foreground font-semibold text-lg tracking-tight hidden sm:block">
            {t('appName')} <span className="text-primary">{t('appNameHighlight')}</span>
          </h1>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Language dropdown */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">{currentLabel}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-28 rounded-md border border-border bg-card shadow-lg z-50 py-1">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setLanguage(opt.value); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                    language === opt.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm text-foreground hidden sm:inline">{username}</span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={t('logout')}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

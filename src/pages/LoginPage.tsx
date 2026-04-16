import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { LogIn, UserPlus, Zap, Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Language } from '@/i18n/translations';

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '简体' },
  { value: 'zh-TW', label: '繁體' },
];

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginAsGuest, language, setLanguage } = useUserStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(t('fieldsRequired'));
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    login(email);
    navigate('/qa');
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/qa');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Language switcher - top right */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-secondary rounded-lg p-1">
        {LANG_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLanguage(opt.value)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              language === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary mb-4">
            <span className="text-primary-foreground font-bold text-xl font-mono">RF</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t('loginTitle')}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {t('loginSubtitle')}
          </p>
        </div>

        <div className="panel-glass p-6">
          <div className="flex mb-6 rounded-lg bg-secondary p-1">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                !isRegister ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn className="h-4 w-4 inline mr-1.5" />
              {t('loginTab')}
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                isRegister ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="h-4 w-4 inline mr-1.5" />
              {t('registerTab')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full bg-secondary text-foreground text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full bg-secondary text-foreground text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>
            {isRegister && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('confirmPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full bg-secondary text-foreground text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-loss">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {isRegister ? t('registerBtn') : t('loginBtn')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
            </div>
          </div>

          <button
            onClick={handleGuest}
            className="w-full py-2.5 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4 text-warning" />
            {t('guestBtn')}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-2">{t('guestDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, login, register } from '../api/auth.api';
import { saveToken } from '../helpers/auth';
import { useAuth } from '../state/auth';
import type { UserRole } from '../types/user';

function validatePassword(pw: string) {
  const minLen = pw.length >= 8;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSymbol = /[^\w\s]/.test(pw);
  return { minLen, hasLower, hasUpper, hasNumber, hasSymbol };
}

const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // register
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [registerAttempted, setRegisterAttempted] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [pw2Touched, setPw2Touched] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const passwordChecks = useMemo(() => validatePassword(regPassword), [regPassword]);
  const passwordIssues = useMemo(() => {
    const issues: string[] = [];
    if (!passwordChecks.minLen) issues.push('en az 8 karakter');
    if (!passwordChecks.hasUpper) issues.push('büyük harf');
    if (!passwordChecks.hasLower) issues.push('küçük harf');
    if (!passwordChecks.hasNumber) issues.push('rakam');
    if (!passwordChecks.hasSymbol) issues.push('özel karakter (örn: !?@)');
    return issues;
  }, [passwordChecks]);

  const doLogin = async (creds: { email: string; password: string }) => {
    const res = await login(creds);
    saveToken(res.access_token);
    const me = await getMe();
    setUser(me);
    if (me.role === 'admin') navigate('/admin', { replace: true });
    else navigate('/', { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await doLogin({ email, password });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.toString?.() ||
        'Giriş başarısız (sunucu hatası / CORS / yanlış bilgi)';
      setError(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canRegister =
    name.trim().length > 1 &&
    regEmail.trim().length > 3 &&
    regPassword === regPassword2 &&
    passwordChecks.minLen &&
    passwordChecks.hasLower &&
    passwordChecks.hasUpper &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSymbol;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegisterAttempted(true);
    if (!canRegister) {
      const msgs: string[] = [];
      if (name.trim().length <= 1) msgs.push('İsim zorunlu.');
      if (regEmail.trim().length <= 3) msgs.push('Email zorunlu.');
      if (passwordIssues.length) msgs.push(`Şifre eksik: ${passwordIssues.join(', ')}.`);
      if (!regPassword2.trim()) msgs.push('Şifreyi tekrar girmen gerekiyor.');
      if (regPassword2.trim() && regPassword !== regPassword2) msgs.push('Şifreler eşleşmiyor.');
      setError(msgs.join(' '));
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        email: regEmail.trim(),
        password: regPassword,
        name: name.trim(),
        role,
      });
      // kayıt sonrası otomatik login
      await doLogin({ email: regEmail.trim(), password: regPassword });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message?.toString?.() ||
        'Kayıt başarısız (sunucu hatası / CORS / yanlış bilgi)';
      setError(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pageCenter">
      <div className="card" style={{ width: '100%', maxWidth: 440 }}>
        <div className="stack">
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={mode === 'login' ? 'button' : 'button buttonSecondary'}
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setRegisterAttempted(false);
              }}
              style={{ flex: 1 }}
            >
              Giriş Yap
            </button>
            <button
              className={mode === 'register' ? 'button' : 'button buttonSecondary'}
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setRegisterAttempted(false);
              }}
              style={{ flex: 1 }}
            >
              Kayıt Ol
            </button>
          </div>

          {mode === 'login' ? (
            <>
              <div>
                <div className="pageTitle" style={{ marginTop: 0 }}>
                  Giriş Yap
                </div>
                <div className="muted">E-posta ve şifrenle giriş yap.</div>
              </div>

              <form onSubmit={handleLogin} className="stack">
                <input
                  className="input"
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />

                <input
                  className="input"
                  type="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                <button className="button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div>
                <div className="pageTitle" style={{ marginTop: 0 }}>
                  Kayıt Ol
                </div>
              </div>

              <form onSubmit={handleRegister} className="stack">
                <input
                  className="input"
                  placeholder="Ad Soyad"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  autoComplete="name"
                />

                <select
                  className="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="user">kullanıcı</option>
                  <option value="admin">yönetici</option>
                </select>

                <input
                  className="input"
                  type="email"
                  placeholder="E-posta"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setError('');
                  }}
                  autoComplete="email"
                />

                <div className="stack" style={{ gap: 6 }}>
                  <input
                    className="input"
                    type="password"
                    placeholder="Şifre"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setError('');
                    }}
                    onBlur={() => setPwTouched(true)}
                    autoComplete="new-password"
                  />
                  {(pwTouched || registerAttempted || regPassword.length > 0) && passwordIssues.length > 0 && (
                    <div className="muted" style={{ fontSize: 12 }}>
                      Şifre eksik: {passwordIssues.join(', ')}.
                    </div>
                  )}
                </div>

                <div className="stack" style={{ gap: 6 }}>
                  <input
                    className="input"
                    type="password"
                    placeholder="Şifre (tekrar)"
                    value={regPassword2}
                    onChange={(e) => {
                      setRegPassword2(e.target.value);
                      setError('');
                    }}
                    onBlur={() => setPw2Touched(true)}
                    autoComplete="new-password"
                  />
                  {(pw2Touched || registerAttempted) && !regPassword2.trim() && (
                    <div className="muted" style={{ fontSize: 12 }}>
                      Şifreyi tekrar girmen gerekiyor.
                    </div>
                  )}
                  {(pw2Touched || registerAttempted) && regPassword2.trim() && regPassword !== regPassword2 && (
                    <div className="muted" style={{ fontSize: 12 }}>
                      Şifreler eşleşmiyor.
                    </div>
                  )}
                </div>

                <button className="button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Kayıt yapılıyor…' : 'Kayıt Ol'}
                </button>
              </form>
            </>
          )}

          {error && (
            <div className="card" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
              <div style={{ fontWeight: 650, marginBottom: 4 }}>Hata</div>
              <div className="muted">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

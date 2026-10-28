import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  User,
  GraduationCap,
} from 'lucide-react';
import { UserAuth, UserAccount, WaliKelas } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserAuth) => void;
  logoSekolah: string;
  namaSekolah: string;
  npsn: string;
  waliKelasList: WaliKelas[];
  userAccounts?: UserAccount[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  logoSekolah,
  namaSekolah,
  npsn,
  waliKelasList,
  userAccounts = [],
}) => {
  // Empty inputs with transparent default "12345" placeholder
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      // Get all available accounts from props or localStorage
      let accounts: UserAccount[] = userAccounts;
      if (!accounts || accounts.length === 0) {
        const saved = localStorage.getItem('smpn18_users');
        if (saved) {
          try {
            accounts = JSON.parse(saved);
          } catch (err) {
            console.error(err);
          }
        }
      }

      const inputId = identifier.trim();
      const inputPwd = password.trim();

      // If user enters nothing or enters 12345, default to 12345 (Admin/Operator)
      const isDefault = (!inputId && !inputPwd) || (inputId === '12345' && (!inputPwd || inputPwd === '12345'));

      if (isDefault) {
        // Find default admin account if available
        const defaultAdmin = accounts?.find(
          (u) => u.username === '12345' || u.role === 'Admin'
        );

        const user: UserAuth = {
          nama: defaultAdmin?.nama || 'Nuryaman, S.Pd.',
          email: defaultAdmin?.email || 'admin@smpn18.sch.id',
          role: defaultAdmin?.role || 'Admin',
          loginAt: new Date().toISOString(),
        };

        if (rememberMe) {
          localStorage.setItem('smpn18_auth_user', JSON.stringify(user));
        }
        setIsLoading(false);
        onLoginSuccess(user);
        return;
      }

      // Check against registered accounts in userAccounts
      const matchedAccount = accounts?.find(
        (u) =>
          u.username.toLowerCase() === inputId.toLowerCase() ||
          (u.email && u.email.toLowerCase() === inputId.toLowerCase()) ||
          (u.nip && u.nip === inputId)
      );

      if (matchedAccount) {
        // Verify password if provided
        if (inputPwd && inputPwd !== matchedAccount.password) {
          setIsLoading(false);
          setErrorMessage('Kata sandi yang Anda masukkan salah.');
          return;
        }

        const user: UserAuth = {
          nama: matchedAccount.nama,
          email: matchedAccount.email || `${matchedAccount.username}@smpn18.sch.id`,
          role: matchedAccount.role,
          nip: matchedAccount.nip,
          kelasAjar: matchedAccount.kelasAjar,
          loginAt: new Date().toISOString(),
        };

        if (rememberMe) {
          localStorage.setItem('smpn18_auth_user', JSON.stringify(user));
        }
        setIsLoading(false);
        onLoginSuccess(user);
        return;
      }

      // Fallback matching for generic inputs
      const idLower = inputId.toLowerCase();
      if (idLower.includes('admin') || idLower.includes('operator')) {
        const user: UserAuth = {
          nama: 'Nuryaman, S.Pd.',
          email: inputId,
          role: 'Admin',
          loginAt: new Date().toISOString(),
        };
        if (rememberMe) {
          localStorage.setItem('smpn18_auth_user', JSON.stringify(user));
        }
        setIsLoading(false);
        onLoginSuccess(user);
        return;
      }

      if (idLower.includes('kepsek') || idLower.includes('mulyadi') || idLower.includes('lina')) {
        const user: UserAuth = {
          nama: 'Drs. H. Mulyadi, M.Pd.',
          email: inputId,
          role: 'Kepala Sekolah',
          loginAt: new Date().toISOString(),
        };
        if (rememberMe) {
          localStorage.setItem('smpn18_auth_user', JSON.stringify(user));
        }
        setIsLoading(false);
        onLoginSuccess(user);
        return;
      }

      // Fallback match Wali Kelas / Guru
      const matchedTeacher = waliKelasList.find(
        (w) =>
          w.nip === inputId ||
          w.nama.toLowerCase().includes(idLower) ||
          idLower.includes(w.nama.toLowerCase().split(' ')[0].toLowerCase())
      );

      if (matchedTeacher || idLower.includes('guru')) {
        const teacherData = matchedTeacher || waliKelasList[0] || {
          kelas: 'VII-A',
          nama: 'Siti Aminah, S.Pd.',
          nip: '198201052009022003',
        };

        const user: UserAuth = {
          nama: teacherData.nama,
          email: inputId.includes('@') ? inputId : `${teacherData.nip}@guru.smp.belajar.id`,
          role: 'Guru',
          nip: teacherData.nip,
          kelasAjar: teacherData.kelas,
          loginAt: new Date().toISOString(),
        };

        if (rememberMe) {
          localStorage.setItem('smpn18_auth_user', JSON.stringify(user));
        }
        setIsLoading(false);
        onLoginSuccess(user);
        return;
      }

      // Account not found
      setIsLoading(false);
      setErrorMessage(
        'Akun tidak ditemukan. Gunakan username/password default 12345 atau hubungi Administrator.'
      );
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Rings & Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] right-[20%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md bg-slate-950/40">
        <div className="flex items-center space-x-3.5">
          {/* Only School Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-600/30 shrink-0">
            {logoSekolah ? (
              <img src={logoSekolah} alt="Logo Sekolah" className="w-full h-full object-contain rounded-[10px]" />
            ) : (
              <div className="w-full h-full bg-blue-900 rounded-[10px] flex items-center justify-center font-black text-sm">
                18
              </div>
            )}
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white leading-tight">
              {namaSekolah || 'SMP NEGERI 18 JAKARTA'}
            </h1>
            <p className="text-[11px] text-blue-400 font-medium">
              Sistem Informasi Data Siswa Form 8355 & Buku Induk
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-1.5 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300">Sistem Aktif</span>
          </div>
          <span className="text-slate-600">•</span>
          <span>NPSN: <span className="text-white font-mono font-bold">{npsn || '20100123'}</span></span>
        </div>
      </header>

      {/* Center Auth Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/60 p-6 sm:p-8 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500" />

          {/* School Logo Header inside Card */}
          <div className="flex items-center justify-center mb-5 pt-2">
            <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-2xl border border-white/20 p-2 shadow-lg shadow-blue-500/10">
              {logoSekolah ? (
                <img src={logoSekolah} alt="Logo Sekolah" className="h-full w-auto object-contain" />
              ) : (
                <GraduationCap className="w-8 h-8 text-blue-400" />
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Sistem Buku Induk & Form 8355
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Login Aplikasi 8355
            </h2>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <span className="font-bold shrink-0">•</span>
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="12345"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="12345"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Login Aplikasi 8355</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full px-6 py-3 text-center border-t border-slate-800/60 bg-slate-950/60 text-[11px] text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} {namaSekolah || 'SMP Negeri 18 Jakarta'}.
        </p>
      </footer>
    </div>
  );
};

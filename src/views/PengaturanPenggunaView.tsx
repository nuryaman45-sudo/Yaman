import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  GraduationCap,
  Briefcase,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
} from 'lucide-react';
import { UserAccount, WaliKelas } from '../types';

interface PengaturanPenggunaViewProps {
  userAccounts: UserAccount[];
  onSaveUserAccounts: (users: UserAccount[]) => void;
  waliKelasList: WaliKelas[];
}

export const INITIAL_DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin-default',
    nama: 'Nuryaman, S.Pd.',
    username: '12345',
    password: '12345',
    role: 'Admin',
    email: 'admin@smpn18.sch.id',
  },
  {
    id: 'usr-kepsek-default',
    nama: 'Drs. H. Mulyadi, M.Pd.',
    username: 'kepsek18',
    password: '12345',
    role: 'Kepala Sekolah',
    nip: '196803121994031005',
    email: 'kepsek@smpn18.sch.id',
  },
  {
    id: 'usr-guru-default',
    nama: 'Siti Aminah, S.Pd.',
    username: 'guru18',
    password: '12345',
    role: 'Guru',
    nip: '198201052009022003',
    kelasAjar: 'VII-A',
    email: 'siti.aminah@guru.smp.belajar.id',
  },
];

export const PengaturanPenggunaView: React.FC<PengaturanPenggunaViewProps> = ({
  userAccounts,
  onSaveUserAccounts,
  waliKelasList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Admin' | 'Kepala Sekolah' | 'Guru'>('ALL');
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    nama: string;
    username: string;
    password: string;
    role: 'Admin' | 'Kepala Sekolah' | 'Guru';
    nip: string;
    email: string;
    kelasAjar: string;
  }>({
    nama: '',
    username: '',
    password: '12345',
    role: 'Guru',
    nip: '',
    email: '',
    kelasAjar: 'VII-A',
  });

  const [formError, setFormError] = useState('');

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      nama: '',
      username: '',
      password: '12345',
      role: 'Guru',
      nip: '',
      email: '',
      kelasAjar: waliKelasList[0]?.kelas || 'VII-A',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama,
      username: user.username,
      password: user.password,
      role: user.role,
      nip: user.nip || '',
      email: user.email || '',
      kelasAjar: user.kelasAjar || (waliKelasList[0]?.kelas || 'VII-A'),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (user.username === '12345' && userAccounts.filter((u) => u.role === 'Admin').length <= 1) {
      alert('Akun Admin default (12345) tidak dapat dihapus jika hanya tersisa satu akun Admin.');
      return;
    }

    if (window.confirm(`Yakin ingin menghapus akun pengguna "${user.nama}" (${user.username})?`)) {
      const updated = userAccounts.filter((u) => u.id !== user.id);
      onSaveUserAccounts(updated);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Reset daftar pengguna ke akun bawaan (Admin 12345, Kepala Sekolah, dan Guru)?')) {
      onSaveUserAccounts(INITIAL_DEFAULT_USERS);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedUser = formData.username.trim();
    const trimmedNama = formData.nama.trim();
    const trimmedPwd = formData.password.trim();

    if (!trimmedNama) {
      setFormError('Nama lengkap pengguna wajib diisi.');
      return;
    }
    if (!trimmedUser) {
      setFormError('Username wajib diisi.');
      return;
    }
    if (!trimmedPwd) {
      setFormError('Kata sandi wajib diisi.');
      return;
    }

    // Check duplicate username
    const isDuplicate = userAccounts.some(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase() && u.id !== editingUser?.id
    );

    if (isDuplicate) {
      setFormError(`Username "${trimmedUser}" sudah digunakan oleh akun lain.`);
      return;
    }

    if (editingUser) {
      // Update
      const updated = userAccounts.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              nama: trimmedNama,
              username: trimmedUser,
              password: trimmedPwd,
              role: formData.role,
              nip: formData.nip.trim() || undefined,
              email: formData.email.trim() || undefined,
              kelasAjar: formData.role === 'Guru' ? formData.kelasAjar : undefined,
            }
          : u
      );
      onSaveUserAccounts(updated);
    } else {
      // Create new
      const newUser: UserAccount = {
        id: 'usr-' + Date.now(),
        nama: trimmedNama,
        username: trimmedUser,
        password: trimmedPwd,
        role: formData.role,
        nip: formData.nip.trim() || undefined,
        email: formData.email.trim() || undefined,
        kelasAjar: formData.role === 'Guru' ? formData.kelasAjar : undefined,
      };
      onSaveUserAccounts([...userAccounts, newUser]);
    }

    setIsModalOpen(false);
  };

  const filteredUsers = userAccounts.filter((user) => {
    const matchSearch =
      user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nip && user.nip.includes(searchQuery)) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchSearch && matchRole;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Manajemen Akun & Hak Akses</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Data Pengguna Aplikasi Form 8355
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Kelola akun resmi untuk <strong>Admin</strong> (akses penuh), <strong>Kepala Sekolah</strong>, dan <strong>Guru</strong>.
              Akun default sistem: Username <strong>12345</strong> / Password <strong>12345</strong> (Admin).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefault}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              title="Reset ke akun bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-700" />
              <span>Tambah Pengguna</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Akun Admin</p>
              <h3 className="text-lg font-bold text-slate-800">
                {userAccounts.filter((u) => u.role === 'Admin').length} Akun
              </h3>
            </div>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
            Akses Penuh
          </span>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Kepala Sekolah</p>
              <h3 className="text-lg font-bold text-slate-800">
                {userAccounts.filter((u) => u.role === 'Kepala Sekolah').length} Akun
              </h3>
            </div>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
            Monitoring
          </span>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Guru / Wali Kelas</p>
              <h3 className="text-lg font-bold text-slate-800">
                {userAccounts.filter((u) => u.role === 'Guru').length} Akun
              </h3>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
            Presensi & Data
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, username, NIP..."
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-60"
              />
            </div>

            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 text-xs">
              {(['ALL', 'Admin', 'Kepala Sekolah', 'Guru'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    roleFilter === r
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'ALL' ? 'Semua' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800">{filteredUsers.length}</strong> dari {userAccounts.length} pengguna
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Kata Sandi</th>
                <th className="py-3 px-4">Peran (Hak Akses)</th>
                <th className="py-3 px-4">Informasi Tambahan</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isRevealed = !!revealedPasswords[user.id];
                  const isDefaultAdmin = user.username === '12345';

                  return (
                    <tr key={user.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3 px-4 text-center font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user.nama}</span>
                          {isDefaultAdmin && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        {user.email && (
                          <div className="text-[11px] text-slate-400 font-normal">
                            {user.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {user.username}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-slate-800 font-medium">
                            {isRevealed ? user.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                            title={isRevealed ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.role === 'Admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Shield className="w-3 h-3 text-blue-600" />
                            Admin
                          </span>
                        )}
                        {user.role === 'Kepala Sekolah' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Briefcase className="w-3 h-3 text-amber-600" />
                            Kepala Sekolah
                          </span>
                        )}
                        {user.role === 'Guru' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <GraduationCap className="w-3 h-3 text-emerald-600" />
                            Guru
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {user.role === 'Guru' && user.kelasAjar && (
                          <div className="font-semibold text-emerald-700">
                            Wali Kelas: <span className="font-bold">{user.kelasAjar}</span>
                          </div>
                        )}
                        {user.nip && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            NIP: {user.nip}
                          </div>
                        )}
                        {!user.nip && !user.kelasAjar && (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit data pengguna"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Note footer */}
        <div className="p-3 bg-amber-50/50 border-t border-amber-200/60 text-[11px] text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Ketentuan Hak Akses:</strong> Akun berstatus <strong>Admin</strong> memiliki akses penuh mengelola data siswa, mutasi, pengaturan sistem, serta manajemen pengguna. Akun <strong>Kepala Sekolah</strong> dan <strong>Guru</strong> hanya dapat melihat rekapitulasi, cetak form 8355, daftar siswa, dan daftar absen tanpa menu pengaturan dan master siswa.
          </div>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Konfigurasi akun masuk aplikasi Form 8355
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Peran / Role */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Peran Akun (Hak Akses) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Admin', 'Kepala Sekolah', 'Guru'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`py-2 px-3 rounded-xl border font-bold text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        formData.role === r
                          ? r === 'Admin'
                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                            : r === 'Kepala Sekolah'
                            ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r === 'Admin' && <Shield className="w-4 h-4" />}
                      {r === 'Kepala Sekolah' && <Briefcase className="w-4 h-4" />}
                      {r === 'Guru' && <GraduationCap className="w-4 h-4" />}
                      <span>{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Nuryaman, S.Pd."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Masuk *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: 12345 atau nama.user"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Username default: 12345</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kata Sandi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contoh: 12345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Password default: 12345</p>
                </div>
              </div>

              {/* NIP & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIP (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="198201052009022003"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Resmi (Opsional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@guru.smp.belajar.id"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Rombel Ajar (If Guru) */}
              {formData.role === 'Guru' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelas Binaan / Rombel Wali Kelas
                  </label>
                  <select
                    value={formData.kelasAjar}
                    onChange={(e) => setFormData({ ...formData, kelasAjar: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    {waliKelasList.map((w) => (
                      <option key={w.kelas} value={w.kelas}>
                        Kelas {w.kelas} - {w.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan' : 'Buat Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

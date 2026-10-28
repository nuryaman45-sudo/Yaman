import React from 'react';
import {
  Menu,
  LayoutDashboard,
  Settings,
  FolderTree,
  UsersRound,
  CalendarCheck,
  School,
  Image as ImageIcon,
  UserCheck,
  Database,
  Printer,
  Sparkles,
  Calendar,
  ArrowRightLeft,
  Server,
  LogOut,
  Users,
  Cloud,
} from 'lucide-react';
import { ActiveTab, UserAuth } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  totalSiswa: number;
  currentUser?: UserAuth | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  totalSiswa,
  currentUser,
  onLogout,
}) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'dashboard-rekap-gender':
      case 'dashboard-overview':
        return {
          icon: <UsersRound className="w-5 h-5 text-blue-600" />,
          title: 'Rekapitulasi Siswa L/P Per Kelas',
          subtitle: 'Rekapitulasi jumlah siswa laki-laki dan perempuan di setiap rombongan belajar',
        };
      case 'dashboard-rekap-usia':
        return {
          icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
          title: 'Rekapitulasi Kategori Nama dan Usia',
          subtitle: 'Daftar klasifikasi nama, tanggal lahir, dan kelompok umur peserta didik',
        };
      case 'pengaturan-profil':
        return {
          icon: <School className="w-5 h-5 text-amber-500" />,
          title: 'Pengaturan Profil Sekolah',
          subtitle: 'Kustomisasi kop surat, nama instansi, NPSN, dan alamat resmi',
        };
      case 'pengaturan-logo':
        return {
          icon: <ImageIcon className="w-5 h-5 text-amber-500" />,
          title: 'Pengaturan Logo & Identitas',
          subtitle: 'Upload logo Pemprov DKI, logo sekolah, dan logo sidebar',
        };
      case 'pengaturan-penjabat':
        return {
          icon: <UserCheck className="w-5 h-5 text-amber-500" />,
          title: 'Input Data Penjabat & Wali Kelas',
          subtitle: 'Data Kepala Sekolah, Pengawas Pembina, dan daftar rombel wali kelas',
        };
      case 'pengaturan-pengguna':
        return {
          icon: <Users className="w-5 h-5 text-amber-500" />,
          title: 'Data Pengguna & Hak Akses',
          subtitle: 'Kelola akun pengguna: Admin, Kepala Sekolah, dan Guru',
        };
      case 'format-8355-main':
        return {
          icon: <Database className="w-5 h-5 text-emerald-600" />,
          title: 'Master Data Siswa (Buku Induk 8355)',
          subtitle: `Kelola basis data siswa (${totalSiswa} siswa terdaftar)`,
        };
      case 'format-8355-cetak':
        return {
          icon: <Printer className="w-5 h-5 text-emerald-600" />,
          title: 'Form 8355 Cetak (Landscape F4)',
          subtitle: 'Format resmi cetak formulir 8355 lengkap dengan legalitas pengesahan',
        };
      case 'daftar-siswa-main':
        return {
          icon: <UsersRound className="w-5 h-5 text-indigo-600" />,
          title: 'Daftar Siswa (Portrait F4)',
          subtitle: 'Daftar peserta didik bergaris resmi 36 baris untuk absensi & arsip',
        };
      case 'daftar-absen-main':
        return {
          icon: <CalendarCheck className="w-5 h-5 text-teal-600" />,
          title: 'Daftar Absensi Peserta Didik',
          subtitle: 'Format 2 halaman lengkap tanggal 1-31 dan rekapitulasi S/I/A',
        };
      case 'daftar-mutasi-main':
        return {
          icon: <ArrowRightLeft className="w-5 h-5 text-amber-600" />,
          title: 'Daftar & Rekapitulasi Mutasi Siswa',
          subtitle: 'Daftar mutasi masuk/keluar per bulan dan rekapitulasi perubahan jumlah siswa',
        };
      case 'google-drive-sync':
        return {
          icon: <Cloud className="w-5 h-5 text-blue-600" />,
          title: 'Integrasi Google Drive',
          subtitle: 'Sinkronisasi cloud backup basis data & file ekspor SMPN 18 Jakarta',
        };
      default:
        return {
          icon: <LayoutDashboard className="w-5 h-5 text-blue-600" />,
          title: 'Form 8355 - SMPN 18 Jakarta',
          subtitle: 'Sistem Informasi Data Peserta Didik',
        };
    }
  };

  const tabInfo = getTabInfo();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-10 shadow-xs shrink-0 no-print">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg shrink-0">
            {tabInfo.icon}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
              <span>{tabInfo.title}</span>
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {tabInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-1.5 bg-blue-50/80 text-blue-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-blue-200/60 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden md:inline">Tahun Pelajaran:</span>
          <span>T.A 2026/2027</span>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  FolderTree,
  UsersRound,
  CalendarCheck,
  ChevronDown,
  School,
  Image as ImageIcon,
  UserCheck,
  Database,
  Printer,
  Sparkles,
  RotateCw,
  X,
  ArrowRightLeft,
  Server,
  LogOut,
  Users,
  Cloud,
} from 'lucide-react';
import { ActiveTab, ProfilSekolah, UserAuth } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profilSekolah: ProfilSekolah;
  logoSidebar: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onRefreshData: () => void;
  currentUser?: UserAuth | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  profilSekolah,
  logoSidebar,
  isMobileOpen,
  setIsMobileOpen,
  onRefreshData,
  currentUser,
  onLogout,
}) => {
  const roleLower = (currentUser?.role || '').toLowerCase().trim();
  const isRestrictedRole =
    roleLower.includes('guru') ||
    roleLower.includes('kepala') ||
    roleLower.includes('kepsek');

  // Admin dan Operator Dapodik memiliki akses penuh ke Pengaturan, Master Data Siswa, dan Daftar Mutasi
  const isAdmin = !isRestrictedRole;

  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    dashboard: true,
    pengaturan: true,
    format8355: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 h-screen lg:h-full shrink-0 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30 overflow-hidden shrink-0 border border-blue-400/30">
              {logoSidebar ? (
                <img
                  src={logoSidebar}
                  className="w-full h-full object-cover"
                  alt="Sidebar Logo"
                />
              ) : (
                <span className="text-white tracking-tight">18</span>
              )}
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-wide text-slate-100 leading-tight truncate">
                {profilSekolah.sidebarTitle || 'SMPN 18 JAKARTA'}
              </h1>
              <p className="text-[11px] text-blue-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Sistem Data Form 8355
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigasi Utama
          </div>

          {/* Accordion 1: Dashboard */}
          <div className="rounded-xl overflow-hidden border border-slate-800/60 bg-slate-900/40">
            <button
              onClick={() => toggleAccordion('dashboard')}
              className="w-full flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800 text-slate-200 transition text-left"
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-xs tracking-wide">Dashboard</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordions['dashboard'] ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openAccordions['dashboard'] && (
              <div className="bg-slate-950/40 px-3 py-1.5 space-y-1">
                <button
                  onClick={() => handleSelectTab('dashboard-rekap-gender')}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                    activeTab === 'dashboard-rekap-gender' || activeTab === 'dashboard-overview'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UsersRound className="w-3.5 h-3.5 mr-2 text-blue-400 shrink-0" />
                  <span className="truncate">Rekapitulasi L/P Per Kelas</span>
                </button>
                <button
                  onClick={() => handleSelectTab('dashboard-rekap-usia')}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                    activeTab === 'dashboard-rekap-usia'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 mr-2 text-blue-400 shrink-0" />
                  <span className="truncate">Kategori Nama & Usia</span>
                </button>
              </div>
            )}
          </div>

          {/* Accordion 2: Pengaturan (Khusus Admin / Operator) */}
          {isAdmin && (
            <div className="rounded-xl overflow-hidden border border-slate-800/60 bg-slate-900/40">
              <button
                onClick={() => toggleAccordion('pengaturan')}
                className="w-full flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800 text-slate-200 transition text-left"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-xs tracking-wide">Pengaturan</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openAccordions['pengaturan'] ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordions['pengaturan'] && (
                <div className="bg-slate-950/40 px-3 py-1.5 space-y-1">
                  <button
                    onClick={() => handleSelectTab('pengaturan-profil')}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                      activeTab === 'pengaturan-profil'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <School className="w-3.5 h-3.5 mr-2 text-amber-400" />
                    Profil Sekolah
                  </button>
                  <button
                    onClick={() => handleSelectTab('pengaturan-logo')}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                      activeTab === 'pengaturan-logo'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-2 text-amber-400" />
                    Upload Logo
                  </button>
                  <button
                    onClick={() => handleSelectTab('pengaturan-penjabat')}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                      activeTab === 'pengaturan-penjabat'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-2 text-amber-400" />
                    Input Data Penjabat
                  </button>
                  <button
                    onClick={() => handleSelectTab('pengaturan-pengguna')}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                      activeTab === 'pengaturan-pengguna'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 mr-2 text-amber-400" />
                    Data Pengguna
                  </button>
                  <button
                    onClick={() => handleSelectTab('google-drive-sync')}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                      activeTab === 'google-drive-sync'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5 mr-2 text-blue-400" />
                    Integrasi Google Drive
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Accordion 3: Format 8355 */}
          <div className="rounded-xl overflow-hidden border border-slate-800/60 bg-slate-900/40">
            <button
              onClick={() => toggleAccordion('format8355')}
              className="w-full flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800 text-slate-200 transition text-left"
            >
              <div className="flex items-center space-x-3">
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs tracking-wide">Format 8355</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openAccordions['format8355'] ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openAccordions['format8355'] && (
              <div className="bg-slate-950/40 px-3 py-1.5 space-y-1">
                {/* Sub menu Master Data Siswa khusus Admin / Operator */}
                {isAdmin && (
                  <button
                    onClick={() => handleSelectTab('format-8355-main')}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                      activeTab === 'format-8355-main'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                    Master Data Siswa
                  </button>
                )}
                <button
                  onClick={() => handleSelectTab('format-8355-cetak')}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium flex items-center transition ${
                    activeTab === 'format-8355-cetak'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                  Form 8355 Cetak
                </button>
              </div>
            )}
          </div>

          {/* Single Item: Daftar Siswa */}
          <div className="rounded-xl overflow-hidden border border-slate-800/60">
            <button
              onClick={() => handleSelectTab('daftar-siswa-main')}
              className={`w-full flex items-center justify-between p-3 transition text-left ${
                activeTab === 'daftar-siswa-main'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <UsersRound className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-xs tracking-wide">Daftar Siswa</span>
              </div>
            </button>
          </div>

          {/* Single Item: Daftar Absen */}
          <div className="rounded-xl overflow-hidden border border-slate-800/60">
            <button
              onClick={() => handleSelectTab('daftar-absen-main')}
              className={`w-full flex items-center justify-between p-3 transition text-left ${
                activeTab === 'daftar-absen-main'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CalendarCheck className="w-4 h-4 text-teal-400" />
                <span className="font-semibold text-xs tracking-wide">Daftar Absen</span>
              </div>
            </button>
          </div>

          {/* Single Item: Daftar Mutasi (Khusus Admin / Operator) */}
          {isAdmin && (
            <div className="rounded-xl overflow-hidden border border-slate-800/60">
              <button
                onClick={() => handleSelectTab('daftar-mutasi-main')}
                className={`w-full flex items-center justify-between p-3 transition text-left ${
                  activeTab === 'daftar-mutasi-main'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-xs tracking-wide">Daftar Mutasi</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute bottom-0 right-0 border-2 border-slate-950" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">
                {currentUser?.nama || 'Nuryaman, S.Pd.'}
              </h4>
              <span className="text-[10px] text-blue-400 block truncate font-medium">
                {currentUser?.role || 'Operator Dapodik'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={onRefreshData}
              title="Refresh & Perbarui Data"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar dari Sistem (Logout)"
                className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

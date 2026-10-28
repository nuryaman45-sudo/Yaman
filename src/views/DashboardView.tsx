import React from 'react';
import {
  Users,
  UserCheck,
  ArrowRightLeft,
  GraduationCap,
  Plus,
  Printer,
  CalendarCheck,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Siswa, WaliKelas, ActiveTab } from '../types';

interface DashboardViewProps {
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
  onOpenAddModal: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  siswaList,
  waliKelasList,
  onOpenAddModal,
  onNavigate,
}) => {
  const total = siswaList.length;
  const laki = siswaList.filter((s) => s.jk === 'L').length;
  const perempuan = siswaList.filter((s) => s.jk === 'P').length;
  const lakiPct = total > 0 ? Math.round((laki / total) * 100) : 0;
  const perempuanPct = total > 0 ? 100 - lakiPct : 0;

  // Breakdown by rombel
  const classes = Array.from(new Set(siswaList.map((s) => s.kelas))).sort();
  const rombelCounts = classes.map((k) => ({
    kelas: k,
    count: siswaList.filter((s) => s.kelas === k).length,
    laki: siswaList.filter((s) => s.kelas === k && s.jk === 'L').length,
    perempuan: siswaList.filter((s) => s.kelas === k && s.jk === 'P').length,
  }));

  const maxRombelCount = Math.max(...rombelCounts.map((r) => r.count), 1);

  // Breakdown by agama
  const agamaCounts = ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map((a) => ({
    agama: a,
    count: siswaList.filter((s) => s.agama === a).length,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Sistem Buku Induk & Arsip Resmi SMPN 18 Jakarta
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Data Pokok Pendidikan & Formulir 8355
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Pengelolaan master data peserta didik terintegrasi, cetak dokumen resmi F4 Legal landscape & portrait, serta absensi bulanan otomatis.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
            <button
              onClick={() => onNavigate('format-8355-cetak')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-xs transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak 8355</span>
            </button>
          </div>
        </div>
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Peserta Didik</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{total}</h3>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Terintegrasi Realtime 8355
              </span>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Gender (L / P)</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                <span className="text-blue-600">{laki}</span> / <span className="text-pink-600">{perempuan}</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                {lakiPct}% Laki-laki • {perempuanPct}% Perempuan
              </span>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Rombel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Rombongan Belajar</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{waliKelasList.length} Rombel</h3>
              <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">
                Wali Kelas Terkonfigurasi
              </span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Mutasi Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Siswa Mutasi</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">0</h3>
              <span className="text-[11px] text-amber-600 font-medium mt-1 inline-block">
                Status Terdaftar Aktif
              </span>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi Siswa Per Rombel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Distribusi Siswa Per Rombel / Kelas
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Jumlah siswa aktif di tiap kelas</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              {classes.length} Rombel Terisi
            </span>
          </div>

          {rombelCounts.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400 text-xs">
              Belum ada data siswa per kelas.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {rombelCounts.map((item) => {
                const pct = Math.round((item.count / maxRombelCount) * 100);
                return (
                  <div key={item.kelas} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">Kelas {item.kelas}</span>
                      <span className="text-slate-600">
                        {item.count} Siswa ({item.laki} L, {item.perempuan} P)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full rounded-l-full transition-all duration-500"
                        style={{ width: `${(item.laki / (item.count || 1)) * pct}%` }}
                        title={`Laki-laki: ${item.laki}`}
                      />
                      <div
                        className="bg-pink-500 h-full rounded-r-full transition-all duration-500"
                        style={{ width: `${(item.perempuan / (item.count || 1)) * pct}%` }}
                        title={`Perempuan: ${item.perempuan}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Proporsi Gender & Agama */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Proporsi Gender
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Komposisi laki-laki dan perempuan</p>
          </div>

          {/* Clean Donut Graphic */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-pink-500"
                  strokeWidth="4"
                  strokeDasharray="100 100"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-blue-600"
                  strokeWidth="4"
                  strokeDasharray={`${lakiPct} 100`}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-800">{total}</span>
                <span className="text-[10px] text-slate-400 block font-medium">Siswa</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full text-center">
              <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-700 block">Laki-Laki</span>
                <span className="text-base font-black text-blue-900">{laki}</span>
                <span className="text-[10px] text-blue-500 block font-medium">{lakiPct}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-pink-50/80 border border-pink-100">
                <span className="text-[11px] font-semibold text-pink-700 block">Perempuan</span>
                <span className="text-base font-black text-pink-900">{perempuan}</span>
                <span className="text-[10px] text-pink-500 block font-medium">{perempuanPct}%</span>
              </div>
            </div>
          </div>

          {/* Agama Breakdown */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2">Sebaran Agama Siswa:</span>
            <div className="flex flex-wrap gap-1.5">
              {agamaCounts
                .filter((a) => a.count > 0)
                .map((a) => (
                  <span
                    key={a.agama}
                    className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium border border-slate-200"
                  >
                    {a.agama}: <b className="text-slate-900">{a.count}</b>
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('format-8355-cetak')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition text-left group flex items-start space-x-3.5"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-xs">Cetak Formulir 8355</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Format F4 Landscape resmi dengan tanda tangan Pengawas & KS
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('daftar-siswa-main')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-500 hover:shadow-md transition text-left group flex items-start space-x-3.5"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-xs">Cetak Daftar Siswa</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Format F4 Portrait 36 baris bergaris untuk arsip dan pengesahan wali kelas
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('daftar-absen-main')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-500 hover:shadow-md transition text-left group flex items-start space-x-3.5"
        >
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-xs">Cetak Daftar Absensi</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Format 2 halaman lengkap per tanggal bulan berjalan & rekap presensi
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  UserCheck,
  FileSpreadsheet,
  FileDown,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Siswa, WaliKelas, ProfilSekolah, PenjabatData } from '../types';
import { exportElementToPDF } from '../utils/pdfExport';

interface DashboardRekapGenderViewProps {
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
  profilSekolah: ProfilSekolah;
  penjabatData: PenjabatData;
  logoDki: string;
  logoSekolah: string;
}

export const DashboardRekapGenderView: React.FC<DashboardRekapGenderViewProps> = ({
  siswaList,
  waliKelasList,
  profilSekolah,
  penjabatData,
  logoDki,
  logoSekolah,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const totalSiswa = siswaList.length;
  const totalLaki = siswaList.filter((s) => s.jk === 'L').length;
  const totalPerempuan = siswaList.filter((s) => s.jk === 'P').length;

  const pctLaki = totalSiswa > 0 ? ((totalLaki / totalSiswa) * 100).toFixed(1) : '0';
  const pctPerempuan = totalSiswa > 0 ? ((totalPerempuan / totalSiswa) * 100).toFixed(1) : '0';

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Get distinct classes from waliKelasList or siswaList
  const allClassNames = Array.from(
    new Set([
      ...waliKelasList.map((wk) => wk.kelas),
      ...siswaList.map((s) => s.kelas),
    ])
  ).filter(Boolean).sort();

  const rekapRows = allClassNames.map((kelas, idx) => {
    const wk = waliKelasList.find((w) => w.kelas === kelas);
    const studentsInClass = siswaList.filter((s) => s.kelas === kelas);
    const jmlL = studentsInClass.filter((s) => s.jk === 'L').length;
    const jmlP = studentsInClass.filter((s) => s.jk === 'P').length;
    const jmlTotal = jmlL + jmlP;
    const pctL = jmlTotal > 0 ? ((jmlL / jmlTotal) * 100).toFixed(1) : '0';
    const pctP = jmlTotal > 0 ? ((jmlP / jmlTotal) * 100).toFixed(1) : '0';

    return {
      no: idx + 1,
      kelas,
      waliKelas: wk?.nama || '-',
      nipWaliKelas: wk?.nip || '-',
      jmlL,
      jmlP,
      jmlTotal,
      pctL,
      pctP,
    };
  });

  const handleExportExcel = () => {
    const exportData = rekapRows.map((r) => ({
      'No': r.no,
      'Rombel / Kelas': `Kelas ${r.kelas}`,
      'Nama Wali Kelas': r.waliKelas,
      'NIP Wali Kelas': r.nipWaliKelas,
      'Laki-Laki (L)': r.jmlL,
      'Perempuan (P)': r.jmlP,
      'Total Siswa': r.jmlTotal,
      'Persentase L (%)': `${r.pctL}%`,
      'Persentase P (%)': `${r.pctP}%`,
    }));

    // Add Total Row
    exportData.push({
      'No': 999 as any,
      'Rombel / Kelas': 'TOTAL KESELURUHAN',
      'Nama Wali Kelas': '-',
      'NIP Wali Kelas': '-',
      'Laki-Laki (L)': totalLaki,
      'Perempuan (P)': totalPerempuan,
      'Total Siswa': totalSiswa,
      'Persentase L (%)': `${pctLaki}%`,
      'Persentase P (%)': `${pctPerempuan}%`,
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 30 },
      { wch: 22 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi Gender');
    XLSX.writeFile(wb, 'Rekapitulasi_Jumlah_Siswa_LP_Per_Kelas_SMPN18.xlsx');
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current) return;
    try {
      setIsGeneratingPDF(true);
      await exportElementToPDF(printableRef.current, {
        filename: 'Rekapitulasi_Jumlah_Siswa_LP_Per_Kelas_SMPN18_F4.pdf',
        orientation: 'portrait',
        singlePage: true,
      });
    } catch (err) {
      console.error('Gagal membuat PDF Rekapitulasi L/P:', err);
      alert('Terjadi kendala saat membuat PDF. Anda juga dapat menggunakan tombol Cetak F4.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Toolbar (Hidden when printing) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-800/40 no-print">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Rekapitulasi Data Pokok Rombel SMPN 18 Jakarta
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Rekapitulasi Jumlah Siswa Laki-Laki dan Perempuan Per Kelas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Tabel rekapitulasi komparasi gender putra dan putri untuk setiap rombongan belajar (T.A 2026/2027). Tersedia format unduh dokumen resmi ukuran F4 Portrait.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
              title="Unduh berkas spreadsheet Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
              title="Unduh berkas PDF resmi ukuran F4 Portrait"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Unduh PDF (F4)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards (Hidden when printing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Peserta Didik</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{totalSiswa}</h3>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
                Semua Rombel Terdata
              </span>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Siswa Laki-Laki (L)</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{totalLaki}</h3>
              <span className="text-[11px] text-blue-700 font-medium mt-1 inline-block">
                {pctLaki}% dari total siswa
              </span>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Siswa Perempuan (P)</p>
              <h3 className="text-2xl font-black text-pink-600 mt-1">{totalPerempuan}</h3>
              <span className="text-[11px] text-pink-700 font-medium mt-1 inline-block">
                {pctPerempuan}% dari total siswa
              </span>
            </div>
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Rombongan Belajar</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{allClassNames.length} Rombel</h3>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
                Kelas VII, VIII, & IX
              </span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: 215mm 330mm portrait;
            margin: 8mm 10mm 8mm 10mm;
          }
          #printable-rekap-gender {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
        }
      `}</style>

      {/* Main Printable Document Sheet (F4 Portrait Layout) */}
      <div className="flex justify-center">
        <div
          ref={printableRef}
          id="printable-rekap-gender"
          className="print-container print-portrait-f4 bg-white px-8 sm:px-12 py-8 rounded-2xl border border-slate-200/80 shadow-md space-y-6 text-slate-900 w-full max-w-[950px]"
        >
          {/* Kop Dokumen Resmi */}
          <div className="border-b-4 border-double border-slate-900 pb-3 relative flex items-center justify-between">
            <div className="w-20 shrink-0 flex justify-start items-center">
              {logoDki ? (
                <img
                  src={logoDki}
                  alt="Logo DKI"
                  className="h-16 w-auto object-contain max-w-[75px]"
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-blue-50 rounded-lg text-blue-800 font-bold text-[9px] text-center p-1 border border-dashed border-blue-200 uppercase">
                  Logo DKI
                </div>
              )}
            </div>

            <div className="text-center flex-1 px-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
                {profilSekolah.instansi || 'Pemerintah Provinsi DKI Jakarta'}
              </h2>
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                {profilSekolah.dinas || 'Dinas Pendidikan'}
              </h2>
              <h1 className="text-lg font-black uppercase tracking-wider text-blue-900 mt-0.5">
                {profilSekolah.namaSekolah || 'SMP NEGERI 18 JAKARTA'}
              </h1>
              <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                {profilSekolah.alamat || 'Jl. Menteng Kecil No. 3, Jakarta Pusat'} | NPSN: {profilSekolah.npsn || '20100123'}
              </p>
              <div className="mt-2 border-t border-slate-300 pt-1.5">
                <h3 className="text-xs font-black underline uppercase tracking-wider text-slate-950">
                  REKAPITULASI JUMLAH PESERTA DIDIK MENURUT JENIS KELAMIN PER ROMBEL
                </h3>
                <p className="text-[10px] font-semibold text-slate-700 uppercase">
                  TAHUN PELAJARAN 2026/2027
                </p>
              </div>
            </div>

            <div className="w-20 shrink-0 flex justify-end items-center">
              {logoSekolah ? (
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="h-16 w-auto object-contain max-w-[75px]"
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-indigo-50 rounded-lg text-indigo-800 font-bold text-[9px] text-center p-1 border border-dashed border-indigo-200 uppercase">
                  Logo Sekolah
                </div>
              )}
            </div>
          </div>

          {/* Sub Header Information */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
            <span>Satuan Pendidikan: <span className="text-blue-950 font-black">{profilSekolah.namaSekolah || 'SMPN 18 JAKARTA'}</span></span>
            <span>Total Rombel: <span className="text-blue-950 font-black">{rekapRows.length} KELAS</span></span>
            <span>Total Siswa: <span className="text-blue-950 font-black">{totalSiswa} SISWA</span></span>
          </div>

          {/* Tabel Rekapitulasi Resmi */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-700 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 text-center font-bold text-[10px] uppercase">
                  <th className="border border-slate-700 py-1.5 px-1 w-9">No</th>
                  <th className="border border-slate-700 py-1.5 px-2 w-24">Rombel / Kelas</th>
                  <th className="border border-slate-700 py-1.5 px-2 text-left pl-3">Wali Kelas</th>
                  <th className="border border-slate-700 py-1.5 px-2 w-24 bg-blue-50/60 text-blue-900">Laki-Laki (L)</th>
                  <th className="border border-slate-700 py-1.5 px-2 w-24 bg-pink-50/60 text-pink-900">Perempuan (P)</th>
                  <th className="border border-slate-700 py-1.5 px-2 w-28 bg-slate-100 font-black text-slate-950">Jumlah (L+P)</th>
                  <th className="border border-slate-700 py-1.5 px-2 w-28">Proporsi (% L : % P)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-slate-900">
                {rekapRows.map((row) => (
                  <tr key={row.kelas} className="hover:bg-slate-50 transition">
                    <td className="border border-slate-700 py-1 px-1 text-center font-semibold text-slate-700 text-[10px]">
                      {row.no}
                    </td>
                    <td className="border border-slate-700 py-1 px-2 text-center font-extrabold text-blue-900 uppercase text-[10px]">
                      KELAS {row.kelas}
                    </td>
                    <td className="border border-slate-700 py-1 px-2 pl-3">
                      <p className="font-bold text-slate-900 uppercase text-[10px]">{row.waliKelas}</p>
                      <p className="text-[9.5px] text-slate-600 font-mono">NIP. {row.nipWaliKelas}</p>
                    </td>
                    <td className="border border-slate-700 py-1 px-2 text-center font-black text-blue-900 bg-blue-50/30 text-[10px]">
                      <span>{row.jmlL}</span>
                      <span className="text-[9px] text-blue-700 block font-normal">({row.pctL}%)</span>
                    </td>
                    <td className="border border-slate-700 py-1 px-2 text-center font-black text-pink-900 bg-pink-50/30 text-[10px]">
                      <span>{row.jmlP}</span>
                      <span className="text-[9px] text-pink-700 block font-normal">({row.pctP}%)</span>
                    </td>
                    <td className="border border-slate-700 py-1 px-2 text-center font-black text-slate-950 bg-slate-50 text-xs">
                      {row.jmlTotal}
                    </td>
                    <td className="border border-slate-700 py-1 px-2 text-center font-semibold text-[10px] text-slate-800">
                      {row.pctL}% L : {row.pctP}% P
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Total Footer */}
              <tfoot>
                <tr className="bg-slate-200 font-black text-slate-950 border-t-2 border-slate-800 text-center">
                  <td colSpan={3} className="border border-slate-700 p-2.5 text-right uppercase tracking-wider text-xs">
                    TOTAL KESELURUHAN :
                  </td>
                  <td className="border border-slate-700 p-2.5 text-blue-950 bg-blue-100 font-black text-sm">
                    {totalLaki}
                    <span className="text-[11px] block text-blue-800 font-semibold">({pctLaki}%)</span>
                  </td>
                  <td className="border border-slate-700 p-2.5 text-pink-950 bg-pink-100 font-black text-sm">
                    {totalPerempuan}
                    <span className="text-[11px] block text-pink-800 font-semibold">({pctPerempuan}%)</span>
                  </td>
                  <td className="border border-slate-700 p-2.5 text-slate-950 bg-slate-300 font-black text-base">
                    {totalSiswa}
                  </td>
                  <td className="border border-slate-700 p-2.5 text-xs">
                    {pctLaki}% L : {pctPerempuan}% P
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Official Signatures for F4 Document */}
          <div className="pt-4 flex justify-end text-xs font-semibold text-slate-900 tanda-tangan-block">
            <div className="text-center flex flex-col justify-between h-32 w-64">
              <p className="leading-snug">
                Jakarta, <span>{todayStr}</span><br />
                {penjabatData?.ks?.jabatan || 'Kepala SMPN 18 Jakarta'}
              </p>
              <div className="flex-1 flex items-center justify-center my-0.5">
                {penjabatData?.ks?.ttd ? (
                  <img
                    src={penjabatData.ks.ttd}
                    alt="TTD Kepala Sekolah"
                    className="h-14 max-w-[140px] object-contain"
                  />
                ) : (
                  <div className="h-10" />
                )}
              </div>
              <div>
                <p className="font-bold underline text-slate-950 text-sm uppercase">
                  {penjabatData?.ks?.nama ? penjabatData.ks.nama : '...................................................'}
                </p>
                <p className="text-[11px] font-normal text-slate-700">
                  NIP. {penjabatData?.ks?.nip ? penjabatData.ks.nip : '...................................................'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

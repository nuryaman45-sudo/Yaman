import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  UserCheck,
  Search,
  Filter,
  FileSpreadsheet,
  FileDown,
  Sparkles,
  Cake,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Siswa, WaliKelas, ProfilSekolah, PenjabatData } from '../types';
import { exportElementToPDF } from '../utils/pdfExport';

interface DashboardRekapUsiaViewProps {
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
  profilSekolah: ProfilSekolah;
  penjabatData: PenjabatData;
  logoDki: string;
  logoSekolah: string;
}

export const DashboardRekapUsiaView: React.FC<DashboardRekapUsiaViewProps> = ({
  siswaList,
  waliKelasList,
  profilSekolah,
  penjabatData,
  logoDki,
  logoSekolah,
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [selectedKategoriUsia, setSelectedKategoriUsia] = useState<string>('ALL');
  const [searchNama, setSearchNama] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Calculate age helper relative to today
  const calculateAge = (tglLahirStr: string) => {
    if (!tglLahirStr) return { years: 0, months: 0, text: '-', category: 'Tidak Diketahui' };

    const birthDate = new Date(tglLahirStr);
    const today = new Date();

    if (isNaN(birthDate.getTime())) {
      return { years: 0, months: 0, text: '-', category: 'Tidak Diketahui' };
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    let category = '';
    if (years < 12) {
      category = '< 12 Tahun';
    } else if (years === 12) {
      category = '12 Tahun';
    } else if (years === 13) {
      category = '13 Tahun';
    } else if (years === 14) {
      category = '14 Tahun';
    } else {
      category = '≥ 15 Tahun';
    }

    return {
      years,
      months,
      text: `${years} Th ${months} Bln`,
      category,
    };
  };

  // Enrich students with age
  const enrichedStudents = siswaList.map((s) => {
    const ageInfo = calculateAge(s.tglLahir);
    return {
      ...s,
      ageYears: ageInfo.years,
      ageMonths: ageInfo.months,
      ageText: ageInfo.text,
      ageCategory: ageInfo.category,
    };
  });

  // Overall counts by age category
  const categoriesList = ['< 12 Tahun', '12 Tahun', '13 Tahun', '14 Tahun', '≥ 15 Tahun'];
  const ageCategoryCounts = categoriesList.map((cat) => ({
    category: cat,
    count: enrichedStudents.filter((s) => s.ageCategory === cat).length,
    laki: enrichedStudents.filter((s) => s.ageCategory === cat && s.jk === 'L').length,
    perempuan: enrichedStudents.filter((s) => s.ageCategory === cat && s.jk === 'P').length,
  }));

  // Matrix per class
  const distinctClasses = Array.from(new Set(siswaList.map((s) => s.kelas))).sort();
  const classMatrix = distinctClasses.map((k) => {
    const studentsInClass = enrichedStudents.filter((s) => s.kelas === k);
    const cLess12 = studentsInClass.filter((s) => s.ageCategory === '< 12 Tahun').length;
    const c12 = studentsInClass.filter((s) => s.ageCategory === '12 Tahun').length;
    const c13 = studentsInClass.filter((s) => s.ageCategory === '13 Tahun').length;
    const c14 = studentsInClass.filter((s) => s.ageCategory === '14 Tahun').length;
    const cOver14 = studentsInClass.filter((s) => s.ageCategory === '≥ 15 Tahun').length;
    return {
      kelas: k,
      cLess12,
      c12,
      c13,
      c14,
      cOver14,
      total: studentsInClass.length,
    };
  });

  // Filtered detailed student list
  const filteredStudents = enrichedStudents.filter((s) => {
    const matchKelas = selectedKelas === 'ALL' || s.kelas === selectedKelas;
    const matchKategori = selectedKategoriUsia === 'ALL' || s.ageCategory === selectedKategoriUsia;
    const matchSearch =
      !searchNama ||
      s.nama.toLowerCase().includes(searchNama.toLowerCase().trim()) ||
      s.nis.includes(searchNama.trim());
    return matchKelas && matchKategori && matchSearch;
  });

  const handleExportExcel = () => {
    const exportRows = filteredStudents.map((s, idx) => ({
      'No': idx + 1,
      'Nama Peserta Didik': (s.nama || '').toUpperCase(),
      'Kelas': `Kelas ${s.kelas}`,
      'NIS': s.nis,
      'Jenis Kelamin': s.jk,
      'Tempat Lahir': s.tempatLahir,
      'Tanggal Lahir': s.tglLahir,
      'Usia Siswa': s.ageText,
      'Kategori Usia': s.ageCategory,
      'Nama Orang Tua': s.ortu,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 26 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kategori Usia Siswa');
    XLSX.writeFile(wb, 'Rekapitulasi_Kategori_Nama_dan_Usia_SMPN18.xlsx');
  };

  const handleDownloadPDF = async () => {
    if (!printableRef.current) return;
    try {
      setIsGeneratingPDF(true);
      await exportElementToPDF(printableRef.current, {
        filename: `Rekapitulasi_Kategori_Nama_dan_Usia_${selectedKelas !== 'ALL' ? `Kelas_${selectedKelas}` : 'Semua_Kelas'}_SMPN18_F4.pdf`,
        orientation: 'portrait',
        singlePage: filteredStudents.length <= 40,
      });
    } catch (err) {
      console.error('Gagal membuat PDF Kategori Usia:', err);
      alert('Terjadi kendala saat membuat PDF. Anda juga dapat menggunakan tombol Cetak F4.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Toolbar (Hidden when printing) */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-800/40 no-print">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Klasifikasi Umur & Demografi Peserta Didik
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Rekapitulasi Kategori Nama dan Usia Siswa
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Pemantauan sebaran usia dan kategori rombel peserta didik SMPN 18 Jakarta. Dilengkapi fitur unduh Excel dan unduh PDF resmi ukuran F4 Portrait.
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

      {/* Interactive Age Category Cards (No Print) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 no-print">
        {ageCategoryCounts.map((item) => (
          <div
            key={item.category}
            onClick={() =>
              setSelectedKategoriUsia(
                selectedKategoriUsia === item.category ? 'ALL' : item.category
              )
            }
            className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs ${
              selectedKategoriUsia === item.category
                ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-400'
                : 'bg-white border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 truncate">
                Usia {item.category}
              </span>
              <Cake className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{item.count}</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {item.laki} L • {item.perempuan} P
            </span>
          </div>
        ))}
      </div>

      {/* Screen Interactive Matrix Table (No Print) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden no-print">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
              Sebaran Kelompok Usia per Rombel / Kelas (Matriks Rangkuman)
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Tahun Ajaran 2026/2027
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[10.5px] border-b border-slate-200 text-center">
                <th className="p-2.5 text-left pl-4">Kelas / Rombel</th>
                <th className="p-2.5 bg-amber-50/50">&lt; 12 Th</th>
                <th className="p-2.5 bg-blue-50/50">12 Th</th>
                <th className="p-2.5 bg-indigo-50/50">13 Th</th>
                <th className="p-2.5 bg-emerald-50/50">14 Th</th>
                <th className="p-2.5 bg-purple-50/50">&ge; 15 Th</th>
                <th className="p-2.5 bg-slate-200/70 text-slate-900 font-black">Total Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-center">
              {classMatrix.map((m) => (
                <tr key={m.kelas} className="hover:bg-slate-50/80 transition">
                  <td className="p-2.5 text-left font-bold text-indigo-700 pl-4">
                    Kelas {m.kelas}
                  </td>
                  <td className="p-2.5 font-semibold text-amber-800">{m.cLess12}</td>
                  <td className="p-2.5 font-semibold text-blue-800">{m.c12}</td>
                  <td className="p-2.5 font-semibold text-indigo-800">{m.c13}</td>
                  <td className="p-2.5 font-semibold text-emerald-800">{m.c14}</td>
                  <td className="p-2.5 font-semibold text-purple-800">{m.cOver14}</td>
                  <td className="p-2.5 font-black text-slate-900 bg-slate-50/50">{m.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 text-slate-900 font-black border-t-2 border-slate-300 text-center">
                <td className="p-2.5 text-left pl-4 uppercase">TOTAL :</td>
                <td className="p-2.5 text-amber-900">{ageCategoryCounts[0].count}</td>
                <td className="p-2.5 text-blue-900">{ageCategoryCounts[1].count}</td>
                <td className="p-2.5 text-indigo-900">{ageCategoryCounts[2].count}</td>
                <td className="p-2.5 text-emerald-900">{ageCategoryCounts[3].count}</td>
                <td className="p-2.5 text-purple-900">{ageCategoryCounts[4].count}</td>
                <td className="p-2.5 bg-slate-200 font-black">{enrichedStudents.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Screen Interactive Filter Controls (No Print) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 no-print flex flex-wrap items-center gap-3">
        {/* Class Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
          >
            <option value="ALL">Semua Kelas</option>
            {waliKelasList.map((wk) => (
              <option key={wk.kelas} value={wk.kelas}>
                Kelas {wk.kelas}
              </option>
            ))}
          </select>
        </div>

        {/* Age Category Filter */}
        <div className="flex items-center space-x-2">
          <Cake className="w-4 h-4 text-slate-400" />
          <select
            value={selectedKategoriUsia}
            onChange={(e) => setSelectedKategoriUsia(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
          >
            <option value="ALL">Semua Kategori Usia</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                Kategori {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Search by Name */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchNama}
            onChange={(e) => setSearchNama(e.target.value)}
            placeholder="Cari Nama Siswa / NIS..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 font-medium transition"
          />
        </div>

        <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200">
          {filteredStudents.length} Siswa Terpilih
        </span>
      </div>

      <style>{`
        @media print {
          @page {
            size: 215mm 330mm portrait;
            margin: 8mm 10mm 8mm 10mm;
          }
          #printable-rekap-usia {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
        }
      `}</style>

      {/* Main Printable Document Sheet (F4 Portrait Layout) */}
      <div className="flex justify-center">
        <div
          ref={printableRef}
          id="printable-rekap-usia"
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
                  REKAPITULASI DATA PESERTA DIDIK BERDASARKAN KATEGORI USIA DAN ROMBEL
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
            <span>Rombel: <span className="text-blue-950 font-black">{selectedKelas === 'ALL' ? 'SEMUA ROMBEL' : `KELAS ${selectedKelas}`}</span></span>
            <span>Kategori Usia: <span className="text-blue-950 font-black">{selectedKategoriUsia === 'ALL' ? 'SEMUA KATEGORI' : selectedKategoriUsia}</span></span>
            <span>Jumlah Siswa Terdata: <span className="text-blue-950 font-black">{filteredStudents.length} SISWA</span></span>
          </div>

          {/* Bagian 1: Matriks Distribusi Kelompok Usia Per Rombel */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800 border-l-4 border-indigo-600 pl-2">
              I. Matriks Distribusi Usia Per Rombongan Belajar
            </h4>
            <table className="w-full text-left border-collapse border border-slate-700 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 text-center font-bold text-[9.5px] uppercase">
                  <th className="border border-slate-700 py-1.5 px-1 w-9">No</th>
                  <th className="border border-slate-700 py-1.5 px-2 text-left pl-3 w-28">Kelas / Rombel</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-16">&lt; 12 Thn</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-16">12 Thn</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-16">13 Thn</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-16">14 Thn</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-16">&ge; 15 Thn</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-20 bg-slate-200 font-black">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-slate-900 text-center">
                {classMatrix.map((m, idx) => (
                  <tr key={m.kelas} className="hover:bg-slate-50 transition">
                    <td className="border border-slate-700 py-1 px-1 font-semibold text-slate-700 text-[10px]">{idx + 1}</td>
                    <td className="border border-slate-700 py-1 px-2 text-left pl-3 font-bold text-blue-900 uppercase text-[10px]">
                      KELAS {m.kelas}
                    </td>
                    <td className="border border-slate-700 py-1 px-1 font-semibold text-[10px]">{m.cLess12}</td>
                    <td className="border border-slate-700 py-1 px-1 font-semibold text-[10px]">{m.c12}</td>
                    <td className="border border-slate-700 py-1 px-1 font-semibold text-[10px]">{m.c13}</td>
                    <td className="border border-slate-700 py-1 px-1 font-semibold text-[10px]">{m.c14}</td>
                    <td className="border border-slate-700 py-1 px-1 font-semibold text-[10px]">{m.cOver14}</td>
                    <td className="border border-slate-700 py-1 px-1 font-black bg-slate-50 text-[10px]">{m.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 font-black text-slate-950 border-t-2 border-slate-800 text-center">
                  <td colSpan={2} className="border border-slate-700 py-1.5 px-2 text-right uppercase tracking-wider text-[10px]">
                    TOTAL KESELURUHAN :
                  </td>
                  <td className="border border-slate-700 py-1.5 px-1 font-bold text-[10px]">{ageCategoryCounts[0].count}</td>
                  <td className="border border-slate-700 py-1.5 px-1 font-bold text-[10px]">{ageCategoryCounts[1].count}</td>
                  <td className="border border-slate-700 py-1.5 px-1 font-bold text-[10px]">{ageCategoryCounts[2].count}</td>
                  <td className="border border-slate-700 py-1.5 px-1 font-bold text-[10px]">{ageCategoryCounts[3].count}</td>
                  <td className="border border-slate-700 py-1.5 px-1 font-bold text-[10px]">{ageCategoryCounts[4].count}</td>
                  <td className="border border-slate-700 py-1.5 px-1 font-black bg-slate-300 text-xs">
                    {enrichedStudents.length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bagian 2: Tabel Rincian Data Peserta Didik */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800 border-l-4 border-purple-600 pl-2">
              II. Rincian Data Nama dan Usia Peserta Didik
            </h4>
            <table className="w-full text-left border-collapse border border-slate-700 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 text-center font-bold text-[9.5px] uppercase">
                  <th className="border border-slate-700 py-1.5 px-1 w-9">No</th>
                  <th className="border border-slate-700 py-1.5 px-2 text-left pl-3">Nama Lengkap Siswa</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-14">Kelas</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-20">NIS</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-9">JK</th>
                  <th className="border border-slate-700 py-1.5 px-2 text-left pl-3 w-40">Tempat, Tgl Lahir</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-24">Usia Lengkap</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-24">Kategori Usia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-slate-900">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border border-slate-700 p-6 text-center text-slate-400">
                      Tidak ada peserta didik yang memenuhi filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="border border-slate-700 py-1 px-1 text-center font-semibold text-slate-700 text-[9.5px]">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-700 py-1 px-2 pl-3 font-bold text-slate-900 uppercase text-[10px]">
                        {s.nama}
                      </td>
                      <td className="border border-slate-700 py-1 px-1 text-center font-extrabold text-indigo-900 uppercase text-[9.5px]">
                        {s.kelas}
                      </td>
                      <td className="border border-slate-700 py-1 px-1 text-center font-mono text-[9.5px]">
                        {s.nis}
                      </td>
                      <td className="border border-slate-700 py-1 px-1 text-center font-bold text-[9.5px]">
                        {s.jk}
                      </td>
                      <td className="border border-slate-700 py-1 px-2 pl-3 text-[9.5px]">
                        <span className="font-semibold">{s.tempatLahir}</span>, {formatDateIndo(s.tglLahir)}
                      </td>
                      <td className="border border-slate-700 py-1 px-1 text-center font-semibold font-mono text-[9.5px]">
                        {s.ageText}
                      </td>
                      <td className="border border-slate-700 py-1 px-1 text-center font-bold text-[9.5px]">
                        {s.ageCategory}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
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

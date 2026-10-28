import React, { useState, useRef } from 'react';
import { Printer, FileDown, Filter, Loader2 } from 'lucide-react';
import { Siswa, WaliKelas, ProfilSekolah, PenjabatData } from '../types';
import { exportMultiplePagesToPDF } from '../utils/pdfExport';

interface Format8355CetakViewProps {
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
  profilSekolah: ProfilSekolah;
  penjabatData: PenjabatData;
  logoDki: string;
  logoSekolah: string;
}

export const Format8355CetakView: React.FC<Format8355CetakViewProps> = ({
  siswaList,
  waliKelasList,
  profilSekolah,
  penjabatData,
  logoDki,
  logoSekolah,
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  const filtered = siswaList.filter(
    (s) => selectedKelas === 'ALL' || s.kelas === selectedKelas
  );

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!page1Ref.current || !page2Ref.current) return;
    try {
      setIsGeneratingPDF(true);
      const filename = `Form_8355_${selectedKelas !== 'ALL' ? `Kelas_${selectedKelas}` : 'Semua_Kelas'}_SMPN18_Jakarta_2Hal.pdf`;
      await exportMultiplePagesToPDF([page1Ref.current, page2Ref.current], {
        filename,
        orientation: 'landscape',
      });
    } catch (error) {
      console.error('Gagal membuat PDF Form 8355:', error);
      alert('Terjadi kendala saat membuat PDF. Anda juga dapat menggunakan tombol Cetak lalu pilih Simpan sebagai PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Split students into 2 pages: rows 1-18 for Page 1, rows 19-36 for Page 2
  const PAGE_ROWS = 18;
  const page1Students = filtered.slice(0, PAGE_ROWS);
  const page2Students = filtered.slice(PAGE_ROWS, PAGE_ROWS * 2);

  // Helper to render table row
  const renderRow = (s: Siswa | undefined, rowNumber: number) => {
    return (
      <tr key={s ? s.id : `empty-row-${rowNumber}`} className="hover:bg-slate-50 transition">
        <td className="border border-slate-700 py-1 px-1.5 text-center font-bold text-slate-800 text-[10px]">
          {rowNumber}
        </td>
        <td className="border border-slate-700 py-1 px-1.5 font-bold text-slate-900 text-[10px]">
          {s?.nama ? s.nama.toUpperCase() : ''}
        </td>
        <td className="border border-slate-700 py-1 px-1.5 text-center font-semibold text-[10px]">
          {s?.kelas || ''}
        </td>
        <td className="border border-slate-700 py-1 px-1.5 text-center font-mono text-[9.5px]">
          {s ? `${s.nis} / ${s.nisn}` : ''}
        </td>
        <td className="border border-slate-700 py-1 px-1.5 text-center font-bold text-[10px]">
          {s?.jk || ''}
        </td>
        <td className="border border-slate-700 py-1 px-1.5 text-[10px]">
          {s ? `${s.tempatLahir}, ${s.tglLahir}` : ''}
        </td>
        <td className="border border-slate-700 py-1 px-1.5 text-center text-[10px]">
          {s?.agama || ''}
        </td>
        <td className="border border-slate-700 py-1 px-1.5 text-[10px]">
          {s?.ortu || ''}
        </td>
        <td className="border border-slate-700 py-1 px-1.5 text-[9.5px] leading-tight">
          {s?.alamat || ''}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar - Hidden when printing */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
          >
            <option value="ALL">Semua Kelas</option>
            {waliKelasList.map((wk) => (
              <option key={wk.kelas} value={wk.kelas}>
                Kelas {wk.kelas}
              </option>
            ))}
          </select>
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-200">
            {filtered.length} Siswa Terpilih (Format 2 Halaman F4)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Fitur Unduh PDF 2 Halaman */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-rose-600/20"
            title="Unduh dokumen Form 8355 dalam format PDF F4 Landscape (2 Halaman per kelas)"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Unduh PDF (2 Halaman)'}</span>
          </button>

          {/* Cetak F4 Landscape */}
          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Form 8355 (2 Halaman F4)</span>
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: 330mm 215mm landscape;
            margin: 8mm 10mm 8mm 10mm;
          }
          #form-8355-page-1, #form-8355-page-2 {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* 2 DISTINCT PRINTABLE PAGES FOR F4 LANDSCAPE */}
      <div id="printable-form-8355-multipage" className="space-y-8">
        {/* ==================== HALAMAN 1 (BARIS 1 - 18) ==================== */}
        <div
          ref={page1Ref}
          id="form-8355-page-1"
          className="print-container bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-3.5 text-slate-900 w-full"
        >
          {/* Kop Dokumen Resmi Lengkap */}
          <div className="border-b-4 border-double border-slate-900 pb-2.5 relative flex items-center justify-between">
            <div className="w-20 shrink-0 flex justify-start items-center">
              {logoDki ? (
                <img
                  src={logoDki}
                  alt="Logo DKI"
                  className="h-16 w-auto object-contain max-w-[70px]"
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-blue-50 rounded-lg text-blue-800 font-bold text-[9px] text-center p-1 border border-dashed border-blue-200 uppercase">
                  Logo DKI
                </div>
              )}
            </div>

            <div className="text-center flex-1 px-4">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-800">
                {profilSekolah.instansi || 'PEMERINTAH PROVINSI DKI JAKARTA'}
              </h2>
              <h2 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-slate-700">
                {profilSekolah.dinas || 'DINAS PENDIDIKAN'}
              </h2>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-900 mt-0.5">
                {profilSekolah.namaSekolah || 'SMP NEGERI 18 JAKARTA'}
              </h1>
              <p className="text-[10px] font-medium text-slate-600 mt-0.5 uppercase">
                {profilSekolah.alamat || 'Jl. Menteng Kecil No. 3, Jakarta Pusat'} | NPSN: {profilSekolah.npsn || '20100123'}
              </p>
              <h3 className="text-xs font-black underline uppercase tracking-widest mt-1.5 text-slate-950">
                FORMULIR 8355 (BUKU INDUK PESERTA DIDIK)
              </h3>
            </div>

            <div className="w-20 shrink-0 flex justify-end items-center">
              {logoSekolah ? (
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="h-16 w-auto object-contain max-w-[70px]"
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-indigo-50 rounded-lg text-indigo-800 font-bold text-[9px] text-center p-1 border border-dashed border-indigo-200 uppercase">
                  Logo Sekolah
                </div>
              )}
            </div>
          </div>

          {/* Sub Header Keterangan Kelas */}
          <div className="flex items-center justify-between font-bold text-xs text-slate-800 uppercase tracking-wide px-1">
            <span>
              KELAS : <span className="text-blue-900 font-black">{selectedKelas === 'ALL' ? 'SEMUA KELAS' : `KELAS ${selectedKelas}`}</span>
            </span>
            <span className="text-slate-600">TAHUN PELAJARAN: 2026/2027</span>
          </div>

          {/* Tabel Halaman 1 (Baris 1 - 18) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-700 text-xs">
              <thead>
                <tr className="bg-slate-200/90 text-slate-900 text-center font-bold text-[10px] uppercase tracking-wide">
                  <th className="border border-slate-700 py-1.5 px-1 w-8">No</th>
                  <th className="border border-slate-700 py-1.5 px-2">Nama Peserta Didik</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-14">Kelas</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-28">NIS / NISN</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-8">JK</th>
                  <th className="border border-slate-700 py-1.5 px-2">Tempat, Tgl Lahir</th>
                  <th className="border border-slate-700 py-1.5 px-1.5 w-16">Agama</th>
                  <th className="border border-slate-700 py-1.5 px-2">Nama Orang Tua</th>
                  <th className="border border-slate-700 py-1.5 px-2">Alamat Tinggal</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: PAGE_ROWS }).map((_, idx) => {
                  const s = page1Students[idx];
                  return renderRow(s, idx + 1);
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200">
            <span>Formulir 8355 (Buku Induk) - SMPN 18 Jakarta</span>
            <span>Halaman 1 dari 2</span>
          </div>
        </div>

        {/* Pemisah Halaman Cetak */}
        <div className="page-break" />

        {/* ==================== HALAMAN 2 (BARIS 19 - 36 + PENGESAHAN) ==================== */}
        <div
          ref={page2Ref}
          id="form-8355-page-2"
          className="print-container bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-3.5 text-slate-900 w-full"
        >
          {/* Header Ringkas Lanjutan Halaman 2 */}
          <div className="border-b-2 border-slate-800 pb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {logoDki && (
                <img src={logoDki} alt="Logo DKI" className="h-9 w-auto object-contain" />
              )}
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900">
                  {profilSekolah.namaSekolah || 'SMP NEGERI 18 JAKARTA'}
                </h3>
                <p className="text-[10px] font-bold text-slate-600 uppercase">
                  FORMULIR 8355 (BUKU INDUK SISWA) — LEMBAR LANJUTAN
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 uppercase">
                KELAS: {selectedKelas === 'ALL' ? 'SEMUA KELAS' : selectedKelas}
              </span>
              <p className="text-[10px] text-slate-600 font-medium">
                T.A 2026/2027
              </p>
            </div>
          </div>

          {/* Tabel Halaman 2 (Baris 19 - 36) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-700 text-xs">
              <thead>
                <tr className="bg-slate-200/90 text-slate-900 text-center font-bold text-[10px] uppercase tracking-wide">
                  <th className="border border-slate-700 py-1.5 px-1 w-8">No</th>
                  <th className="border border-slate-700 py-1.5 px-2">Nama Peserta Didik</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-14">Kelas</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-28">NIS / NISN</th>
                  <th className="border border-slate-700 py-1.5 px-1 w-8">JK</th>
                  <th className="border border-slate-700 py-1.5 px-2">Tempat, Tgl Lahir</th>
                  <th className="border border-slate-700 py-1.5 px-1.5 w-16">Agama</th>
                  <th className="border border-slate-700 py-1.5 px-2">Nama Orang Tua</th>
                  <th className="border border-slate-700 py-1.5 px-2">Alamat Tinggal</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: PAGE_ROWS }).map((_, idx) => {
                  const s = page2Students[idx];
                  return renderRow(s, PAGE_ROWS + idx + 1);
                })}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan & Pengesahan Dokumen di Bawah Tabel Halaman 2 */}
          <div className="pt-2 grid grid-cols-2 gap-8 text-xs font-semibold">
            <div className="text-center space-y-10">
              <p className="leading-snug">
                Mengetahui,<br />
                Pengawas Sekolah Pembina
              </p>
              <div>
                <p className="font-bold underline text-slate-900 text-xs uppercase">
                  {penjabatData.pengawas.nama || 'Dr. Hj. Sri Rahayu, M.Pd.'}
                </p>
                <p className="text-[10px] font-normal text-slate-600">
                  NIP. {penjabatData.pengawas.nip || '196508151990032002'}
                </p>
              </div>
            </div>

            <div className="text-center space-y-10">
              <p className="leading-snug">
                Jakarta, <span>{todayStr}</span><br />
                {penjabatData.ks.jabatan || 'Kepala SMPN 18 Jakarta'}
              </p>
              <div>
                <p className="font-bold underline text-slate-900 text-xs uppercase">
                  {penjabatData.ks.nama || 'Drs. H. Mulyadi, M.Pd.'}
                </p>
                <p className="text-[10px] font-normal text-slate-600">
                  NIP. {penjabatData.ks.nip || '196803121995121001'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200">
            <span>Formulir 8355 (Buku Induk) - SMPN 18 Jakarta</span>
            <span>Halaman 2 dari 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

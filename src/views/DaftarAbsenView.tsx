import React, { useState, useRef } from 'react';
import { Printer, Filter, Calendar, FileDown, Loader2 } from 'lucide-react';
import { Siswa, WaliKelas } from '../types';
import { exportMultiplePagesToPDF } from '../utils/pdfExport';

interface DaftarAbsenViewProps {
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
}

export const DaftarAbsenView: React.FC<DaftarAbsenViewProps> = ({
  siswaList,
  waliKelasList,
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [selectedBulan, setSelectedBulan] = useState<number>(10); // Oktober by default
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  const months = [
    { value: 1, name: 'Januari' },
    { value: 2, name: 'Februari' },
    { value: 3, name: 'Maret' },
    { value: 4, name: 'April' },
    { value: 5, name: 'Mei' },
    { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' },
    { value: 8, name: 'Agustus' },
    { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' },
    { value: 11, name: 'November' },
    { value: 12, name: 'Desember' },
  ];

  const currentMonthName = months.find((m) => m.value === selectedBulan)?.name || 'Oktober';

  const filtered = siswaList.filter(
    (s) => selectedKelas === 'ALL' || s.kelas === selectedKelas
  );

  const currentWaliKelas =
    selectedKelas !== 'ALL'
      ? waliKelasList.find((wk) => wk.kelas === selectedKelas)
      : waliKelasList[0];

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
      const filename = `Daftar_Absensi_${selectedKelas !== 'ALL' ? selectedKelas : 'Semua_Kelas'}_Bulan_${currentMonthName}_SMPN18.pdf`;
      await exportMultiplePagesToPDF([page1Ref.current, page2Ref.current], {
        filename,
        orientation: 'landscape',
      });
    } catch (err) {
      console.error('Gagal membuat PDF Absensi:', err);
      alert('Terjadi kendala saat membuat PDF. Anda juga dapat menggunakan tombol Cetak Absensi lalu pilih Simpan sebagai PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper to render an attendance row
  const renderRow = (siswa: Siswa | null, number: number) => {
    return (
      <tr key={`absen-row-${number}`} className="hover:bg-slate-50 transition">
        <td className="p-1 text-center font-semibold text-slate-700 border border-slate-500">
          {number}
        </td>
        <td className="p-1 font-semibold text-slate-900 border border-slate-500 truncate max-w-[150px]">
          {siswa ? siswa.nama : ''}
        </td>
        <td className="p-1 font-mono text-slate-800 border border-slate-500 text-center">
          {siswa ? siswa.nis : ''}
        </td>
        <td
          className={`p-1 text-center font-bold border border-slate-500 ${
            siswa?.jk === 'L' ? 'text-blue-700' : 'text-pink-700'
          }`}
        >
          {siswa ? siswa.jk : ''}
        </td>
        {Array.from({ length: 31 }).map((_, dIdx) => (
          <td
            key={`d-${dIdx}`}
            className="p-0.5 border border-slate-500 text-center text-[9px] w-5 min-w-[20px]"
          >
            &nbsp;
          </td>
        ))}
        <td className="p-1 text-center border border-slate-500 font-semibold bg-amber-50/60 w-6">
          &nbsp;
        </td>
        <td className="p-1 text-center border border-slate-500 font-semibold bg-blue-50/60 w-6">
          &nbsp;
        </td>
        <td className="p-1 text-center border border-slate-500 font-semibold bg-rose-50/60 w-6">
          &nbsp;
        </td>
        <td className="p-1 text-center border border-slate-500 font-bold bg-slate-100 w-7">
          &nbsp;
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-teal-500 outline-none text-slate-800"
            >
              <option value="ALL">Semua Kelas</option>
              {waliKelasList.map((wk) => (
                <option key={wk.kelas} value={wk.kelas}>
                  Kelas {wk.kelas}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-teal-500 outline-none text-slate-800"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  Bulan {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tombol Unduh PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-rose-600/20"
            title="Unduh daftar absensi 2 halaman dalam format PDF"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Unduh PDF'}</span>
          </button>

          {/* Tombol Cetak */}
          <button
            onClick={handlePrint}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-teal-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Absensi (2 Halaman)</span>
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: 330mm 215mm landscape;
            margin: 8mm 10mm 8mm 10mm;
          }
          #printable-daftar-absen-container > div {
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

      <div id="printable-daftar-absen-container" className="space-y-8">
        {/* HALAMAN 1 (Siswa 1 s/d 18) */}
        <div
          ref={page1Ref}
          className="print-container bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-md space-y-3.5"
        >
          <div className="text-center space-y-1 pb-2 border-b border-slate-200">
            <h3 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2">
              <span>DAFTAR ABSENSI PESERTA DIDIK (HALAMAN 1)</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300 font-bold uppercase">
                T.A 2026/2027
              </span>
            </h3>
            <p className="text-xs font-semibold text-slate-700 uppercase">
              KELAS : {selectedKelas === 'ALL' ? 'SEMUA KELAS' : selectedKelas} | BULAN: {currentMonthName.toUpperCase()}
            </p>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-500 min-w-[980px] text-[10px]">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-center text-[10px]">
                  <th rowSpan={2} className="p-1 w-8 border border-slate-500">No.</th>
                  <th rowSpan={2} className="p-1 min-w-[150px] border border-slate-500 text-left">Nama Peserta Didik</th>
                  <th rowSpan={2} className="p-1 w-14 border border-slate-500">NIS</th>
                  <th rowSpan={2} className="p-1 w-8 border border-slate-500">JK</th>
                  <th colSpan={31} className="p-1 border border-slate-500">Tanggal Per Bulan</th>
                  <th colSpan={4} className="p-1 border border-slate-500 bg-slate-300">Rekapitulasi</th>
                </tr>
                <tr className="bg-slate-100 text-slate-700 font-semibold text-center text-[9px]">
                  {Array.from({ length: 31 }).map((_, d) => (
                    <th key={`head1-${d + 1}`} className="w-5 border border-slate-500 p-0.5">
                      {d + 1}
                    </th>
                  ))}
                  <th className="w-6 border border-slate-500 bg-amber-100 text-amber-900">S</th>
                  <th className="w-6 border border-slate-500 bg-blue-100 text-blue-900">I</th>
                  <th className="w-6 border border-slate-500 bg-rose-100 text-rose-900">A</th>
                  <th className="w-7 border border-slate-500 bg-slate-300 text-slate-900">Jml</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 18 }).map((_, i) => {
                  const s = filtered[i] || null;
                  return renderRow(s, i + 1);
                })}
              </tbody>
            </table>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
            Halaman 1 dari 2
          </div>
        </div>

        {/* Page Break for Print */}
        <div className="page-break" />

        {/* HALAMAN 2 (Siswa 19 s/d 36 + Tanda Tangan) */}
        <div
          ref={page2Ref}
          className="print-container bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-md space-y-3.5"
        >
          <div className="text-center space-y-1 pb-2 border-b border-slate-200">
            <h3 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2">
              <span>DAFTAR ABSENSI PESERTA DIDIK (HALAMAN 2)</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300 font-bold uppercase">
                T.A 2026/2027
              </span>
            </h3>
            <p className="text-xs font-semibold text-slate-700 uppercase">
              KELAS : {selectedKelas === 'ALL' ? 'SEMUA KELAS' : selectedKelas} | BULAN: {currentMonthName.toUpperCase()}
            </p>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse border border-slate-500 min-w-[980px] text-[10px]">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-center text-[10px]">
                  <th rowSpan={2} className="p-1 w-8 border border-slate-500">No.</th>
                  <th rowSpan={2} className="p-1 min-w-[150px] border border-slate-500 text-left">Nama Peserta Didik</th>
                  <th rowSpan={2} className="p-1 w-14 border border-slate-500">NIS</th>
                  <th rowSpan={2} className="p-1 w-8 border border-slate-500">JK</th>
                  <th colSpan={31} className="p-1 border border-slate-500">Tanggal Per Bulan</th>
                  <th colSpan={4} className="p-1 border border-slate-500 bg-slate-300">Rekapitulasi</th>
                </tr>
                <tr className="bg-slate-100 text-slate-700 font-semibold text-center text-[9px]">
                  {Array.from({ length: 31 }).map((_, d) => (
                    <th key={`head2-${d + 1}`} className="w-5 border border-slate-500 p-0.5">
                      {d + 1}
                    </th>
                  ))}
                  <th className="w-6 border border-slate-500 bg-amber-100 text-amber-900">S</th>
                  <th className="w-6 border border-slate-500 bg-blue-100 text-blue-900">I</th>
                  <th className="w-6 border border-slate-500 bg-rose-100 text-rose-900">A</th>
                  <th className="w-7 border border-slate-500 bg-slate-300 text-slate-900">Jml</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 18 }).map((_, i) => {
                  const studentIndex = 18 + i;
                  const s = filtered[studentIndex] || null;
                  return renderRow(s, studentIndex + 1);
                })}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Wali Kelas di Halaman 2 */}
          <div className="pt-2 flex justify-end text-xs font-semibold">
            <div className="text-center space-y-8 w-60">
              <p className="leading-snug">
                Jakarta, <span>{todayStr}</span><br />
                Wali Kelas {selectedKelas !== 'ALL' ? selectedKelas : currentWaliKelas?.kelas || '-'}
              </p>
              <div>
                <p className="font-bold underline text-slate-900 text-xs uppercase">
                  {currentWaliKelas?.nama || '-'}
                </p>
                <p className="text-[10px] font-normal text-slate-600">
                  NIP. {currentWaliKelas?.nip || '-'}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
            Halaman 2 dari 2
          </div>
        </div>
      </div>
    </div>
  );
};

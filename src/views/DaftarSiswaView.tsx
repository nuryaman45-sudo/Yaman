import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileDown,
  Filter,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { Siswa, WaliKelas, ProfilSekolah, PenjabatData } from '../types';
import { exportElementToPDF } from '../utils/pdfExport';

interface DaftarSiswaViewProps {
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
  profilSekolah: ProfilSekolah;
  penjabatData: PenjabatData;
  logoDki: string;
  logoSekolah: string;
}

export const DaftarSiswaView: React.FC<DaftarSiswaViewProps> = ({
  siswaList,
  waliKelasList,
  profilSekolah,
  penjabatData,
  logoDki,
  logoSekolah,
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const filtered = siswaList.filter(
    (s) => selectedKelas === 'ALL' || s.kelas === selectedKelas
  );

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Determine Wali Kelas for signature
  const currentWaliKelas =
    selectedKelas !== 'ALL'
      ? waliKelasList.find((wk) => wk.kelas === selectedKelas)
      : waliKelasList[0];

  const TARGET_ROWS = 36;
  const emptyRowsCount = Math.max(0, TARGET_ROWS - filtered.length);


  // Unduh Excel murni (.xlsx)
  const handleDownloadExcel = () => {
    const exportRows = filtered.map((s, idx) => ({
      'NO': idx + 1,
      'NAMA PESERTA DIDIK': (s.nama || '').toUpperCase(),
      'KELAS': (s.kelas || '').toUpperCase(),
      'NIS': (s.nis || '').toUpperCase(),
      'NISN': (s.nisn || '').toUpperCase(),
      'JENIS KELAMIN': (s.jk || '').toUpperCase(),
      'AGAMA': (s.agama || '').toUpperCase(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);

    ws['!cols'] = [
      { wch: 6 },  // NO
      { wch: 32 }, // NAMA
      { wch: 10 }, // KELAS
      { wch: 14 }, // NIS
      { wch: 16 }, // NISN
      { wch: 14 }, // JK
      { wch: 18 }, // AGAMA
    ];

    const wb = XLSX.utils.book_new();
    const sheetName = selectedKelas !== 'ALL' ? `Kelas ${selectedKelas}` : 'Daftar Siswa';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const fileName = `Daftar_Siswa_${selectedKelas !== 'ALL' ? selectedKelas : 'Semua_Kelas'}_SMPN18.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Unduh PDF murni F4 Portrait (Hanya 1 Halaman Per Kelas)
  const handleDownloadPDF = async () => {
    if (!printableRef.current) return;
    try {
      setIsGeneratingPDF(true);
      const fileName = `Daftar_Siswa_${selectedKelas !== 'ALL' ? `Kelas_${selectedKelas}` : 'Semua_Kelas'}_SMPN18_Jakarta_1Hal.pdf`;
      await exportElementToPDF(printableRef.current, {
        filename: fileName,
        orientation: 'portrait',
        singlePage: true,
      });
    } catch (error) {
      console.error('Gagal membuat PDF Daftar Siswa:', error);
      alert('Terjadi kendala saat membuat PDF. Anda juga dapat menggunakan tombol Print F4 lalu pilih Simpan sebagai PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center space-x-3">
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
          <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-200">
            {filtered.length} Siswa (Format 1 Halaman F4)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Unduh Excel */}
          <button
            onClick={handleDownloadExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shadow-emerald-600/20"
            title="Unduh berkas spreadsheet Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Unduh Excel</span>
          </button>

          {/* Tombol Unduh PDF (1 Halaman Saja) */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shadow-rose-600/20"
            title="Unduh dokumen Daftar Siswa dalam format PDF F4 Portrait (tepat 1 halaman per kelas)"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Unduh PDF (1 Halaman)'}</span>
          </button>


        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: 215mm 330mm portrait;
            margin: 8mm 10mm 8mm 10mm;
          }
          #printable-daftar-siswa-container {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
        }
      `}</style>

      {/* Document Sheet F4 Portrait (Strict 1 Page per class) */}
      <div className="flex justify-center">
        <div
          ref={printableRef}
          id="printable-daftar-siswa-container"
          className="print-container print-portrait-f4 bg-white px-8 sm:px-12 py-6 rounded-2xl border border-slate-200/80 shadow-md space-y-3 text-slate-900 w-full max-w-[860px]"
        >
          {/* Kop Dokumen Resmi */}
          <div className="border-b-4 border-double border-slate-900 pb-2 relative flex items-center justify-between">
            <div className="w-16 shrink-0 flex justify-start items-center">
              {logoDki ? (
                <img
                  src={logoDki}
                  alt="Logo DKI"
                  className="h-14 w-auto object-contain max-w-[60px]"
                />
              ) : (
                <div className="h-14 w-14 flex items-center justify-center bg-blue-50 rounded-lg text-blue-800 font-bold text-[8px] text-center p-1 border border-dashed border-blue-200 uppercase">
                  Logo DKI
                </div>
              )}
            </div>

            <div className="text-center flex-1 px-3">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-800">
                {profilSekolah.instansi || 'PEMERINTAH PROVINSI DKI JAKARTA'}
              </h2>
              <h2 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-slate-700">
                {profilSekolah.dinas || 'DINAS PENDIDIKAN'}
              </h2>
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-900 mt-0.5">
                {profilSekolah.namaSekolah || 'SMP NEGERI 18 JAKARTA'}
              </h1>
              <p className="text-[9px] font-semibold text-slate-600 mt-0.5 uppercase">
                {profilSekolah.alamat || 'JL. MENTENG KECIL NO. 3, JAKARTA PUSAT'} | NPSN: {profilSekolah.npsn || '20100123'}
              </p>
            </div>

            <div className="w-16 shrink-0 flex justify-end items-center">
              {logoSekolah ? (
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="h-14 w-auto object-contain max-w-[60px]"
                />
              ) : (
                <div className="h-14 w-14 flex items-center justify-center bg-indigo-50 rounded-lg text-indigo-800 font-bold text-[8px] text-center p-1 border border-dashed border-indigo-200 uppercase">
                  Logo Sekolah
                </div>
              )}
            </div>
          </div>

          {/* Sub Header */}
          <div className="text-center space-y-0.5 pt-0.5">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
              DAFTAR PESERTA DIDIK
            </h3>
            <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">
              KELAS : {selectedKelas === 'ALL' ? 'SEMUA KELAS' : selectedKelas} | TAHUN PELAJARAN 2026/2027
            </p>
          </div>

          {/* Tabel 36 Baris Standar Administrasi - DATA HURUF KAPITAL SEMUA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-700 text-[9.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 text-center font-bold uppercase tracking-wider text-[9.5px]">
                  <th className="py-1 px-1 text-center w-9 border border-slate-700">NO.</th>
                  <th className="py-1 px-2 border border-slate-700 text-left">NAMA PESERTA DIDIK</th>
                  <th className="py-1 px-1 border border-slate-700 w-24 text-center">NIS</th>
                  <th className="py-1 px-1 border border-slate-700 w-28 text-center">NISN</th>
                  <th className="py-1 px-1 text-center border border-slate-700 w-10">JK</th>
                  <th className="py-1 px-2 border border-slate-700 w-28 text-center">AGAMA</th>
                </tr>
              </thead>
              <tbody className="uppercase font-medium">
                {filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-0.5 px-1 text-center font-bold text-slate-700 border border-slate-700">
                      {idx + 1}
                    </td>
                    <td className="py-0.5 px-2 font-bold text-slate-900 border border-slate-700">
                      {(s.nama || '').toUpperCase()}
                    </td>
                    <td className="py-0.5 px-1 font-mono text-slate-800 border border-slate-700 text-center">
                      {(s.nis || '').toUpperCase()}
                    </td>
                    <td className="py-0.5 px-1 font-mono text-slate-800 border border-slate-700 text-center">
                      {(s.nisn || '').toUpperCase()}
                    </td>
                    <td className="py-0.5 px-1 text-center font-bold border border-slate-700">
                      {(s.jk || '').toUpperCase()}
                    </td>
                    <td className="py-0.5 px-1 border border-slate-700 text-center">
                      {(s.agama || '').toUpperCase()}
                    </td>
                  </tr>
                ))}

                {/* Lined empty rows up to 36 */}
                {Array.from({ length: emptyRowsCount }).map((_, i) => (
                  <tr key={`empty-${i}`} className="hover:bg-slate-50 transition">
                    <td className="py-0.5 px-1 text-center font-semibold text-slate-400 border border-slate-700">
                      {filtered.length + i + 1}
                    </td>
                    <td className="py-0.5 px-2 border border-slate-700">&nbsp;</td>
                    <td className="py-0.5 px-1 border border-slate-700">&nbsp;</td>
                    <td className="py-0.5 px-1 border border-slate-700">&nbsp;</td>
                    <td className="py-0.5 px-1 text-center border border-slate-700">&nbsp;</td>
                    <td className="py-0.5 px-1 border border-slate-700">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Wali Kelas */}
          <div className="pt-2 flex justify-end text-[11px] font-semibold uppercase tanda-tangan-block">
            <div className="text-center flex flex-col justify-between h-28 w-60">
              <p className="leading-tight">
                JAKARTA, <span>{todayStr.toUpperCase()}</span><br />
                WALI KELAS {selectedKelas !== 'ALL' ? selectedKelas : currentWaliKelas?.kelas || '-'}
              </p>
              <div className="flex-1 flex items-center justify-center my-0.5">
                {currentWaliKelas?.ttd ? (
                  <img
                    src={currentWaliKelas.ttd}
                    alt="TTD Wali Kelas"
                    className="h-12 max-w-[130px] object-contain"
                  />
                ) : (
                  <div className="h-8" />
                )}
              </div>
              <div>
                <p className="font-bold underline text-slate-900">
                  {(currentWaliKelas?.nama || '-').toUpperCase()}
                </p>
                <p className="text-[10px] font-normal text-slate-700">
                  NIP. {(currentWaliKelas?.nip || '-').toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

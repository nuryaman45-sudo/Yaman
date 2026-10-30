import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileDown,
  Calendar,
  Filter,
  Search,
  Sparkles,
  Loader2,
  Users,
  CheckCircle2,
  TableProperties,
} from 'lucide-react';
import { MutasiSiswa, Siswa, WaliKelas, ProfilSekolah, PenjabatData } from '../types';
import { exportElementToPDF } from '../utils/pdfExport';

interface DaftarMutasiViewProps {
  mutasiList: MutasiSiswa[];
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
  profilSekolah: ProfilSekolah;
  penjabatData: PenjabatData;
  logoDki: string;
  logoSekolah: string;
  onOpenAddModal: () => void;
  onOpenEditModal: (mutasi: MutasiSiswa) => void;
  onDeleteMutasi: (id: number) => void;
}

export const DaftarMutasiView: React.FC<DaftarMutasiViewProps> = ({
  mutasiList,
  siswaList,
  waliKelasList,
  profilSekolah,
  penjabatData,
  logoDki,
  logoSekolah,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteMutasi,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'rekapitulasi'>('daftar');
  const [selectedBulan, setSelectedBulan] = useState<string>('ALL');
  const [selectedJenis, setSelectedJenis] = useState<'ALL' | 'MASUK' | 'KELUAR'>('ALL');
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingRekapPDF, setIsGeneratingRekapPDF] = useState(false);
  const [mutasiToDelete, setMutasiToDelete] = useState<MutasiSiswa | null>(null);

  const printableRef = useRef<HTMLDivElement>(null);
  const printableRekapRef = useRef<HTMLDivElement>(null);

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

  const currentMonthName =
    selectedBulan !== 'ALL'
      ? months.find((m) => m.value === Number(selectedBulan))?.name || 'Oktober'
      : 'Semua Bulan';

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Filtered mutasi list
  const filteredMutasi = mutasiList.filter((m) => {
    const matchBulan = selectedBulan === 'ALL' || m.bulan === Number(selectedBulan);
    const matchJenis = selectedJenis === 'ALL' || m.jenisMutasi === selectedJenis;
    const matchKelas = selectedKelas === 'ALL' || m.kelas === selectedKelas;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      m.nama.toLowerCase().includes(q) ||
      m.nis.includes(q) ||
      m.sekolahAsalTujuan.toLowerCase().includes(q) ||
      m.nomorSurat.toLowerCase().includes(q);
    return matchBulan && matchJenis && matchKelas && matchSearch;
  });

  // KPI Calculations
  const totalMasuk = mutasiList.filter((m) => m.jenisMutasi === 'MASUK').length;
  const totalKeluar = mutasiList.filter((m) => m.jenisMutasi === 'KELUAR').length;
  const netMutasi = totalMasuk - totalKeluar;
  const totalSiswaAktif = siswaList.length;

  // Monthly Rekapitulasi Data (Academic Year Cycle: Juli -> Juni)
  const academicMonths = [
    { num: 7, name: 'Juli' },
    { num: 8, name: 'Agustus' },
    { num: 9, name: 'September' },
    { num: 10, name: 'Oktober' },
    { num: 11, name: 'November' },
    { num: 12, name: 'Desember' },
    { num: 1, name: 'Januari' },
    { num: 2, name: 'Februari' },
    { num: 3, name: 'Maret' },
    { num: 4, name: 'April' },
    { num: 5, name: 'Mei' },
    { num: 6, name: 'Juni' },
  ];

  const monthlyRekap = academicMonths.map((m, idx) => {
    const inMonth = mutasiList.filter((item) => item.bulan === m.num);
    const masukL = inMonth.filter((item) => item.jenisMutasi === 'MASUK' && item.jk === 'L').length;
    const masukP = inMonth.filter((item) => item.jenisMutasi === 'MASUK' && item.jk === 'P').length;
    const masukJml = masukL + masukP;

    const keluarL = inMonth.filter((item) => item.jenisMutasi === 'KELUAR' && item.jk === 'L').length;
    const keluarP = inMonth.filter((item) => item.jenisMutasi === 'KELUAR' && item.jk === 'P').length;
    const keluarJml = keluarL + keluarP;

    const saldo = masukJml - keluarJml;

    return {
      no: idx + 1,
      bulanName: m.name,
      bulanNum: m.num,
      masukL,
      masukP,
      masukJml,
      keluarL,
      keluarP,
      keluarJml,
      saldo,
    };
  });

  // Class Rekapitulasi dengan rincian: Kelas, Awal Bulan (L/P/JML), Masuk (L/P/JML), Keluar (L/P/JML), Akhir Bulan (L/P/JML)
  const allClassNames = Array.from(
    new Set([
      ...waliKelasList.map((wk) => wk.kelas),
      ...siswaList.map((s) => s.kelas),
      ...mutasiList.map((m) => m.kelas),
    ])
  ).filter(Boolean).sort();

  const classRekap = allClassNames.map((kelas, idx) => {
    const siswaInClass = siswaList.filter((s) => s.kelas === kelas);
    const akhirL = siswaInClass.filter((s) => s.jk === 'L').length;
    const akhirP = siswaInClass.filter((s) => s.jk === 'P').length;
    const akhirJml = akhirL + akhirP;

    const mutasiInClass = mutasiList.filter((m) => {
      const matchKelas = m.kelas === kelas;
      const matchBulan = selectedBulan === 'ALL' || m.bulan === Number(selectedBulan);
      return matchKelas && matchBulan;
    });

    const masukL = mutasiInClass.filter((m) => m.jenisMutasi === 'MASUK' && m.jk === 'L').length;
    const masukP = mutasiInClass.filter((m) => m.jenisMutasi === 'MASUK' && m.jk === 'P').length;
    const masukJml = masukL + masukP;

    const keluarL = mutasiInClass.filter((m) => m.jenisMutasi === 'KELUAR' && m.jk === 'L').length;
    const keluarP = mutasiInClass.filter((m) => m.jenisMutasi === 'KELUAR' && m.jk === 'P').length;
    const keluarJml = keluarL + keluarP;

    // Keadaan awal dihitung mundur dari keadaan akhir:
    // Awal + Masuk - Keluar = Akhir  =>  Awal = Akhir - Masuk + Keluar
    const awalL = Math.max(0, akhirL - masukL + keluarL);
    const awalP = Math.max(0, akhirP - masukP + keluarP);
    const awalJml = awalL + awalP;

    return {
      no: idx + 1,
      kelas,
      awalL,
      awalP,
      awalJml,
      masukL,
      masukP,
      masukJml,
      keluarL,
      keluarP,
      keluarJml,
      akhirL,
      akhirP,
      akhirJml,
    };
  });

  const totalRekapKelas = classRekap.reduce(
    (acc, curr) => ({
      awalL: acc.awalL + curr.awalL,
      awalP: acc.awalP + curr.awalP,
      awalJml: acc.awalJml + curr.awalJml,
      masukL: acc.masukL + curr.masukL,
      masukP: acc.masukP + curr.masukP,
      masukJml: acc.masukJml + curr.masukJml,
      keluarL: acc.keluarL + curr.keluarL,
      keluarP: acc.keluarP + curr.keluarP,
      keluarJml: acc.keluarJml + curr.keluarJml,
      akhirL: acc.akhirL + curr.akhirL,
      akhirP: acc.akhirP + curr.akhirP,
      akhirJml: acc.akhirJml + curr.akhirJml,
    }),
    {
      awalL: 0,
      awalP: 0,
      awalJml: 0,
      masukL: 0,
      masukP: 0,
      masukJml: 0,
      keluarL: 0,
      keluarP: 0,
      keluarJml: 0,
      akhirL: 0,
      akhirP: 0,
      akhirJml: 0,
    }
  );


  const handleDownloadPDF = async () => {
    if (!printableRef.current) return;
    try {
      setIsGeneratingPDF(true);
      const filename = `Daftar_Mutasi_${selectedBulan !== 'ALL' ? currentMonthName : 'Semua_Bulan'}_SMPN18_F4_Landscape.pdf`;
      await exportElementToPDF(printableRef.current, {
        filename,
        orientation: 'landscape',
        singlePage: filteredMutasi.length <= 16,
      });
    } catch (err) {
      console.error('Gagal membuat PDF mutasi:', err);
      alert('Terjadi kendala saat membuat PDF. Anda dapat menggunakan tombol Cetak lalu pilih Simpan sebagai PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportExcelDaftar = () => {
    const exportRows = filteredMutasi.map((m, idx) => ({
      'No': idx + 1,
      'Tanggal Mutasi': m.tanggalMutasi,
      'Nama Peserta Didik': m.nama,
      'Kelas': m.kelas,
      'NIS': m.nis,
      'NISN': m.nisn,
      'Jenis Kelamin': m.jk,
      'Jenis Mutasi': m.jenisMutasi,
      'Sekolah Asal / Tujuan': m.sekolahAsalTujuan,
      'Alasan Mutasi': m.alasan,
      'Nomor Surat': m.nomorSurat,
      'Keterangan': m.keterangan || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 28 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 14 },
      { wch: 15 },
      { wch: 28 },
      { wch: 30 },
      { wch: 24 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Mutasi');
    XLSX.writeFile(wb, `Daftar_Mutasi_${selectedBulan !== 'ALL' ? currentMonthName : 'Semua_Bulan'}_SMPN18.xlsx`);
  };

  const handleExportExcelRekap = () => {
    const exportMonthly = monthlyRekap.map((r) => ({
      'Bulan': r.bulanName,
      'Mutasi Masuk (L)': r.masukL,
      'Mutasi Masuk (P)': r.masukP,
      'Total Masuk': r.masukJml,
      'Mutasi Keluar (L)': r.keluarL,
      'Mutasi Keluar (P)': r.keluarP,
      'Total Keluar': r.keluarJml,
      'Saldo Perubahan (+/-)': r.saldo,
    }));

    const ws1 = XLSX.utils.json_to_sheet(exportMonthly);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Rekap Bulanan');

    const exportClass = classRekap.map((c) => ({
      'No': c.no,
      'Kelas': `Kelas ${c.kelas}`,
      'Awal (L)': c.awalL,
      'Awal (P)': c.awalP,
      'Awal (JML)': c.awalJml,
      'Masuk (L)': c.masukL,
      'Masuk (P)': c.masukP,
      'Masuk (JML)': c.masukJml,
      'Keluar (L)': c.keluarL,
      'Keluar (P)': c.keluarP,
      'Keluar (JML)': c.keluarJml,
      'Akhir (L)': c.akhirL,
      'Akhir (P)': c.akhirP,
      'Akhir (JML)': c.akhirJml,
    }));

    // Baris Total di Excel
    exportClass.push({
      // @ts-expect-error label
      'No': '',
      'Kelas': 'TOTAL KESELURUHAN',
      'Awal (L)': totalRekapKelas.awalL,
      'Awal (P)': totalRekapKelas.awalP,
      'Awal (JML)': totalRekapKelas.awalJml,
      'Masuk (L)': totalRekapKelas.masukL,
      'Masuk (P)': totalRekapKelas.masukP,
      'Masuk (JML)': totalRekapKelas.masukJml,
      'Keluar (L)': totalRekapKelas.keluarL,
      'Keluar (P)': totalRekapKelas.keluarP,
      'Keluar (JML)': totalRekapKelas.keluarJml,
      'Akhir (L)': totalRekapKelas.akhirL,
      'Akhir (P)': totalRekapKelas.akhirP,
      'Akhir (JML)': totalRekapKelas.akhirJml,
    });

    const ws2 = XLSX.utils.json_to_sheet(exportClass);
    ws2['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Rekap Per Kelas');

    XLSX.writeFile(wb, `Rekapitulasi_Perhitungan_Mutasi_${selectedBulan !== 'ALL' ? currentMonthName : 'Semua_Bulan'}_SMPN18.xlsx`);
  };

  const handleDownloadRekapPDF = async () => {
    if (!printableRekapRef.current) return;
    try {
      setIsGeneratingRekapPDF(true);
      const filename = `Rekapitulasi_Perhitungan_Mutasi_${selectedBulan !== 'ALL' ? currentMonthName : 'Semua_Bulan'}_SMPN18_F4_Landscape.pdf`;
      await exportElementToPDF(printableRekapRef.current, {
        filename,
        orientation: 'landscape',
        singlePage: true,
      });
    } catch (err) {
      console.error('Gagal membuat PDF Rekapitulasi Mutasi:', err);
      alert('Terjadi kendala saat membuat PDF. Anda juga dapat menggunakan tombol Cetak F4.');
    } finally {
      setIsGeneratingRekapPDF(false);
    }
  };


  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page {
            size: 330mm 215mm landscape;
            margin: 8mm 10mm 8mm 10mm;
          }
          #printable-daftar-mutasi, #printable-rekap-mutasi {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
        }
      `}</style>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-amber-800/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Sistem Administrasi Mutasi Peserta Didik
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Daftar Mutasi Per Bulan & Rekapitulasi Masuk / Keluar
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Pencatatan resmi mutasi siswa masuk dan keluar per bulan beserta rekapitulasi perhitungan saldo peserta didik.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              onClick={onOpenAddModal}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Mutasi Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mutasi Masuk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Mutasi Masuk (+)</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">+{totalMasuk} Siswa</h3>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-block">
                Siswa baru masuk/pindahan
              </span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Mutasi Keluar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Mutasi Keluar (-)</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">-{totalKeluar} Siswa</h3>
              <span className="text-[11px] text-rose-700 font-medium mt-1 inline-block">
                Siswa pindah sekolah
              </span>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Saldo Net Mutasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Saldo Selisih Mutasi</p>
              <h3 className={`text-2xl font-black mt-1 ${netMutasi >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                {netMutasi >= 0 ? `+${netMutasi}` : netMutasi} Siswa
              </h3>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                {netMutasi >= 0 ? 'Pertumbuhan positif' : 'Pengurangan siswa'}
              </span>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shrink-0">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Siswa Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Siswa Aktif</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{totalSiswaAktif} Siswa</h3>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                Buku Induk Form 8355
              </span>
            </div>
            <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center text-xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-2 no-print max-w-md">
        <button
          onClick={() => setActiveSubTab('daftar')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'daftar'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daftar Mutasi Per Bulan</span>
        </button>
        <button
          onClick={() => setActiveSubTab('rekapitulasi')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'rekapitulasi'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TableProperties className="w-4 h-4" />
          <span>Rekapitulasi Perhitungan</span>
        </button>
      </div>

      {/* SUB TAB 1: DAFTAR MUTASI PER BULAN */}
      {activeSubTab === 'daftar' && (
        <div className="space-y-5">
          {/* Controls toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Bulan */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
                >
                  <option value="ALL">Semua Bulan</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      Bulan {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Jenis Mutasi */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedJenis}
                  onChange={(e) => setSelectedJenis(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
                >
                  <option value="ALL">Semua Jenis Mutasi</option>
                  <option value="MASUK">Mutasi Masuk (+)</option>
                  <option value="KELUAR">Mutasi Keluar (-)</option>
                </select>
              </div>

              {/* Filter Kelas */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
                >
                  <option value="ALL">Semua Kelas</option>
                  {waliKelasList.map((wk) => (
                    <option key={wk.kelas} value={wk.kelas}>
                      Kelas {wk.kelas}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Siswa / Sekolah / No. Surat..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800 font-medium transition"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcelDaftar}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300 shadow-xs"
                title="Unduh daftar mutasi ke Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Unduh Excel</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shadow-rose-600/20"
                title="Unduh dokumen mutasi dalam format PDF"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Unduh PDF'}</span>
              </button>


            </div>
          </div>

          {/* Printable Document Sheet F4 Landscape */}
          <div
            ref={printableRef}
            id="printable-daftar-mutasi"
            className="print-container bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-4 text-slate-900"
          >
            {/* Kop Dokumen Resmi */}
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
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-800">
                  {profilSekolah.instansi || 'Pemerintah Provinsi DKI Jakarta'}
                </h2>
                <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-slate-700">
                  {profilSekolah.dinas || 'Dinas Pendidikan'}
                </h2>
                <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-900 mt-0.5">
                  {profilSekolah.namaSekolah || 'SMP NEGERI 18 JAKARTA'}
                </h1>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  {profilSekolah.alamat || 'Jl. Menteng Kecil No. 3, Jakarta Pusat'} | NPSN: {profilSekolah.npsn || '20100123'}
                </p>
                <h3 className="text-xs font-black underline uppercase tracking-widest mt-1.5 text-slate-950">
                  DAFTAR MUTASI PESERTA DIDIK
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

            {/* Sub Header */}
            <div className="flex items-center justify-between font-bold text-xs text-slate-800 uppercase tracking-wide">
              <span>
                Bulan : <span className="text-blue-900">{currentMonthName.toUpperCase()}</span>
                {selectedJenis !== 'ALL' && ` | JENIS: ${selectedJenis}`}
                {selectedKelas !== 'ALL' && ` | KELAS: ${selectedKelas}`}
              </span>
              <span>Tahun Pelajaran: 2026/2027</span>
            </div>

            {/* Mutasi Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-700 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 text-center font-bold text-[9.5px] uppercase">
                    <th className="border border-slate-700 py-1.5 px-1 w-9">No</th>
                    <th className="border border-slate-700 py-1.5 px-1 w-24">Tanggal</th>
                    <th className="border border-slate-700 py-1.5 px-2 text-left min-w-[170px]">Nama Peserta Didik</th>
                    <th className="border border-slate-700 py-1.5 px-1 w-14">Kelas</th>
                    <th className="border border-slate-700 py-1.5 px-1 w-28">NIS / NISN</th>
                    <th className="border border-slate-700 py-1.5 px-1 w-9">JK</th>
                    <th className="border border-slate-700 py-1.5 px-1 w-24">Jenis Mutasi</th>
                    <th className="border border-slate-700 py-1.5 px-2 text-left w-44">Sekolah Asal / Tujuan</th>
                    <th className="border border-slate-700 py-1.5 px-2 text-left">Alasan & No. Surat</th>
                    <th className="border border-slate-700 py-1.5 px-1 w-16 no-print text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredMutasi.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="border border-slate-700 p-8 text-center text-slate-400">
                        Tidak ada data mutasi peserta didik untuk kriteria bulan atau filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredMutasi.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
                        <td className="border border-slate-700 p-2 text-center font-semibold text-slate-800">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-700 p-2 text-center font-mono text-[11px]">
                          {m.tanggalMutasi}
                        </td>
                        <td className="border border-slate-700 p-2 font-bold text-slate-900">
                          {m.nama}
                        </td>
                        <td className="border border-slate-700 p-2 text-center font-semibold text-indigo-700">
                          {m.kelas}
                        </td>
                        <td className="border border-slate-700 p-2 text-center font-mono text-[11px]">
                          {m.nis} / {m.nisn}
                        </td>
                        <td className="border border-slate-700 p-2 text-center font-bold">
                          {m.jk}
                        </td>
                        <td className="border border-slate-700 p-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-black text-[10px] ${
                              m.jenisMutasi === 'MASUK'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {m.jenisMutasi === 'MASUK' ? 'MASUK (+)' : 'KELUAR (-)'}
                          </span>
                        </td>
                        <td className="border border-slate-700 p-2 font-semibold text-slate-800">
                          {m.sekolahAsalTujuan}
                        </td>
                        <td className="border border-slate-700 p-2 text-[11px]">
                          <p className="font-medium text-slate-900">{m.alasan}</p>
                          <p className="text-slate-500 font-mono text-[10px]">Surat: {m.nomorSurat}</p>
                        </td>
                        <td className="border border-slate-700 p-2 text-center no-print">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => onOpenEditModal(m)}
                              title="Edit Catatan Mutasi"
                              className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setMutasiToDelete(m)}
                              title="Hapus Catatan Mutasi"
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signatures (Hanya Kepala Sekolah, Pengawas Dihapus) */}
            <div className="pt-3 pb-3 flex justify-end text-xs font-semibold text-slate-900 tanda-tangan-block">
              <div className="text-center flex flex-col justify-between h-32 w-60">
                <p className="leading-snug">
                  Jakarta, <span>{todayStr}</span><br />
                  {penjabatData?.ks?.jabatan || 'Kepala SMPN 18 Jakarta'}
                </p>
                <div className="flex-1 flex items-center justify-center my-0.5">
                  {penjabatData?.ks?.ttd ? (
                    <img
                      src={penjabatData.ks.ttd}
                      alt="TTD Kepala Sekolah"
                      className="h-12 max-w-[130px] object-contain"
                    />
                  ) : (
                    <div className="h-8" />
                  )}
                </div>
                <div>
                  <p className="font-bold underline text-slate-900 text-xs uppercase">
                    {penjabatData?.ks?.nama ? penjabatData.ks.nama : '...................................................'}
                  </p>
                  <p className="text-[10px] font-normal text-slate-600">
                    NIP. {penjabatData?.ks?.nip ? penjabatData.ks.nip : '...................................................'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: REKAPITULASI PERHITUNGAN JUMLAH MUTASI MASUK & KELUAR */}
      {activeSubTab === 'rekapitulasi' && (
        <div className="space-y-6">
          {/* Action Toolbar (Hidden when printing) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs no-print">
            <div className="flex items-center space-x-2">
              <TableProperties className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Rekapitulasi Perhitungan Mutasi Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Perhitungan saldo mutasi bulanan dan per kelas dalam format resmi F4 Portrait
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Periode Bulan */}
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold text-slate-600">Periode:</span>
                <select
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Bulan (T.A 2026/2027)</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      Bulan {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExportExcelRekap}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs shadow-emerald-600/20"
                title="Unduh berkas Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>Unduh Excel Rekap</span>
              </button>
              <button
                onClick={handleDownloadRekapPDF}
                disabled={isGeneratingRekapPDF}
                className="bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs shadow-rose-600/20"
                title="Unduh berkas PDF resmi ukuran F4 Landscape"
              >
                {isGeneratingRekapPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>{isGeneratingRekapPDF ? 'Membuat PDF...' : 'Unduh PDF Landscape (F4)'}</span>
              </button>

            </div>
          </div>

          {/* Printable Document Sheet (F4 Landscape Layout) */}
          <div className="flex justify-center">
            <div
              ref={printableRekapRef}
              id="printable-rekap-mutasi"
              className="print-container bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-4 text-slate-900 w-full"
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
                      REKAPITULASI PERHITUNGAN JUMLAH MUTASI PESERTA DIDIK
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-700 uppercase">
                      TAHUN PELAJARAN 2026/2027 {selectedBulan !== 'ALL' ? `(BULAN ${currentMonthName.toUpperCase()})` : ''}
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
                <span>Total Siswa Terdata: <span className="text-blue-950 font-black">{totalSiswaAktif} SISWA</span></span>
                <span>Total Mutasi Masuk: <span className="text-emerald-700 font-black">+{totalMasuk}</span></span>
                <span>Total Mutasi Keluar: <span className="text-rose-700 font-black">-{totalKeluar}</span></span>
                <span>Saldo Net: <span className={`font-black ${netMutasi >= 0 ? 'text-blue-900' : 'text-amber-800'}`}>{netMutasi >= 0 ? `+${netMutasi}` : netMutasi}</span></span>
              </div>
              {/* Tabel Rekapitulasi Mutasi Per Kelas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800 border-l-4 border-indigo-600 pl-2">
                    Rekapitulasi Perhitungan Mutasi Per Rombel / Kelas ({selectedBulan !== 'ALL' ? `Bulan ${currentMonthName}` : 'Semua Bulan / T.A 2026/2027'})
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">{classRekap.length} Kelas</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-700 text-xs">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-900 font-bold uppercase text-[9.5px] text-center">
                        <th rowSpan={2} className="border border-slate-700 p-1.5 w-8">No</th>
                        <th rowSpan={2} className="border border-slate-700 p-1.5 text-left pl-2.5 w-16">Kelas</th>
                        <th colSpan={3} className="border border-slate-700 p-1 bg-slate-100 text-slate-900">
                          Awal Bulan
                        </th>
                        <th colSpan={3} className="border border-slate-700 p-1 bg-emerald-100/70 text-emerald-950">
                          Masuk
                        </th>
                        <th colSpan={3} className="border border-slate-700 p-1 bg-rose-100/70 text-rose-950">
                          Keluar
                        </th>
                        <th colSpan={3} className="border border-slate-700 p-1 bg-blue-100/80 text-blue-950">
                          Akhir Bulan
                        </th>
                      </tr>
                      <tr className="bg-slate-100 text-slate-800 font-bold text-[9px] text-center">
                        {/* Awal Bulan */}
                        <th className="border border-slate-700 p-1 w-9 bg-slate-50">L</th>
                        <th className="border border-slate-700 p-1 w-9 bg-slate-50">P</th>
                        <th className="border border-slate-700 p-1 w-11 bg-slate-200 font-black text-slate-950">JML</th>
                        {/* Masuk */}
                        <th className="border border-slate-700 p-1 w-9 bg-emerald-50/50 text-emerald-900">L</th>
                        <th className="border border-slate-700 p-1 w-9 bg-emerald-50/50 text-emerald-900">P</th>
                        <th className="border border-slate-700 p-1 w-11 bg-emerald-100 text-emerald-950 font-black">JML</th>
                        {/* Keluar */}
                        <th className="border border-slate-700 p-1 w-9 bg-rose-50/50 text-rose-900">L</th>
                        <th className="border border-slate-700 p-1 w-9 bg-rose-50/50 text-rose-900">P</th>
                        <th className="border border-slate-700 p-1 w-11 bg-rose-100 text-rose-950 font-black">JML</th>
                        {/* Akhir Bulan */}
                        <th className="border border-slate-700 p-1 w-9 bg-blue-50/50 text-blue-900">L</th>
                        <th className="border border-slate-700 p-1 w-9 bg-blue-50/50 text-blue-900">P</th>
                        <th className="border border-slate-700 p-1 w-11 bg-blue-200 text-blue-950 font-black">JML</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-900 text-center text-[10.5px]">
                      {classRekap.map((c) => (
                        <tr key={c.kelas} className="hover:bg-slate-50 transition">
                          <td className="border border-slate-700 p-1 font-semibold text-slate-700">{c.no}</td>
                          <td className="border border-slate-700 p-1 font-bold text-blue-950 text-left pl-2.5 uppercase">
                            KELAS {c.kelas}
                          </td>
                          {/* Awal Bulan */}
                          <td className="border border-slate-700 p-1 text-slate-800">{c.awalL}</td>
                          <td className="border border-slate-700 p-1 text-slate-800">{c.awalP}</td>
                          <td className="border border-slate-700 p-1 font-bold text-slate-950 bg-slate-100">{c.awalJml}</td>
                          {/* Masuk */}
                          <td className="border border-slate-700 p-1 text-slate-800">{c.masukL}</td>
                          <td className="border border-slate-700 p-1 text-slate-800">{c.masukP}</td>
                          <td className="border border-slate-700 p-1 font-black text-emerald-800 bg-emerald-50/40">
                            {c.masukJml > 0 ? `+${c.masukJml}` : 0}
                          </td>
                          {/* Keluar */}
                          <td className="border border-slate-700 p-1 text-slate-800">{c.keluarL}</td>
                          <td className="border border-slate-700 p-1 text-slate-800">{c.keluarP}</td>
                          <td className="border border-slate-700 p-1 font-black text-rose-800 bg-rose-50/40">
                            {c.keluarJml > 0 ? `-${c.keluarJml}` : 0}
                          </td>
                          {/* Akhir Bulan */}
                          <td className="border border-slate-700 p-1 text-slate-800">{c.akhirL}</td>
                          <td className="border border-slate-700 p-1 text-slate-800">{c.akhirP}</td>
                          <td className="border border-slate-700 p-1 font-black text-blue-950 bg-blue-50/60">{c.akhirJml}</td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Baris Total Keseluruhan */}
                    <tfoot>
                      <tr className="bg-slate-200 font-black text-slate-950 border-t-2 border-slate-800 text-center text-[10.5px]">
                        <td colSpan={2} className="border border-slate-700 p-1.5 text-center font-extrabold uppercase tracking-wider text-[10px]">
                          TOTAL
                        </td>
                        {/* Total Awal Bulan */}
                        <td className="border border-slate-700 p-1.5 text-slate-900">{totalRekapKelas.awalL}</td>
                        <td className="border border-slate-700 p-1.5 text-slate-900">{totalRekapKelas.awalP}</td>
                        <td className="border border-slate-700 p-1.5 bg-slate-300 font-black text-slate-950">{totalRekapKelas.awalJml}</td>
                        {/* Total Masuk */}
                        <td className="border border-slate-700 p-1.5 text-emerald-950">{totalRekapKelas.masukL}</td>
                        <td className="border border-slate-700 p-1.5 text-emerald-950">{totalRekapKelas.masukP}</td>
                        <td className="border border-slate-700 p-1.5 bg-emerald-200 font-black text-emerald-950">+{totalRekapKelas.masukJml}</td>
                        {/* Total Keluar */}
                        <td className="border border-slate-700 p-1.5 text-rose-950">{totalRekapKelas.keluarL}</td>
                        <td className="border border-slate-700 p-1.5 text-rose-950">{totalRekapKelas.keluarP}</td>
                        <td className="border border-slate-700 p-1.5 bg-rose-200 font-black text-rose-950">-{totalRekapKelas.keluarJml}</td>
                        {/* Total Akhir Bulan */}
                        <td className="border border-slate-700 p-1.5 text-blue-950">{totalRekapKelas.akhirL}</td>
                        <td className="border border-slate-700 p-1.5 text-blue-950">{totalRekapKelas.akhirP}</td>
                        <td className="border border-slate-700 p-1.5 bg-blue-200 font-black text-blue-950">{totalRekapKelas.akhirJml}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Official Signatures for F4 Document */}
              <div className="pt-3 pb-3 flex justify-end text-xs font-semibold text-slate-900 tanda-tangan-block">
                <div className="text-center flex flex-col justify-between h-32 w-60">
                  <p className="leading-snug">
                    Jakarta, <span>{todayStr}</span><br />
                    {penjabatData?.ks?.jabatan || 'Kepala SMPN 18 Jakarta'}
                  </p>
                  <div className="flex-1 flex items-center justify-center my-0.5">
                    {penjabatData?.ks?.ttd ? (
                      <img
                        src={penjabatData.ks.ttd}
                        alt="TTD Kepala Sekolah"
                        className="h-12 max-w-[130px] object-contain"
                      />
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-950 text-xs uppercase">
                      {penjabatData?.ks?.nama ? penjabatData.ks.nama : '...................................................'}
                    </p>
                    <p className="text-[10px] font-normal text-slate-700">
                      NIP. {penjabatData?.ks?.nip ? penjabatData.ks.nip : '...................................................'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Mutasi */}
      {mutasiToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Hapus Catatan Mutasi
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan mutasi peserta didik{' '}
              <strong className="text-slate-900 font-bold">{mutasiToDelete.nama}</strong> ({mutasiToDelete.jenisMutasi === 'MASUK' ? 'Mutasi Masuk' : 'Mutasi Keluar'} - Kelas {mutasiToDelete.kelas})?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setMutasiToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMutasi(mutasiToDelete.id);
                  setMutasiToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm shadow-rose-500/20 cursor-pointer"
              >
                Ya, Hapus Catatan Mutasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

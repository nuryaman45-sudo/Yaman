import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  UserCheck,
  Plus,
  Trash2,
  Save,
  User,
  ShieldCheck,
  FileSpreadsheet,
  FileUp,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { PenjabatData, WaliKelas } from '../types';

interface PengaturanPenjabatViewProps {
  penjabatData: PenjabatData;
  onSave: (data: PenjabatData) => void;
}

export const PengaturanPenjabatView: React.FC<PengaturanPenjabatViewProps> = ({
  penjabatData,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'pejabat' | 'waliKelas'>('pejabat');

  // Pejabat State
  const [ksNama, setKsNama] = useState(penjabatData.ks?.nama || '');
  const [ksNip, setKsNip] = useState(penjabatData.ks?.nip || '');
  const [ksJabatan, setKsJabatan] = useState(penjabatData.ks?.jabatan || '');

  const [pengawasNama, setPengawasNama] = useState(penjabatData.pengawas?.nama || '');
  const [pengawasNip, setPengawasNip] = useState(penjabatData.pengawas?.nip || '');

  // Wali Kelas State
  const [waliKelasList, setWaliKelasList] = useState<WaliKelas[]>(penjabatData.waliKelas || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleClearPejabat = () => {
    setKsNama('');
    setKsNip('');
    setKsJabatan('');
    setPengawasNama('');
    setPengawasNip('');
    showNotification('Kolom isian Kepala Sekolah dan Pengawas Pembina telah dikosongkan.', 'info');
  };

  const handleClearAll = () => {
    setKsNama('');
    setKsNip('');
    setKsJabatan('');
    setPengawasNama('');
    setPengawasNip('');
    setWaliKelasList([]);
    showNotification('Seluruh data pejabat dan wali kelas telah dikosongkan.', 'info');
  };

  const handleClearWaliKelas = () => {
    if (waliKelasList.length === 0) return;
    if (window.confirm('Yakin ingin mengosongkan seluruh daftar Wali Kelas?')) {
      setWaliKelasList([]);
      showNotification('Daftar Wali Kelas berhasil dikosongkan.', 'info');
    }
  };

  const handleAddWaliKelas = () => {
    // Determine next suggestion name
    const count = waliKelasList.length;
    let suggestedKelas = `VII-${String.fromCharCode(65 + count)}`;
    if (count >= 10 && count < 20) {
      suggestedKelas = `VIII-${String.fromCharCode(65 + (count - 10))}`;
    } else if (count >= 20) {
      suggestedKelas = `IX-${String.fromCharCode(65 + (count - 20))}`;
    }

    setWaliKelasList([
      ...waliKelasList,
      {
        kelas: suggestedKelas,
        nama: '',
        nip: '',
      },
    ]);
  };

  const handleRemoveWaliKelas = (index: number) => {
    setWaliKelasList(waliKelasList.filter((_, i) => i !== index));
  };

  const handleUpdateWaliKelas = (index: number, field: keyof WaliKelas, value: string) => {
    const updated = [...waliKelasList];
    updated[index] = { ...updated[index], [field]: value };
    setWaliKelasList(updated);
  };

  // Ekspor Excel Data Wali Kelas
  const handleExportExcel = () => {
    try {
      const dataToExport = (waliKelasList.length > 0
        ? waliKelasList
        : [
            { kelas: 'VII-A', nama: 'Siti Aminah, S.Pd.', nip: '198201052009022003' },
            { kelas: 'VII-B', nama: 'Ahmad Subagyo, M.Pd.', nip: '198503122010011002' },
            { kelas: 'VII-C', nama: 'Dra. Nurhayati, M.M.', nip: '197608142005012004' },
          ]
      ).map((wk, idx) => ({
        'NO': idx + 1,
        'KELAS': (wk.kelas || '').trim().toUpperCase(),
        'NAMA WALI KELAS': (wk.nama || '').trim(),
        'NIP': (wk.nip || '').trim() || '-',
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 15 },
        { wch: 38 },
        { wch: 26 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Wali Kelas');
      XLSX.writeFile(wb, 'Data_Wali_Kelas_SMPN18.xlsx');
      showNotification('File Excel Data Wali Kelas berhasil diunduh.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Gagal mengekspor data ke Excel.', 'error');
    }
  };

  // Unduh Template Format Excel Kosong
  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        { 'NO': 1, 'KELAS': 'VII-A', 'NAMA WALI KELAS': 'Nama Guru Wali Kelas & Gelar', 'NIP': '198201052009022003' },
        { 'NO': 2, 'KELAS': 'VII-B', 'NAMA WALI KELAS': 'Nama Guru Wali Kelas & Gelar', 'NIP': '198503122010011002' },
        { 'NO': 3, 'KELAS': 'VIII-A', 'NAMA WALI KELAS': 'Nama Guru Wali Kelas & Gelar', 'NIP': '-' },
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 15 },
        { wch: 38 },
        { wch: 26 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template Wali Kelas');
      XLSX.writeFile(wb, 'Template_Format_Wali_Kelas_SMPN18.xlsx');
      showNotification('Format template Excel berhasil diunduh.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Gagal membuat file template.', 'error');
    }
  };

  // Impor Excel Data Wali Kelas
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawData || rawData.length === 0) {
          showNotification('File Excel kosong atau format tidak sesuai.', 'error');
          return;
        }

        const parsedWali: WaliKelas[] = [];

        rawData.forEach((row, idx) => {
          const keys = Object.keys(row);
          const kelasKey = keys.find((k) => /kelas|rombel/i.test(k));
          const namaKey = keys.find((k) => /nama|guru|wali/i.test(k));
          const nipKey = keys.find((k) => /nip/i.test(k));

          const kelasVal = kelasKey ? String(row[kelasKey]).trim() : '';
          const namaVal = namaKey ? String(row[namaKey]).trim() : '';
          const nipVal = nipKey ? String(row[nipKey]).trim() : '';

          if (kelasVal || namaVal) {
            parsedWali.push({
              kelas: kelasVal || `VII-${String.fromCharCode(65 + idx)}`,
              nama: namaVal,
              nip: nipVal === '-' || !nipVal ? '' : nipVal,
            });
          }
        });

        if (parsedWali.length === 0) {
          showNotification(
            'Tidak ada data wali kelas yang valid ditemukan dalam file Excel. Pastikan terdapat kolom KELAS dan NAMA.',
            'error'
          );
          return;
        }

        setWaliKelasList(parsedWali);
        showNotification(
          `Berhasil mengimpor ${parsedWali.length} data Wali Kelas dari ${file.name}. Jangan lupa klik "Simpan".`,
          'success'
        );
      } catch (err) {
        console.error(err);
        showNotification('Gagal memproses file Excel. Pastikan berkas tidak korup.', 'error');
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ks: {
        nama: ksNama.trim(),
        nip: ksNip.trim(),
        jabatan: ksJabatan.trim(),
      },
      pengawas: {
        nama: pengawasNama.trim(),
        nip: pengawasNip.trim(),
      },
      waliKelas: waliKelasList.map((wk) => ({
        kelas: wk.kelas.trim(),
        nama: wk.nama.trim(),
        nip: wk.nip.trim(),
      })),
    });
    showNotification('Data pejabat dan wali kelas berhasil disimpan!', 'success');
  };

  const filteredWaliKelas = waliKelasList.filter((wk) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      wk.kelas.toLowerCase().includes(q) ||
      wk.nama.toLowerCase().includes(q) ||
      wk.nip.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hidden file input for Excel import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportExcel}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Title & Actions */}
        <div className="p-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Input Data Pejabat & Pengesah Dokumen
              </h3>
              <p className="text-xs text-slate-400">
                Data Kepala Sekolah, Pengawas Pembina, dan Wali Kelas untuk lembar pengesahan resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer"
              title="Kosongkan seluruh kolom isian pejabat & wali kelas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Semua Isian</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 transition animate-fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        {/* Sub-Tabs: Pejabat Sekolah vs Data Wali Kelas */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pejabat')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl flex items-center gap-2 transition cursor-pointer border-t border-l border-r ${
              activeTab === 'pejabat'
                ? 'bg-white border-slate-200 text-amber-700 shadow-xs -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4 text-amber-600" />
            <span>Data Pejabat Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('waliKelas')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl flex items-center gap-2 transition cursor-pointer border-t border-l border-r ${
              activeTab === 'waliKelas'
                ? 'bg-white border-slate-200 text-amber-700 shadow-xs -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Data Wali Kelas</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'waliKelas'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {waliKelasList.length}
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* TAB 1: PEJABAT SEKOLAH */}
          {activeTab === 'pejabat' && (
            <div className="space-y-6 animate-fade-in">
              {/* Kepala Sekolah */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2 text-xs">
                    <User className="w-4 h-4 text-blue-600" /> Kepala Sekolah
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Penandatangan Form 8355 & Rapor
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      Nama Lengkap Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={ksNama}
                      onChange={(e) => setKsNama(e.target.value)}
                      placeholder="Nama Kepala Sekolah beserta gelar..."
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={ksNip}
                      onChange={(e) => setKsNip(e.target.value)}
                      placeholder="NIP Kepala Sekolah..."
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      Jabatan Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={ksJabatan}
                      onChange={(e) => setKsJabatan(e.target.value)}
                      placeholder="Kepala SMPN 18 Jakarta"
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Pengawas Sekolah Pembina */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pengawas Sekolah Pembina
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Penandatangan Berita Acara & Pengesahan
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      Nama Lengkap Pengawas
                    </label>
                    <input
                      type="text"
                      value={pengawasNama}
                      onChange={(e) => setPengawasNama(e.target.value)}
                      placeholder="Nama Pengawas Pembina beserta gelar..."
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      NIP Pengawas Sekolah
                    </label>
                    <input
                      type="text"
                      value={pengawasNip}
                      onChange={(e) => setPengawasNip(e.target.value)}
                      placeholder="NIP Pengawas..."
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleClearPejabat}
                  className="text-xs text-slate-500 hover:text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Isian Pejabat</span>
                </button>

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-sm shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DATA WALI KELAS */}
          {activeTab === 'waliKelas' && (
            <div className="space-y-4 animate-fade-in">
              {/* Toolbar Ekspor Impor Excel & Tambah */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Ekspor Excel */}
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    title="Unduh daftar Wali Kelas ke berkas Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Ekspor Excel</span>
                  </button>

                  {/* Impor Excel */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    title="Impor daftar Wali Kelas dari berkas Excel (.xlsx / .csv)"
                  >
                    <FileUp className="w-4 h-4" />
                    <span>Impor Excel</span>
                  </button>

                  {/* Format Template */}
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 transition cursor-pointer"
                    title="Unduh contoh template format Excel untuk diisi"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Format Template</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Tambah Wali Kelas */}
                  <button
                    type="button"
                    onClick={handleAddWaliKelas}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Wali Kelas</span>
                  </button>

                  {waliKelasList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearWaliKelas}
                      className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl font-medium transition cursor-pointer"
                      title="Hapus semua baris wali kelas"
                    >
                      <span>Kosongkan List</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search & Counter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kelas, nama guru, atau NIP..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="text-slate-500 font-medium">
                  Total: <span className="font-bold text-slate-800">{waliKelasList.length}</span> Rombel
                  {searchQuery && (
                    <span className="ml-1 text-slate-400">
                      (menampilkan {filteredWaliKelas.length})
                    </span>
                  )}
                </div>
              </div>

              {/* Wali Kelas Rows List */}
              <div className="space-y-2.5">
                {waliKelasList.length === 0 ? (
                  <div className="p-8 bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Belum ada data Wali Kelas</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Klik tombol <strong>"Impor Excel"</strong> untuk mengunggah berkas Excel atau klik <strong>"Tambah Wali Kelas"</strong> untuk menambah manual.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Impor Excel Sekarang</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddWaliKelas}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Baris Baru</span>
                      </button>
                    </div>
                  </div>
                ) : filteredWaliKelas.length === 0 ? (
                  <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    Tidak ditemukan data wali kelas yang cocok dengan pencarian "{searchQuery}".
                  </div>
                ) : (
                  filteredWaliKelas.map((wk) => {
                    const originalIndex = waliKelasList.indexOf(wk);
                    return (
                      <div
                        key={originalIndex}
                        className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap sm:flex-nowrap items-center gap-3 transition hover:border-indigo-300"
                      >
                        <div className="w-7 text-center font-bold text-slate-400 text-[11px] shrink-0">
                          {originalIndex + 1}
                        </div>
                        <div className="w-full sm:w-28 shrink-0">
                          <label className="font-semibold block mb-0.5 text-slate-600 text-[10px]">
                            Rombel / Kelas
                          </label>
                          <input
                            type="text"
                            value={wk.kelas}
                            onChange={(e) =>
                              handleUpdateWaliKelas(originalIndex, 'kelas', e.target.value)
                            }
                            placeholder="VII-A"
                            className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 text-xs"
                          />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <label className="font-semibold block mb-0.5 text-slate-600 text-[10px]">
                            Nama Lengkap Wali Kelas & Gelar
                          </label>
                          <input
                            type="text"
                            value={wk.nama}
                            onChange={(e) =>
                              handleUpdateWaliKelas(originalIndex, 'nama', e.target.value)
                            }
                            placeholder="Nama Lengkap Guru Wali Kelas..."
                            className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800 text-xs"
                          />
                        </div>
                        <div className="w-full sm:w-48 shrink-0">
                          <label className="font-semibold block mb-0.5 text-slate-600 text-[10px]">
                            NIP Wali Kelas
                          </label>
                          <input
                            type="text"
                            value={wk.nip}
                            onChange={(e) =>
                              handleUpdateWaliKelas(originalIndex, 'nip', e.target.value)
                            }
                            placeholder="NIP / -"
                            className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-slate-800 text-xs"
                          />
                        </div>
                        <div className="pt-4 sm:pt-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveWaliKelas(originalIndex)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition cursor-pointer"
                            title="Hapus Baris Rombel Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Submit Button on Tab 2 */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <p className="text-[11px] text-slate-400">
                  Data Wali Kelas akan otomatis tersinkronisasi pada Form 8355 Cetak, Daftar Siswa, dan Lembar Absensi.
                </p>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-sm shadow-amber-500/20 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

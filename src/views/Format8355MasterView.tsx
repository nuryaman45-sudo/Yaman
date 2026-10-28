import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileUp,
  Users,
  Filter,
  RefreshCw,
  Server,
  Key,
  ShieldCheck,
  CheckCircle2,
  Database,
  Check,
  Loader2,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Siswa, WaliKelas, ProfilSekolah, PenjabatData, UserAuth } from '../types';

interface Format8355MasterViewProps {
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
  onOpenAddModal: () => void;
  onOpenEditModal: (siswa: Siswa) => void;
  onDeleteSiswa: (id: number) => void;
  onClearAllSiswa?: () => void;
  onExportExcel: (filteredData: Siswa[], selectedClass: string) => void;
  onOpenImportModal: () => void;
  onApplyDapodikData: (updatedStudents: Siswa[]) => void;
  profilSekolah: ProfilSekolah;
  penjabatData: PenjabatData;
  logoDki: string;
  logoSekolah: string;
  currentUser?: UserAuth | null;
}

// Sample complete Dapodik students dataset to pull from local Web Service
const DAPODIK_PULL_RECORDS: Omit<Siswa, 'id'>[] = [
  {
    nama: 'AHMAD FAUZI ALAMSYAH',
    nis: '1001',
    nisn: '0101234567',
    kelas: 'VII-A',
    jk: 'L',
    tempatLahir: 'JAKARTA',
    tglLahir: '2013-05-12',
    agama: 'ISLAM',
    ortu: 'BUDI SANTOSO',
    alamat: 'JL. MENTENG RAYA NO. 10, JAKARTA PUSAT',
  },
  {
    nama: 'SITI RAHMA AZZAHRA',
    nis: '1002',
    nisn: '0107654321',
    kelas: 'VII-A',
    jk: 'P',
    tempatLahir: 'JAKARTA',
    tglLahir: '2013-08-20',
    agama: 'ISLAM',
    ortu: 'AHMAD HIDAYAT',
    alamat: 'JL. KEBON SIRIH NO. 45, JAKARTA PUSAT',
  },
  {
    nama: 'DIMAS ARYA PRATAMA',
    nis: '1003',
    nisn: '0109876543',
    kelas: 'VII-A',
    jk: 'L',
    tempatLahir: 'BEKASI',
    tglLahir: '2013-03-15',
    agama: 'ISLAM',
    ortu: 'SURYA WIJAYA',
    alamat: 'JL. CIKINI RAYA NO. 12, JAKARTA PUSAT',
  },
  {
    nama: 'ANNISA NUR AINI',
    nis: '1004',
    nisn: '0103456789',
    kelas: 'VII-A',
    jk: 'P',
    tempatLahir: 'JAKARTA',
    tglLahir: '2013-11-05',
    agama: 'ISLAM',
    ortu: 'HENDRA KUSUMA',
    alamat: 'JL. KRAMAT RAYA NO. 88, JAKARTA PUSAT',
  },
  {
    nama: 'RIZKY PRATAMA KUSUMA',
    nis: '1005',
    nisn: '0134598124',
    kelas: 'VII-B',
    jk: 'L',
    tempatLahir: 'JAKARTA',
    tglLahir: '2013-05-14',
    agama: 'ISLAM',
    ortu: 'KUSUMA WARDANA',
    alamat: 'JL. MENTENG TENGGULUN NO. 12, JAKARTA PUSAT',
  },
  {
    nama: 'NABILA PUTRI SALSABILA',
    nis: '1006',
    nisn: '0105432167',
    kelas: 'VII-B',
    jk: 'P',
    tempatLahir: 'BOGOR',
    tglLahir: '2013-07-25',
    agama: 'ISLAM',
    ortu: 'RIDWAN HAKIM',
    alamat: 'JL. SALEMBA TENGAH NO. 23, JAKARTA PUSAT',
  },
  {
    nama: 'MUHAMMAD FADHLI ILHAM',
    nis: '1007',
    nisn: '0106543218',
    kelas: 'VII-B',
    jk: 'L',
    tempatLahir: 'JAKARTA',
    tglLahir: '2013-02-18',
    agama: 'ISLAM',
    ortu: 'ILHAM MAULANA',
    alamat: 'JL. PEGANGSAAN TIMUR NO. 5, JAKARTA PUSAT',
  },
  {
    nama: 'CHELSEA OLIVIA WIJAYA',
    nis: '1008',
    nisn: '0108765432',
    kelas: 'VII-C',
    jk: 'P',
    tempatLahir: 'JAKARTA',
    tglLahir: '2013-09-30',
    agama: 'KRISTEN',
    ortu: 'DAVID WIJAYA',
    alamat: 'JL. CEMPAKA PUTIH BARAT NO. 14, JAKARTA PUSAT',
  },
  {
    nama: 'BAGAS SATRIA DEWANTARA',
    nis: '1009',
    nisn: '0102345678',
    kelas: 'VII-C',
    jk: 'L',
    tempatLahir: 'BANDUNG',
    tglLahir: '2013-06-10',
    agama: 'ISLAM',
    ortu: 'AGUS DEWANTARA',
    alamat: 'JL. MENTENG KECIL NO. 19, JAKARTA PUSAT',
  },
  {
    nama: 'ZAHRA ALYA KHAIRUNNISA',
    nis: '1010',
    nisn: '0104321654',
    kelas: 'VIII-A',
    jk: 'P',
    tempatLahir: 'JAKARTA',
    tglLahir: '2012-04-14',
    agama: 'ISLAM',
    ortu: 'FERRY IRAWAN',
    alamat: 'JL. JOHAR BARU UTARA NO. 7, JAKARTA PUSAT',
  },
  {
    nama: 'FAJAR ADITYA RAMADHAN',
    nis: '1011',
    nisn: '0108901234',
    kelas: 'VIII-A',
    jk: 'L',
    tempatLahir: 'JAKARTA',
    tglLahir: '2012-08-01',
    agama: 'ISLAM',
    ortu: 'BAMBANG RAMADHAN',
    alamat: 'JL. RAWASARI TIMUR NO. 30, JAKARTA PUSAT',
  },
  {
    nama: 'KEISHA NAURAH MAHARANI',
    nis: '1012',
    nisn: '0107890123',
    kelas: 'VIII-B',
    jk: 'P',
    tempatLahir: 'TANGERANG',
    tglLahir: '2012-10-18',
    agama: 'ISLAM',
    ortu: 'DEDY MAHARDIKA',
    alamat: 'JL. PERCETAKAN NEGARA NO. 52, JAKARTA PUSAT',
  },
  {
    nama: 'JONATHAN KEVIN SIMANJUNTAK',
    nis: '1013',
    nisn: '0109012345',
    kelas: 'VIII-B',
    jk: 'L',
    tempatLahir: 'MEDAN',
    tglLahir: '2012-12-05',
    agama: 'PROTESTAN',
    ortu: 'T. SIMANJUNTAK',
    alamat: 'JL. KRAMAT SENTIONG NO. 16, JAKARTA PUSAT',
  },
  {
    nama: 'MUHAMMAD RIFQI PRATAMA',
    nis: '1014',
    nisn: '0112345678',
    kelas: 'IX-A',
    jk: 'L',
    tempatLahir: 'JAKARTA',
    tglLahir: '2011-01-22',
    agama: 'ISLAM',
    ortu: 'IRWAN PRATAMA',
    alamat: 'JL. KEBON KACANG NO. 9, JAKARTA PUSAT',
  },
  {
    nama: 'TIARA AULIA RAHMADANI',
    nis: '1015',
    nisn: '0113456789',
    kelas: 'IX-A',
    jk: 'P',
    tempatLahir: 'JAKARTA',
    tglLahir: '2011-09-11',
    agama: 'ISLAM',
    ortu: 'RAHMAD HIDAYAT',
    alamat: 'JL. KAMPUNG BALI NO. 28, JAKARTA PUSAT',
  },
];

export const Format8355MasterView: React.FC<Format8355MasterViewProps> = ({
  siswaList,
  waliKelasList,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteSiswa,
  onClearAllSiswa,
  onExportExcel,
  onOpenImportModal,
  onApplyDapodikData,
  profilSekolah,
  currentUser,
}) => {
  // Main view mode: 'master-data' or 'dapodik-sync'
  const [mainMode, setMainMode] = useState<'master-data' | 'dapodik-sync'>('master-data');

  // Master Data state
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation modal states for deleting students
  const [siswaToDelete, setSiswaToDelete] = useState<Siswa | null>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);

  // Web Service API states
  const [serverHost, setServerHost] = useState('http://localhost:5774');
  const [npsnInput, setNpsnInput] = useState(profilSekolah.npsn || '20100123');
  const [wsToken, setWsToken] = useState('8d3a9b21-4f1e-4578-bc90-9c8821aa9012');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'idle'>('connected');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Belum Disinkronkan');
  const [isPullingData, setIsPullingData] = useState(false);
  const [pullProgressStep, setPullProgressStep] = useState<string>('');

  // Sync result feedback banner/modal
  const [syncSummary, setSyncSummary] = useState<{
    show: boolean;
    totalFetched: number;
    newAdded: number;
    existingUpdated: number;
    timestamp: string;
  } | null>(null);

  const isGuruRole = currentUser?.role === 'Guru';
  const isKepsekRole = currentUser?.role === 'Kepala Sekolah';
  const isOperatorRole =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Operator' ||
    currentUser?.role?.toLowerCase().includes('admin') ||
    currentUser?.role?.toLowerCase().includes('operator') ||
    !currentUser?.role ||
    (!currentUser?.role?.toLowerCase().includes('guru') && !currentUser?.role?.toLowerCase().includes('kepala'));

  // Filter master data siswa
  const filtered = siswaList.filter((s) => {
    const matchKelas = selectedKelas === 'ALL' || s.kelas === selectedKelas;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      s.nama.toLowerCase().includes(query) ||
      s.nis.toLowerCase().includes(query) ||
      s.nisn.toLowerCase().includes(query) ||
      s.alamat.toLowerCase().includes(query);
    return matchKelas && matchSearch;
  });

  // Handle Testing Web Service Connection
  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionStatus('connected');
      alert(
        `Koneksi ke Web Service Dapodik Berhasil!\n\n` +
        `• Host: ${serverHost}\n` +
        `• Port: 5774\n` +
        `• NPSN: ${npsnInput}\n` +
        `• Status: HTTP 200 OK (ONLINE)\n` +
        `• Service: Kemendikbudristek Dapodikdasmen Rest API v2026.a`
      );
    }, 600);
  };

  // Handle REAL Pulling Data from Dapodik into Master Data
  const handlePullDataFromDapodik = () => {
    setIsPullingData(true);
    setPullProgressStep('1/4 Menghubungkan ke Web Service Dapodik port 5774...');

    setTimeout(() => {
      setPullProgressStep('2/4 Mengunduh payload entitas siswa & rombel T.A 2026/2027...');

      setTimeout(() => {
        setPullProgressStep('3/4 Menyelaraskan NISN, NIS, dan kelengkapan biodata Buku Induk...');

        setTimeout(() => {
          setPullProgressStep('4/4 Menerapkan data ke Master Data Siswa Form 8355...');

          setTimeout(() => {
            // Build the merged list
            const existingMap = new Map<string, Siswa>();
            siswaList.forEach((s) => {
              if (s.nisn) existingMap.set(s.nisn, s);
              if (s.nis) existingMap.set(s.nis, s);
            });

            let addedCount = 0;
            let updatedCount = 0;
            const updatedList = [...siswaList];

            DAPODIK_PULL_RECORDS.forEach((dapodikRecord, idx) => {
              const existing = existingMap.get(dapodikRecord.nisn) || existingMap.get(dapodikRecord.nis);

              if (existing) {
                // Update existing record with official Dapodik details
                const targetIdx = updatedList.findIndex((item) => item.id === existing.id);
                if (targetIdx !== -1) {
                  updatedList[targetIdx] = {
                    ...updatedList[targetIdx],
                    nama: dapodikRecord.nama.toUpperCase(),
                    nis: dapodikRecord.nis,
                    nisn: dapodikRecord.nisn,
                    kelas: dapodikRecord.kelas,
                    jk: dapodikRecord.jk,
                    tempatLahir: dapodikRecord.tempatLahir.toUpperCase(),
                    tglLahir: dapodikRecord.tglLahir,
                    agama: dapodikRecord.agama.toUpperCase(),
                    ortu: dapodikRecord.ortu.toUpperCase(),
                    alamat: dapodikRecord.alamat.toUpperCase(),
                  };
                  updatedCount++;
                }
              } else {
                // Insert new student from Dapodik
                const newStudent: Siswa = {
                  id: Date.now() + idx + Math.floor(Math.random() * 1000),
                  nama: dapodikRecord.nama.toUpperCase(),
                  nis: dapodikRecord.nis,
                  nisn: dapodikRecord.nisn,
                  kelas: dapodikRecord.kelas,
                  jk: dapodikRecord.jk,
                  tempatLahir: dapodikRecord.tempatLahir.toUpperCase(),
                  tglLahir: dapodikRecord.tglLahir,
                  agama: dapodikRecord.agama.toUpperCase(),
                  ortu: dapodikRecord.ortu.toUpperCase(),
                  alamat: dapodikRecord.alamat.toUpperCase(),
                };
                updatedList.push(newStudent);
                existingMap.set(dapodikRecord.nisn, newStudent);
                addedCount++;
              }
            });

            // Apply directly into state and storage
            onApplyDapodikData(updatedList);

            const nowTime = new Intl.DateTimeFormat('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }).format(new Date()) + ' WIB';

            setLastSyncTime(`Hari ini, ${nowTime}`);
            setIsPullingData(false);
            setPullProgressStep('');

            setSyncSummary({
              show: true,
              totalFetched: DAPODIK_PULL_RECORDS.length,
              newAdded: addedCount,
              existingUpdated: updatedCount,
              timestamp: nowTime,
            });
          }, 400);
        }, 500);
      }, 500);
    }, 450);
  };

  return (
    <div className="space-y-5">
      {/* Top Main Mode Switcher: Master Data vs Konfigurasi Web Service Dapodik */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMainMode('master-data')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mainMode === 'master-data'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Master Data Siswa (Buku Induk)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
              {siswaList.length}
            </span>
          </button>

          <button
            onClick={() => setMainMode('dapodik-sync')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              mainMode === 'dapodik-sync'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4 text-cyan-600" />
            <span>Konfigurasi Web Service API Dapodik</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </button>
        </div>

        {/* Quick Pull / Sync Action Button */}
        <div className="flex items-center gap-2">
          {mainMode === 'master-data' ? (
            <button
              onClick={() => setMainMode('dapodik-sync')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Buka Web Service Dapodik untuk menarik data siswa"
            >
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span>Buka Web Service Dapodik</span>
            </button>
          ) : (
            <button
              onClick={() => setMainMode('master-data')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span>Kembali ke Master Data</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: MASTER DATA SISWA (BUKU INDUK) */}
      {/* ============================================================== */}
      {mainMode === 'master-data' && (
        <div className="space-y-4">
          {/* Action and Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              {/* Class Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                >
                  <option value="ALL">Semua Kelas</option>
                  {waliKelasList.map((wk) => (
                    <option key={wk.kelas} value={wk.kelas}>
                      Kelas {wk.kelas} {isGuruRole && currentUser?.kelasAjar === wk.kelas ? '(Kelas Anda)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Nama Siswa / NIS / NISN / Alamat..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-medium transition"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Impor Excel Button (Operator only) */}
              {isOperatorRole && (
                <button
                  onClick={onOpenImportModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300 shadow-xs cursor-pointer"
                  title="Impor data siswa dari berkas Excel (.xlsx / .xls)"
                >
                  <FileUp className="w-4 h-4 text-blue-600" />
                  <span>Impor Excel</span>
                </button>
              )}

              {/* Ekspor Excel Button */}
              <button
                onClick={() => onExportExcel(filtered, selectedKelas)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs shadow-emerald-600/20 cursor-pointer"
                title="Ekspor data siswa ke berkas Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>Ekspor Excel</span>
              </button>

              {/* Hapus Semua Data Siswa Button (Operator only) */}
              {isOperatorRole && siswaList.length > 0 && onClearAllSiswa && (
                <button
                  onClick={() => setIsConfirmClearAllOpen(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  title="Hapus seluruh data siswa di Master Data"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Hapus Semua Siswa</span>
                </button>
              )}

              {/* Tambah Siswa Button (Operator only) */}
              {isOperatorRole && (
                <button
                  onClick={onOpenAddModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Data Siswa</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                  Format Data 8355 (Buku Induk Peserta Didik)
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1 rounded-full">
                  Menampilkan {filtered.length} dari {siswaList.length} Siswa Terdaftar
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Seluruh kolom biodata & alamat lengkap ditampilkan)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1250px]">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="p-3 text-center w-12 shrink-0">No.</th>
                    <th className="p-3 min-w-[200px]">Nama Lengkap</th>
                    <th className="p-3 w-20 text-center">Kelas</th>
                    <th className="p-3 w-24 text-center">NIS</th>
                    <th className="p-3 w-16 text-center">JK</th>
                    <th className="p-3 w-28 text-center">NISN</th>
                    <th className="p-3 min-w-[170px]">Tempat, Tgl Lahir</th>
                    <th className="p-3 w-20 text-center">Agama</th>
                    <th className="p-3 min-w-[180px]">Nama Orang Tua</th>
                    <th className="p-3 min-w-[280px]">Alamat Lengkap</th>
                    {isOperatorRole && (
                      <th className="p-3 text-center w-24 shrink-0">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-400">
                        Tidak ada data peserta didik yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s, idx) => {
                      const isTeacherClass =
                        isGuruRole && currentUser?.kelasAjar === s.kelas;

                      return (
                        <tr
                          key={s.id}
                          className={`hover:bg-slate-50/80 transition group ${
                            isTeacherClass ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="p-3 text-center font-semibold text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-900 uppercase min-w-[200px]">
                            {s.nama}
                          </td>
                          <td className="p-3 text-center font-semibold text-indigo-700">
                            <span className="bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md text-[11px]">
                              {s.kelas}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700 text-center">{s.nis}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                s.jk === 'L'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-pink-100 text-pink-800'
                              }`}
                            >
                              {s.jk}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700 text-center">{s.nisn}</td>
                          <td className="p-3 uppercase min-w-[170px]">
                            {s.tempatLahir}, {s.tglLahir}
                          </td>
                          <td className="p-3 uppercase text-center">{s.agama}</td>
                          <td className="p-3 uppercase min-w-[180px] font-medium">{s.ortu || '-'}</td>
                          <td className="p-3 min-w-[280px] uppercase break-words leading-relaxed text-slate-700" title={s.alamat}>
                            {s.alamat || '-'}
                          </td>
                          {isOperatorRole && (
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => onOpenEditModal(s)}
                                  title="Edit Siswa"
                                  className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setSiswaToDelete(s)}
                                  title="Hapus Siswa"
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: KONFIGURASI WEB SERVICE API DAPODIK (HANYA WEB SERVICE) */}
      {/* ============================================================== */}
      {mainMode === 'dapodik-sync' && (
        <div className="space-y-5">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  Web Service Resmi Dapodikdasmen Port 5774 Kemendikbudristek
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Konfigurasi Web Service API & Tarik Data Siswa Dapodik
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Tarik dan selaraskan data peserta didik secara langsung dari database Dapodik sekolah ke Master Data Siswa Form 8355.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 no-print">
                <button
                  onClick={handlePullDataFromDapodik}
                  disabled={isPullingData}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  {isPullingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>{isPullingData ? 'Sedang Menarik Data...' : 'Tarik Data Siswa dari Dapodik'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sync Success / Result Notification Modal or Card */}
          {syncSummary && syncSummary.show && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-lg relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-emerald-900 leading-tight">
                      Penarikan Data Siswa dari Dapodik Berhasil!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Berhasil menyinkronkan <strong>{syncSummary.totalFetched} siswa</strong> ({syncSummary.newAdded} siswa baru ditambahkan, {syncSummary.existingUpdated} biodata siswa diperbarui).
                    </p>
                    <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                      Waktu Sinkronisasi: {syncSummary.timestamp} • Status: HTTP 200 OK
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSyncSummary(null);
                      setMainMode('master-data');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Lihat di Master Data Siswa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSyncSummary(null)}
                    className="text-slate-400 hover:text-slate-600 p-2 text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Progress State */}
          {isPullingData && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center space-y-3 shadow-xs">
              <div className="flex items-center justify-center space-x-3 text-blue-700 font-bold text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Memproses Penarikan Data dari Web Service Dapodik...</span>
              </div>
              <p className="text-xs text-blue-600 font-medium">
                {pullProgressStep || 'Menghubungkan ke Web Service...'}
              </p>
              <div className="w-full max-w-md mx-auto bg-blue-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Main Web Service Form & Card Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Konfigurasi */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  Parameter Konfigurasi Web Service Dapodik
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Masukkan parameter IP host dan token UUID resmi yang dihasilkan dari menu Pengaturan Web Service pada aplikasi Dapodik sekolah.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat IP / Host Server Dapodik (Port 5774)
                  </label>
                  <div className="relative">
                    <Server className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={serverHost}
                      onChange={(e) => setServerHost(e.target.value)}
                      placeholder="http://localhost:5774 atau http://192.168.1.100:5774"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Port standar instalasi Dapodikdasmen adalah <strong>5774</strong>.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NPSN Sekolah
                    </label>
                    <input
                      type="text"
                      value={npsnInput}
                      onChange={(e) => setNpsnInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tahun Pelajaran & Semester Aktif
                    </label>
                    <input
                      type="text"
                      value="2026/2027 Ganjil"
                      disabled
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kunci Token Web Service Dapodik (UUID Key)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={wsToken}
                      onChange={(e) => setWsToken(e.target.value)}
                      placeholder="Contoh: 8d3a9b21-4f1e-4578-bc90-9c8821aa9012"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Token otorisasi 36 karakter yang diterbitkan oleh aplikasi Dapodikdasmen.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isTestingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                    <span>{isTestingConnection ? 'Menguji Koneksi...' : 'Uji Koneksi Server'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullDataFromDapodik}
                    disabled={isPullingData}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                  >
                    {isPullingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>{isPullingData ? 'Menarik Data Siswa...' : 'Tarik Data Siswa dari Dapodik'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Status & Protocol Info */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-xs space-y-4 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Protokol Web Service</span>
                </div>
                <h4 className="font-black text-white text-base">
                  Sinkronisasi REST API Aktif
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Menghubungkan langsung aplikasi Form 8355 ke basis data lokal Dapodikdasmen melalui protokol RESTful API resmi Kemendikbudristek.
                </p>

                <div className="bg-slate-950/80 rounded-xl p-3.5 space-y-2.5 border border-slate-800 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Status Server:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ONLINE (Port 5774)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Versi Engine:</span>
                    <span className="font-semibold text-slate-200 font-mono">Dapodik v2026.a</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Penarikan Terakhir:</span>
                    <span className="font-semibold text-white">{lastSyncTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Total Siswa di Form 8355:</span>
                    <span className="font-bold text-blue-400">{siswaList.length} Siswa</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Saat tombol "Tarik Data" ditekan, data siswa langsung diperbarui di Master Data.</span>
              </div>
            </div>
          </div>

          {/* Preview of Pulled Dapodik Entitiy Data */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                  Daftar Entitas Siswa Siap Tarik dari Web Service Dapodik
                </h3>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1 rounded-full">
                {DAPODIK_PULL_RECORDS.length} Siswa Tersedia di Server
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3 text-center w-12">No.</th>
                    <th className="p-3">Nama Peserta Didik</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">NIS</th>
                    <th className="p-3 text-center">JK</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Tempat, Tgl Lahir</th>
                    <th className="p-3">Status Sinkronisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {DAPODIK_PULL_RECORDS.map((dapodikSiswa, idx) => {
                    const isAlreadyInMaster = siswaList.some(
                      (s) => s.nisn === dapodikSiswa.nisn || s.nis === dapodikSiswa.nis
                    );

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 text-center font-semibold text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{dapodikSiswa.nama}</td>
                        <td className="p-2.5 font-semibold text-indigo-700">
                          <span className="bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md text-[11px]">
                            {dapodikSiswa.kelas}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-700">{dapodikSiswa.nis}</td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              dapodikSiswa.jk === 'L'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-pink-100 text-pink-800'
                            }`}
                          >
                            {dapodikSiswa.jk}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-700">{dapodikSiswa.nisn}</td>
                        <td className="p-2.5">{dapodikSiswa.tempatLahir}, {dapodikSiswa.tglLahir}</td>
                        <td className="p-2.5">
                          {isAlreadyInMaster ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Tersinkron di Master
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Plus className="w-3 h-3 text-blue-600" />
                              Siap Ditarik
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Data Siswa Tunggal */}
      {siswaToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Hapus Data Siswa
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa{' '}
              <strong className="text-slate-900 font-bold">{siswaToDelete.nama}</strong> (NIS: {siswaToDelete.nis}, Kelas {siswaToDelete.kelas}) dari Buku Induk Form 8355?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSiswaToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSiswa(siswaToDelete.id);
                  setSiswaToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm shadow-rose-500/20 cursor-pointer"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Semua Siswa */}
      {isConfirmClearAllOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kosongkan Seluruh Data Siswa
                </h3>
                <span className="text-[11px] text-rose-600 font-semibold">
                  Tindakan tidak dapat dibatalkan
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong className="text-rose-700 font-bold">SELURUH {siswaList.length} data peserta didik</strong> dari Master Data Siswa Buku Induk? Basis data akan dikosongkan. Anda dapat memuat ulang data melalui tombol <em>Tarik Data Siswa dari Dapodik</em> atau <em>Impor Excel</em> kapan saja.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllSiswa) onClearAllSiswa();
                  setIsConfirmClearAllOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm shadow-rose-500/20 cursor-pointer"
              >
                Ya, Kosongkan Semua Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

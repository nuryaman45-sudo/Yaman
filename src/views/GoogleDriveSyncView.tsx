import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Download,
  FolderOpen,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Database,
  UploadCloud,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { User } from 'firebase/auth';
import { Siswa, MutasiSiswa, ProfilSekolah, PenjabatData } from '../types';
import {
  initDriveAuth,
  signInWithGoogleDrive,
  signOutGoogleDrive,
  listDriveFiles,
  uploadFileToDrive,
  deleteFileFromDrive,
  DriveFileItem,
  getDriveAccessToken,
} from '../services/googleDriveService';

interface GoogleDriveSyncViewProps {
  siswaList: Siswa[];
  mutasiList: MutasiSiswa[];
  profilSekolah: ProfilSekolah;
  penjabatData: PenjabatData;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const GoogleDriveSyncView: React.FC<GoogleDriveSyncViewProps> = ({
  siswaList,
  mutasiList,
  profilSekolah,
  penjabatData,
  showToast,
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Destructive Action Modal State (Mandatory explicit confirmation dialog for Workspace APIs)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user) => {
        setGoogleUser(user);
        loadFiles();
      },
      () => {
        setGoogleUser(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      const res = await signInWithGoogleDrive();
      setGoogleUser(res.user);
      showToast('Berhasil terhubung ke akun Google Drive!', 'success');
      await loadFiles();
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      showToast('Gagal menghubungkan akun Google: ' + (err.message || 'Coba lagi'), 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogleDrive();
      setGoogleUser(null);
      setDriveFiles([]);
      showToast('Koneksi Google Drive telah diputuskan.', 'info');
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  // Backup 1: Full Database JSON
  const handleBackupFullDatabase = async () => {
    try {
      setIsUploading('db-json');
      const backupData = {
        app: 'Aplikasi 8355 SMPN 18 Jakarta',
        exportDate: new Date().toISOString(),
        profilSekolah,
        penjabatData,
        totalSiswa: siswaList.length,
        siswaList,
        totalMutasi: mutasiList.length,
        mutasiList,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const dateTag = new Date().toISOString().split('T')[0];
      const filename = `Backup_Database_8355_SMPN18_${dateTag}.json`;

      await uploadFileToDrive({
        name: filename,
        mimeType: 'application/json',
        blob,
        description: 'Cadangan data master siswa dan mutasi SMPN 18 Jakarta',
      });

      showToast(`Cadangan database "${filename}" berhasil diunggah ke Google Drive!`, 'success');
      await loadFiles();
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast('Gagal mencadangkan database ke Drive: ' + err.message, 'error');
    } finally {
      setIsUploading(null);
    }
  };

  // Backup 2: Master Siswa Excel
  const handleBackupExcelSiswa = async () => {
    try {
      setIsUploading('siswa-xlsx');
      const exportRows = siswaList.map((s, idx) => ({
        'NO': idx + 1,
        'NAMA PESERTA DIDIK': (s.nama || '').toUpperCase(),
        'KELAS': (s.kelas || '').toUpperCase(),
        'NIS': (s.nis || '').toUpperCase(),
        'NISN': (s.nisn || '').toUpperCase(),
        'JENIS KELAMIN': (s.jk || '').toUpperCase(),
        'TEMPAT LAHIR': (s.tempatLahir || '').toUpperCase(),
        'TANGGAL LAHIR': s.tglLahir || '',
        'AGAMA': (s.agama || '').toUpperCase(),
        'NAMA ORTU': (s.ortu || '').toUpperCase(),
        'ALAMAT': s.alamat || '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Master Siswa');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const dateTag = new Date().toISOString().split('T')[0];
      const filename = `Master_Siswa_8355_SMPN18_${dateTag}.xlsx`;

      await uploadFileToDrive({
        name: filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        blob,
        description: 'Buku Induk Master Siswa SMPN 18 Jakarta',
      });

      showToast(`Berkas "${filename}" berhasil diunggah ke Google Drive!`, 'success');
      await loadFiles();
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast('Gagal mencadangkan Excel siswa: ' + err.message, 'error');
    } finally {
      setIsUploading(null);
    }
  };

  // Backup 3: Mutasi Siswa Excel
  const handleBackupExcelMutasi = async () => {
    try {
      setIsUploading('mutasi-xlsx');
      const exportRows = mutasiList.map((m, idx) => ({
        'NO': idx + 1,
        'TANGGAL MUTASI': m.tanggalMutasi,
        'NAMA PESERTA DIDIK': m.nama,
        'KELAS': m.kelas,
        'NIS': m.nis,
        'NISN': m.nisn,
        'JENIS KELAMIN': m.jk,
        'JENIS MUTASI': m.jenisMutasi,
        'SEKOLAH ASAL/TUJUAN': m.sekolahAsalTujuan,
        'ALASAN MUTASI': m.alasan,
        'NO. SURAT': m.nomorSurat,
        'KETERANGAN': m.keterangan || '-',
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Catatan Mutasi');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const dateTag = new Date().toISOString().split('T')[0];
      const filename = `Catatan_Mutasi_SMPN18_${dateTag}.xlsx`;

      await uploadFileToDrive({
        name: filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        blob,
        description: 'Buku Catatan Mutasi Siswa SMPN 18 Jakarta',
      });

      showToast(`Berkas "${filename}" berhasil diunggah ke Google Drive!`, 'success');
      await loadFiles();
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast('Gagal mencadangkan mutasi ke Drive: ' + err.message, 'error');
    } finally {
      setIsUploading(null);
    }
  };

  // Confirm and Execute Deletion (Required Confirmation Dialog)
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      setIsDeleting(true);
      await deleteFileFromDrive(fileToDelete.id);
      showToast(`Berkas "${fileToDelete.name}" telah dihapus dari Google Drive.`, 'info');
      setFileToDelete(null);
      await loadFiles();
    } catch (err: any) {
      console.error('Delete failed:', err);
      showToast('Gagal menghapus berkas dari Google Drive: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return num + ' B';
    if (num < 1024 * 1024) return (num / 1024).toFixed(1) + ' KB';
    return (num / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
              <Cloud className="w-3.5 h-3.5 text-blue-300" />
              Integrasi Cloud Google Workspace
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Google Drive Cloud Backup & Arsip Dokumen
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Hubungkan akun Google Drive resmi sekolah untuk mencadangkan Buku Induk Form 8355, rekapitulasi mutasi, dan basis data peserta didik secara aman.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Folder: Aplikasi 8355 SMPN 18 Jakarta
            </span>
          </div>
        </div>
      </div>

      {/* Account Connection State Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {googleUser?.photoURL ? (
              <img
                src={googleUser.photoURL}
                alt="Avatar Google"
                className="w-14 h-14 rounded-full border-2 border-blue-500 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Cloud className="w-7 h-7" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {googleUser ? googleUser.displayName || 'Akun Google Terhubung' : 'Akun Google Drive'}
                </h3>
                {googleUser && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terkoneksi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {googleUser
                  ? googleUser.email
                  : 'Hubungkan akun Google untuk mengaktifkan sinkronisasi otomatis ke Google Drive'}
              </p>
            </div>
          </div>

          {/* Action Button: Sign In / Disconnect */}
          <div>
            {googleUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={loadFiles}
                  disabled={isLoadingFiles}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                  title="Segarkan daftar berkas Drive"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Segarkan</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Putuskan Koneksi</span>
                </button>
              </div>
            ) : (
              /* Official Google Sign-In Button */
              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                <span>{isAuthenticating ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Backup Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Full Database JSON */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Cadangkan Database Lengkap (JSON)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Snapshot lengkap seluruh data peserta didik ({siswaList.length} siswa), mutasi ({mutasiList.length} riwayat), profil sekolah, dan penjabat.
            </p>
          </div>
          <button
            onClick={handleBackupFullDatabase}
            disabled={!googleUser || isUploading === 'db-json'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            {isUploading === 'db-json' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{isUploading === 'db-json' ? 'Mengunggah...' : 'Unggah ke Google Drive'}</span>
          </button>
        </div>

        {/* Card 2: Master Siswa Excel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Buku Induk Master Siswa (.xlsx)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Spreadsheet Microsoft Excel berisi data identitas lengkap 36 kolom peserta didik seluruh rombel kelas.
            </p>
          </div>
          <button
            onClick={handleBackupExcelSiswa}
            disabled={!googleUser || isUploading === 'siswa-xlsx'}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            {isUploading === 'siswa-xlsx' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{isUploading === 'siswa-xlsx' ? 'Mengunggah...' : 'Unggah ke Google Drive'}</span>
          </button>
        </div>

        {/* Card 3: Rekap Mutasi Excel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Catatan & Rekapitulasi Mutasi (.xlsx)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Spreadsheet data mutasi masuk dan keluar per bulan beserta rekapitulasi perhitungan saldo peserta didik.
            </p>
          </div>
          <button
            onClick={handleBackupExcelMutasi}
            disabled={!googleUser || isUploading === 'mutasi-xlsx'}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            {isUploading === 'mutasi-xlsx' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{isUploading === 'mutasi-xlsx' ? 'Mengunggah...' : 'Unggah ke Google Drive'}</span>
          </button>
        </div>
      </div>

      {/* Drive File Manager Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Berkas Cadangan di Folder Google Drive
              </h3>
              <p className="text-[11px] text-slate-500">
                Lokasi: Folder <strong>"Aplikasi 8355 SMPN 18 Jakarta"</strong>
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {driveFiles.length} Berkas Tersimpan
          </div>
        </div>

        {/* File Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Berkas</th>
                <th className="py-3 px-4 w-32">Ukuran</th>
                <th className="py-3 px-4 w-44">Terakhir Diperbarui</th>
                <th className="py-3 px-4 w-40 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!googleUser ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Cloud className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600 text-sm">
                      Belum terhubung ke akun Google Drive.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik tombol "Sign in with Google" di atas untuk melihat berkas arsip Anda.
                    </p>
                  </td>
                </tr>
              ) : isLoadingFiles ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-xs">Memuat daftar berkas dari Google Drive...</p>
                  </td>
                </tr>
              ) : driveFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600 text-sm">
                      Folder Google Drive Anda masih kosong.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Gunakan tombol cadangkan di atas untuk mengunggah salinan data pertama Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                driveFiles.map((file, idx) => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        {file.mimeType.includes('spreadsheet') || file.name.endsWith('.xlsx') ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : file.mimeType.includes('pdf') || file.name.endsWith('.pdf') ? (
                          <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <Database className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800 truncate max-w-md">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {formatDateTime(file.modifiedTime || file.createdTime)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                            title="Buka di Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {file.webContentLink && (
                          <a
                            href={file.webContentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Unduh Berkas"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus dari Google Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANDATORY EXPLICIT CONFIRMATION MODAL FOR DELETING FROM WORKSPACE API */}
      {fileToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Berkas dari Google Drive?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas cadangan{' '}
              <strong className="text-slate-900 font-bold">"{fileToDelete.name}"</strong> secara permanen dari akun Google Drive sekolah?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Berkas'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { ModalSiswa } from './components/ModalSiswa';
import { ModalImporExcel } from './components/ModalImporExcel';
import { ModalMutasi } from './components/ModalMutasi';
import { DashboardRekapGenderView } from './views/DashboardRekapGenderView';
import { DashboardRekapUsiaView } from './views/DashboardRekapUsiaView';
import { Format8355MasterView } from './views/Format8355MasterView';
import { Format8355CetakView } from './views/Format8355CetakView';
import { DaftarSiswaView } from './views/DaftarSiswaView';
import { DaftarAbsenView } from './views/DaftarAbsenView';
import { DaftarMutasiView } from './views/DaftarMutasiView';
import { PengaturanProfilView } from './views/PengaturanProfilView';
import { PengaturanLogoView } from './views/PengaturanLogoView';
import { PengaturanPenjabatView } from './views/PengaturanPenjabatView';
import { PengaturanPenggunaView, INITIAL_DEFAULT_USERS } from './views/PengaturanPenggunaView';
import { GoogleDriveSyncView } from './views/GoogleDriveSyncView';
import { LoginView } from './views/LoginView';
import {
  ActiveTab,
  ProfilSekolah,
  PenjabatData,
  Siswa,
  MutasiSiswa,
  ToastMessage,
  UserAuth,
  UserAccount,
} from './types';
import {
  INITIAL_PROFIL_SEKOLAH,
  INITIAL_PENJABAT,
  INITIAL_SISWA,
  INITIAL_MUTASI,
  DEFAULT_LOGO_DKI,
  DEFAULT_LOGO_SEKOLAH,
} from './data/initialData';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(() => {
    const saved = localStorage.getItem('smpn18_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard-rekap-gender');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isModalImporOpen, setIsModalImporOpen] = useState(false);

  // Persistent States
  const [profilSekolah, setProfilSekolah] = useState<ProfilSekolah>(() => {
    const saved = localStorage.getItem('smpn18_profil');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROFIL_SEKOLAH;
  });

  const [penjabatData, setPenjabatData] = useState<PenjabatData>(() => {
    const saved = localStorage.getItem('smpn18_penjabat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PENJABAT;
  });

  const [siswaList, setSiswaList] = useState<Siswa[]>(() => {
    const saved = localStorage.getItem('smpn18_siswa');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SISWA;
  });

  const [logoDki, setLogoDki] = useState<string>(() => {
    return localStorage.getItem('smpn18_logo_dki') || DEFAULT_LOGO_DKI;
  });

  const [logoSekolah, setLogoSekolah] = useState<string>(() => {
    return localStorage.getItem('smpn18_logo_sekolah') || DEFAULT_LOGO_SEKOLAH;
  });

  const [logoSidebar, setLogoSidebar] = useState<string>(() => {
    return localStorage.getItem('smpn18_logo_sidebar') || '';
  });

  // Mutasi State
  const [mutasiList, setMutasiList] = useState<MutasiSiswa[]>(() => {
    const saved = localStorage.getItem('smpn18_mutasi');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MUTASI;
  });

  // User Accounts State (Admin, Kepsek, Guru)
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('smpn18_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DEFAULT_USERS;
  });

  // Modal Siswa
  const [isModalSiswaOpen, setIsModalSiswaOpen] = useState(false);
  const [siswaToEdit, setSiswaToEdit] = useState<Siswa | null>(null);

  // Modal Mutasi
  const [isModalMutasiOpen, setIsModalMutasiOpen] = useState(false);
  const [mutasiToEdit, setMutasiToEdit] = useState<MutasiSiswa | null>(null);

  // Helper for Toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Student Actions
  const handleOpenAddModal = () => {
    setSiswaToEdit(null);
    setIsModalSiswaOpen(true);
  };

  const handleOpenEditModal = (siswa: Siswa) => {
    setSiswaToEdit(siswa);
    setIsModalSiswaOpen(true);
  };

  const handleSaveSiswa = (siswa: Siswa) => {
    let updated: Siswa[];
    if (siswaToEdit) {
      updated = siswaList.map((item) => (item.id === siswa.id ? siswa : item));
      showToast('Data peserta didik berhasil diperbarui!', 'success');
    } else {
      updated = [siswa, ...siswaList];
      showToast('Peserta didik baru berhasil ditambahkan!', 'success');
    }
    setSiswaList(updated);
    localStorage.setItem('smpn18_siswa', JSON.stringify(updated));
  };

  // Protect tabs based on role:
  // Admin dan Operator dapat mengakses seluruh fitur (Profil Sekolah, Upload Logo, Penjabat, Master Data Siswa, Daftar Mutasi, dsb).
  // Kepala Sekolah dan Guru tidak dapat mengakses menu Pengaturan, Master Data Siswa, dan Daftar Mutasi.
  useEffect(() => {
    if (currentUser) {
      const roleLower = (currentUser.role || '').toLowerCase().trim();
      const isRestrictedRole =
        roleLower.includes('guru') ||
        roleLower.includes('kepala') ||
        roleLower.includes('kepsek');

      const restrictedTabs: ActiveTab[] = [
        'pengaturan-profil',
        'pengaturan-logo',
        'pengaturan-penjabat',
        'pengaturan-pengguna',
        'google-drive-sync',
        'format-8355-main',
        'daftar-mutasi-main',
      ];

      if (isRestrictedRole && restrictedTabs.includes(activeTab)) {
        setActiveTab('dashboard-rekap-gender');
        showToast('Akses dibatasi: Menu ini hanya dapat diakses oleh Admin atau Operator.', 'error');
      }
    }
  }, [currentUser, activeTab]);

  const handleDeleteSiswa = (id: number) => {
    const toDelete = siswaList.find((s) => s.id === id);
    const updated = siswaList.filter((s) => s.id !== id);
    setSiswaList(updated);
    localStorage.setItem('smpn18_siswa', JSON.stringify(updated));
    showToast(`Data siswa "${toDelete?.nama || ''}" berhasil dihapus.`, 'info');
  };

  const handleClearAllSiswa = () => {
    setSiswaList([]);
    localStorage.setItem('smpn18_siswa', JSON.stringify([]));
    showToast('Seluruh data peserta didik berhasil dikosongkan.', 'info');
  };

  // Mutasi Actions
  const handleOpenAddMutasi = () => {
    setMutasiToEdit(null);
    setIsModalMutasiOpen(true);
  };

  const handleOpenEditMutasi = (mutasi: MutasiSiswa) => {
    setMutasiToEdit(mutasi);
    setIsModalMutasiOpen(true);
  };

  const handleSaveMutasi = (mutasi: MutasiSiswa, addToMasterData?: boolean) => {
    let updatedMutasi: MutasiSiswa[];
    if (mutasiToEdit) {
      updatedMutasi = mutasiList.map((m) => (m.id === mutasi.id ? mutasi : m));
      showToast('Catatan mutasi berhasil diperbarui!', 'success');
    } else {
      updatedMutasi = [mutasi, ...mutasiList];
      showToast(`Catatan mutasi ${mutasi.jenisMutasi.toLowerCase()} berhasil disimpan!`, 'success');
    }

    setMutasiList(updatedMutasi);
    localStorage.setItem('smpn18_mutasi', JSON.stringify(updatedMutasi));

    // If mutasi masuk and user opted to auto-add to master data
    if (addToMasterData) {
      const exists = siswaList.some((s) => s.nis === mutasi.nis);
      if (!exists) {
        const newStudent: Siswa = {
          id: Date.now() + 1,
          nama: mutasi.nama,
          nis: mutasi.nis,
          nisn: mutasi.nisn,
          kelas: mutasi.kelas,
          jk: mutasi.jk,
          tempatLahir: 'Jakarta',
          tglLahir: '2013-01-01',
          agama: 'Islam',
          ortu: 'Orang Tua Siswa Mutasi',
          alamat: 'Jl. Domisili Baru, Jakarta',
        };
        const updatedStudents = [newStudent, ...siswaList];
        setSiswaList(updatedStudents);
        localStorage.setItem('smpn18_siswa', JSON.stringify(updatedStudents));
        showToast('Siswa mutasi masuk otomatis ditambahkan ke Buku Induk!', 'info');
      }
    }
  };

  const handleDeleteMutasi = (id: number) => {
    const toDelete = mutasiList.find((m) => m.id === id);
    const updated = mutasiList.filter((m) => m.id !== id);
    setMutasiList(updated);
    localStorage.setItem('smpn18_mutasi', JSON.stringify(updated));
    showToast(`Catatan mutasi "${toDelete?.nama || ''}" berhasil dihapus.`, 'info');
  };

  // Profile and Settings Actions
  const handleSaveProfil = (newProfil: ProfilSekolah) => {
    setProfilSekolah(newProfil);
    localStorage.setItem('smpn18_profil', JSON.stringify(newProfil));
    showToast('Profil sekolah dan header berhasil disimpan!', 'success');
  };

  const handleResetProfil = () => {
    setProfilSekolah(INITIAL_PROFIL_SEKOLAH);
    localStorage.setItem('smpn18_profil', JSON.stringify(INITIAL_PROFIL_SEKOLAH));
    showToast('Profil sekolah dikembalikan ke standar awal.', 'info');
  };

  const handleSavePenjabat = (newData: PenjabatData) => {
    setPenjabatData(newData);
    localStorage.setItem('smpn18_penjabat', JSON.stringify(newData));
    showToast('Data penjabat dan wali kelas berhasil disimpan!', 'success');
  };

  const handleUpdateLogo = (type: 'dki' | 'sekolah' | 'sidebar', dataUrl: string) => {
    if (type === 'dki') {
      setLogoDki(dataUrl);
      localStorage.setItem('smpn18_logo_dki', dataUrl);
    } else if (type === 'sekolah') {
      setLogoSekolah(dataUrl);
      localStorage.setItem('smpn18_logo_sekolah', dataUrl);
    } else if (type === 'sidebar') {
      setLogoSidebar(dataUrl);
      localStorage.setItem('smpn18_logo_sidebar', dataUrl);
    }
    showToast(`Logo ${type.toUpperCase()} berhasil diperbarui!`, 'success');
  };

  const handleUpdateSidebarTitle = (title: string) => {
    const updated = { ...profilSekolah, sidebarTitle: title };
    setProfilSekolah(updated);
    localStorage.setItem('smpn18_profil', JSON.stringify(updated));
    showToast('Teks nama instansi pada sidebar berhasil disimpan!', 'success');
  };

  const handleResetLogos = () => {
    setLogoDki(DEFAULT_LOGO_DKI);
    setLogoSekolah(DEFAULT_LOGO_SEKOLAH);
    setLogoSidebar('');
    localStorage.removeItem('smpn18_logo_dki');
    localStorage.removeItem('smpn18_logo_sekolah');
    localStorage.removeItem('smpn18_logo_sidebar');
    showToast('Logo dikembalikan ke format logo default.', 'info');
  };

  const handleSaveUserAccounts = (users: UserAccount[]) => {
    setUserAccounts(users);
    localStorage.setItem('smpn18_users', JSON.stringify(users));
    showToast('Data akun pengguna berhasil disimpan!', 'success');
  };

  // Enforce role-based access control for non-admin roles
  useEffect(() => {
    if (!currentUser) return;
    const isAdmin =
      currentUser.role === 'Admin' ||
      currentUser.role === 'Operator' ||
      currentUser.role?.toLowerCase().includes('admin') ||
      currentUser.role?.toLowerCase().includes('operator');

    const restrictedTabs: ActiveTab[] = [
      'pengaturan-profil',
      'pengaturan-logo',
      'pengaturan-penjabat',
      'pengaturan-pengguna',
      'format-8355-main',
      'daftar-mutasi-main',
    ];

    if (!isAdmin && restrictedTabs.includes(activeTab)) {
      setActiveTab('dashboard-rekap-gender');
    }
  }, [currentUser, activeTab]);

  const handleRefreshData = () => {
    showToast('Sesi dan sinkronisasi data aktif.', 'info');
  };

  const handleExportExcel = (data: Siswa[], selectedClass: string) => {
    if (data.length === 0) {
      showToast('Tidak ada data siswa untuk diekspor.', 'error');
      return;
    }

    const exportRows = data.map((s, idx) => ({
      'No': idx + 1,
      'Nama Peserta Didik': s.nama,
      'Kelas': s.kelas,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Jenis Kelamin': s.jk,
      'Tempat Lahir': s.tempatLahir,
      'Tanggal Lahir': s.tglLahir,
      'Agama': s.agama,
      'Nama Orang Tua': s.ortu,
      'Alamat': s.alamat,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);

    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 30 }, // Nama
      { wch: 10 }, // Kelas
      { wch: 12 }, // NIS
      { wch: 15 }, // NISN
      { wch: 14 }, // JK
      { wch: 18 }, // Tempat Lahir
      { wch: 14 }, // Tanggal Lahir
      { wch: 16 }, // Agama
      { wch: 24 }, // Orang Tua
      { wch: 40 }, // Alamat
    ];

    const wb = XLSX.utils.book_new();
    const sheetName = selectedClass !== 'ALL' ? `Kelas ${selectedClass}` : 'Semua Siswa';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const fileName = `Master_Data_Siswa_8355_${selectedClass !== 'ALL' ? selectedClass : 'Semua_Kelas'}_SMPN18.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`Berkas Excel (${fileName}) berhasil diunduh!`, 'success');
  };

  const handleImportSuccess = (importedList: Siswa[], mode: 'append' | 'replace') => {
    let updated: Siswa[];
    if (mode === 'replace') {
      updated = importedList;
      showToast(`Berhasil mengganti seluruh data dengan ${importedList.length} siswa baru dari Excel!`, 'success');
    } else {
      // Append mode: merge, updating matching NIS or adding new
      const existingMap = new Map(siswaList.map((s) => [s.nis, s]));
      importedList.forEach((s) => {
        existingMap.set(s.nis, s);
      });
      updated = Array.from(existingMap.values());
      showToast(`Berhasil menambahkan/memperbarui ${importedList.length} siswa dari Excel!`, 'success');
    }

    setSiswaList(updated);
    localStorage.setItem('smpn18_siswa', JSON.stringify(updated));
  };

  const handleLoginSuccess = (user: UserAuth) => {
    setCurrentUser(user);
    showToast(`Selamat datang, ${user.nama}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('smpn18_auth_user');
    setCurrentUser(null);
    showToast('Anda telah keluar dari sistem.', 'info');
  };

  const handleApplyDapodikData = (updatedStudents: Siswa[]) => {
    setSiswaList(updatedStudents);
    localStorage.setItem('smpn18_siswa', JSON.stringify(updatedStudents));
    showToast('Data peserta didik dari Dapodik berhasil disinkronkan ke Form 8355!', 'success');
  };

  // Render Login View if user is not authenticated
  if (!currentUser) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          logoSekolah={logoSekolah}
          namaSekolah={profilSekolah.namaSekolah}
          npsn={profilSekolah.npsn}
          waliKelasList={penjabatData.waliKelas}
          userAccounts={userAccounts}
        />
        <Toast toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  return (
    <div className="bg-slate-100 font-sans text-slate-800 antialiased h-screen flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profilSekolah={profilSekolah}
        logoSidebar={logoSidebar}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onRefreshData={handleRefreshData}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          totalSiswa={siswaList.length}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar" id="content-container">
          {(activeTab === 'dashboard-rekap-gender' || activeTab === 'dashboard-overview') && (
            <DashboardRekapGenderView
              siswaList={siswaList}
              waliKelasList={penjabatData.waliKelas}
              profilSekolah={profilSekolah}
              penjabatData={penjabatData}
              logoDki={logoDki}
              logoSekolah={logoSekolah}
            />
          )}

          {activeTab === 'dashboard-rekap-usia' && (
            <DashboardRekapUsiaView
              siswaList={siswaList}
              waliKelasList={penjabatData.waliKelas}
              profilSekolah={profilSekolah}
              penjabatData={penjabatData}
              logoDki={logoDki}
              logoSekolah={logoSekolah}
            />
          )}

          {activeTab === 'format-8355-main' && (
            <Format8355MasterView
              siswaList={siswaList}
              waliKelasList={penjabatData.waliKelas}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onDeleteSiswa={handleDeleteSiswa}
              onClearAllSiswa={handleClearAllSiswa}
              onExportExcel={handleExportExcel}
              onOpenImportModal={() => setIsModalImporOpen(true)}
              onApplyDapodikData={handleApplyDapodikData}
              profilSekolah={profilSekolah}
              penjabatData={penjabatData}
              logoDki={logoDki}
              logoSekolah={logoSekolah}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'format-8355-cetak' && (
            <Format8355CetakView
              siswaList={siswaList}
              waliKelasList={penjabatData.waliKelas}
              profilSekolah={profilSekolah}
              penjabatData={penjabatData}
              logoDki={logoDki}
              logoSekolah={logoSekolah}
            />
          )}

          {activeTab === 'daftar-siswa-main' && (
            <DaftarSiswaView
              siswaList={siswaList}
              waliKelasList={penjabatData.waliKelas}
              profilSekolah={profilSekolah}
              penjabatData={penjabatData}
              logoDki={logoDki}
              logoSekolah={logoSekolah}
            />
          )}

          {activeTab === 'daftar-absen-main' && (
            <DaftarAbsenView
              siswaList={siswaList}
              waliKelasList={penjabatData.waliKelas}
            />
          )}

          {activeTab === 'daftar-mutasi-main' && (
            <DaftarMutasiView
              mutasiList={mutasiList}
              siswaList={siswaList}
              waliKelasList={penjabatData.waliKelas}
              profilSekolah={profilSekolah}
              penjabatData={penjabatData}
              logoDki={logoDki}
              logoSekolah={logoSekolah}
              onOpenAddModal={handleOpenAddMutasi}
              onOpenEditModal={handleOpenEditMutasi}
              onDeleteMutasi={handleDeleteMutasi}
            />
          )}

          {activeTab === 'pengaturan-profil' && (
            <PengaturanProfilView
              profilSekolah={profilSekolah}
              onSave={handleSaveProfil}
              onReset={handleResetProfil}
            />
          )}

          {activeTab === 'pengaturan-logo' && (
            <PengaturanLogoView
              logoDki={logoDki}
              logoSekolah={logoSekolah}
              logoSidebar={logoSidebar}
              profilSekolah={profilSekolah}
              onUpdateLogo={handleUpdateLogo}
              onUpdateSidebarTitle={handleUpdateSidebarTitle}
              onResetLogos={handleResetLogos}
            />
          )}

          {activeTab === 'pengaturan-penjabat' && (
            <PengaturanPenjabatView
              penjabatData={penjabatData}
              onSave={handleSavePenjabat}
            />
          )}

          {activeTab === 'pengaturan-pengguna' && (
            <PengaturanPenggunaView
              userAccounts={userAccounts}
              onSaveUserAccounts={handleSaveUserAccounts}
              waliKelasList={penjabatData.waliKelas}
            />
          )}

          {activeTab === 'google-drive-sync' && (
            <GoogleDriveSyncView
              siswaList={siswaList}
              mutasiList={mutasiList}
              profilSekolah={profilSekolah}
              penjabatData={penjabatData}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Modal Add / Edit Siswa */}
      <ModalSiswa
        isOpen={isModalSiswaOpen}
        onClose={() => setIsModalSiswaOpen(false)}
        onSave={handleSaveSiswa}
        siswaToEdit={siswaToEdit}
        waliKelasList={penjabatData.waliKelas}
      />

      {/* Modal Impor Excel */}
      <ModalImporExcel
        isOpen={isModalImporOpen}
        onClose={() => setIsModalImporOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Modal Mutasi */}
      <ModalMutasi
        isOpen={isModalMutasiOpen}
        onClose={() => setIsModalMutasiOpen(false)}
        onSave={handleSaveMutasi}
        mutasiToEdit={mutasiToEdit}
        siswaList={siswaList}
        waliKelasList={penjabatData.waliKelas}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

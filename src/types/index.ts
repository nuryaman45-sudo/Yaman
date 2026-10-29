export interface Siswa {
  id: number;
  nama: string;
  nis: string;
  nisn: string;
  kelas: string;
  jk: 'L' | 'P';
  tempatLahir: string;
  tglLahir: string;
  agama: string;
  ortu: string;
  alamat: string;
  statusMutasi?: string;
}

export interface WaliKelas {
  kelas: string;
  nama: string;
  nip: string;
}

export interface PenjabatData {
  ks: {
    nama: string;
    nip: string;
    jabatan?: string;
  };
  pengawas: {
    nama: string;
    nip: string;
  };
  waliKelas: WaliKelas[];
}

export interface ProfilSekolah {
  instansi: string;
  dinas: string;
  namaSekolah: string;
  npsn: string;
  alamat: string;
  sidebarTitle: string;
}

export interface MutasiSiswa {
  id: number;
  nama: string;
  nis: string;
  nisn: string;
  kelas: string;
  jk: 'L' | 'P';
  jenisMutasi: 'MASUK' | 'KELUAR';
  tanggalMutasi: string;
  bulan: number; // 1-12
  tahun: number;
  sekolahAsalTujuan: string;
  alasan: string;
  nomorSurat: string;
  keterangan?: string;
}

export type ActiveTab =
  | 'dashboard-rekap-gender'
  | 'dashboard-rekap-usia'
  | 'dashboard-overview'
  | 'pengaturan-profil'
  | 'pengaturan-logo'
  | 'pengaturan-penjabat'
  | 'pengaturan-pengguna'
  | 'format-8355-main'
  | 'format-8355-cetak'
  | 'daftar-siswa-main'
  | 'daftar-absen-main'
  | 'daftar-mutasi-main';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface UserAuth {
  nama: string;
  email?: string;
  role: 'Operator' | 'Admin' | 'Kepala Sekolah' | 'Guru' | string;
  avatar?: string;
  loginAt?: string;
  nip?: string;
  kelasAjar?: string;
}

export interface UserAccount {
  id: string;
  nama: string;
  username: string;
  password: string;
  role: 'Admin' | 'Kepala Sekolah' | 'Guru';
  nip?: string;
  email?: string;
  kelasAjar?: string;
}

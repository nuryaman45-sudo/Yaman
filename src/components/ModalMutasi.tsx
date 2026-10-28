import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Save, UserCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { MutasiSiswa, Siswa, WaliKelas } from '../types';

interface ModalMutasiProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mutasi: MutasiSiswa, addToMasterData?: boolean) => void;
  mutasiToEdit: MutasiSiswa | null;
  siswaList: Siswa[];
  waliKelasList: WaliKelas[];
}

export const ModalMutasi: React.FC<ModalMutasiProps> = ({
  isOpen,
  onClose,
  onSave,
  mutasiToEdit,
  siswaList,
  waliKelasList,
}) => {
  const [jenisMutasi, setJenisMutasi] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState(waliKelasList[0]?.kelas || 'VII-A');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [tanggalMutasi, setTanggalMutasi] = useState(new Date().toISOString().split('T')[0]);
  const [sekolahAsalTujuan, setSekolahAsalTujuan] = useState('');
  const [alasan, setAlasan] = useState('Mengikuti Tugas / Domisili Orang Tua');
  const [nomorSurat, setNomorSurat] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [autoAddToMaster, setAutoAddToMaster] = useState(true);

  useEffect(() => {
    if (mutasiToEdit) {
      setJenisMutasi(mutasiToEdit.jenisMutasi);
      setNama(mutasiToEdit.nama);
      setNis(mutasiToEdit.nis);
      setNisn(mutasiToEdit.nisn);
      setKelas(mutasiToEdit.kelas);
      setJk(mutasiToEdit.jk);
      setTanggalMutasi(mutasiToEdit.tanggalMutasi);
      setSekolahAsalTujuan(mutasiToEdit.sekolahAsalTujuan);
      setAlasan(mutasiToEdit.alasan);
      setNomorSurat(mutasiToEdit.nomorSurat);
      setKeterangan(mutasiToEdit.keterangan || '');
      setAutoAddToMaster(false);
    } else {
      setJenisMutasi('MASUK');
      setSelectedSiswaId('');
      setNama('');
      setNis('');
      setNisn('');
      setKelas(waliKelasList[0]?.kelas || 'VII-A');
      setJk('L');
      setTanggalMutasi(new Date().toISOString().split('T')[0]);
      setSekolahAsalTujuan('');
      setAlasan('Mengikuti Tugas / Domisili Orang Tua');
      setNomorSurat('421.3/' + Math.floor(100 + Math.random() * 900) + '/SMPN18-JKT/2026');
      setKeterangan('Lengkap berkas mutasi');
      setAutoAddToMaster(true);
    }
  }, [mutasiToEdit, isOpen, waliKelasList]);

  if (!isOpen) return null;

  const handleSelectExistingStudent = (siswaIdStr: string) => {
    setSelectedSiswaId(siswaIdStr);
    const s = siswaList.find((item) => String(item.id) === siswaIdStr);
    if (s) {
      setNama(s.nama);
      setNis(s.nis);
      setNisn(s.nisn);
      setKelas(s.kelas);
      setJk(s.jk);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nis || !tanggalMutasi) return;

    const tgl = new Date(tanggalMutasi);
    const bulan = isNaN(tgl.getTime()) ? 10 : tgl.getMonth() + 1;
    const tahun = isNaN(tgl.getTime()) ? 2026 : tgl.getFullYear();

    const payload: MutasiSiswa = {
      id: mutasiToEdit ? mutasiToEdit.id : Date.now(),
      nama: nama.trim(),
      nis: nis.trim(),
      nisn: nisn.trim() || '-',
      kelas: kelas.trim(),
      jk: jk,
      jenisMutasi: jenisMutasi,
      tanggalMutasi: tanggalMutasi,
      bulan: bulan,
      tahun: tahun,
      sekolahAsalTujuan: sekolahAsalTujuan.trim() || '-',
      alasan: alasan.trim() || 'Pindah Domisili',
      nomorSurat: nomorSurat.trim() || '-',
      keterangan: keterangan.trim(),
    };

    onSave(payload, jenisMutasi === 'MASUK' && !mutasiToEdit && autoAddToMaster);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm tracking-wide">
              {mutasiToEdit ? 'Edit Catatan Mutasi Siswa' : 'Tambah Catatan Mutasi Siswa'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Jenis Mutasi Switch */}
          <div>
            <label className="font-semibold block mb-1 text-slate-700">
              Jenis Mutasi Siswa <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setJenisMutasi('MASUK')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  jenisMutasi === 'MASUK'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/50'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>MUTASI MASUK (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setJenisMutasi('KELUAR')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  jenisMutasi === 'KELUAR'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-400/50'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>MUTASI KELUAR (-)</span>
              </button>
            </div>
          </div>

          {/* Quick select existing student if Mutasi Keluar */}
          {jenisMutasi === 'KELUAR' && !mutasiToEdit && (
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
              <label className="font-semibold block mb-1 text-rose-900">
                Pilih Dari Data Siswa Aktif (Opsional)
              </label>
              <select
                value={selectedSiswaId}
                onChange={(e) => handleSelectExistingStudent(e.target.value)}
                className="w-full border border-rose-300 rounded-lg p-2 bg-white text-xs outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="">-- Pilih Siswa yang Mutasi Keluar --</option>
                {siswaList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.kelas} - NIS: {s.nis})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nama Siswa */}
          <div>
            <label className="font-semibold block mb-1 text-slate-700">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              placeholder="Contoh: Danang Prasetyo"
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                NIS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                required
                placeholder="Nomor Induk Siswa"
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                NISN
              </label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="NISN Siswa"
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Kelas / Rombel <span className="text-rose-500">*</span>
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-medium"
              >
                {waliKelasList.map((wk) => (
                  <option key={wk.kelas} value={wk.kelas}>
                    Kelas {wk.kelas}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <select
                value={jk}
                onChange={(e) => setJk(e.target.value as 'L' | 'P')}
                required
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Tanggal Mutasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalMutasi}
                onChange={(e) => setTanggalMutasi(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                {jenisMutasi === 'MASUK' ? 'Sekolah Asal Siswa' : 'Sekolah Tujuan Pindah'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={sekolahAsalTujuan}
                onChange={(e) => setSekolahAsalTujuan(e.target.value)}
                required
                placeholder={jenisMutasi === 'MASUK' ? 'Contoh: SMPN 1 Bandung' : 'Contoh: SMPN 2 Semarang'}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Alasan Mutasi
              </label>
              <input
                type="text"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Alasan kepindahan"
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Nomor Surat Keterangan / Pindah
              </label>
              <input
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder="No. Surat Resmi"
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Option for mutasi masuk to auto-add to master data */}
          {jenisMutasi === 'MASUK' && !mutasiToEdit && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-emerald-900 font-semibold">
                <input
                  type="checkbox"
                  checked={autoAddToMaster}
                  onChange={(e) => setAutoAddToMaster(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Tambahkan siswa ini juga ke Master Data Buku Induk 8355</span>
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-amber-600/20 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan Mutasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

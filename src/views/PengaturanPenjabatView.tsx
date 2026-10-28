import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Save, User, ShieldCheck } from 'lucide-react';
import { PenjabatData, WaliKelas } from '../types';

interface PengaturanPenjabatViewProps {
  penjabatData: PenjabatData;
  onSave: (data: PenjabatData) => void;
}

export const PengaturanPenjabatView: React.FC<PengaturanPenjabatViewProps> = ({
  penjabatData,
  onSave,
}) => {
  const [ksNama, setKsNama] = useState(penjabatData.ks.nama);
  const [ksNip, setKsNip] = useState(penjabatData.ks.nip);
  const [ksJabatan, setKsJabatan] = useState(penjabatData.ks.jabatan || 'Kepala SMPN 18 Jakarta');

  const [pengawasNama, setPengawasNama] = useState(penjabatData.pengawas.nama);
  const [pengawasNip, setPengawasNip] = useState(penjabatData.pengawas.nip);

  const [waliKelasList, setWaliKelasList] = useState<WaliKelas[]>(penjabatData.waliKelas);

  const handleAddWaliKelas = () => {
    setWaliKelasList([
      ...waliKelasList,
      {
        kelas: `VII-${String.fromCharCode(65 + waliKelasList.length)}`,
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
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Input Data Penjabat & Pengesah Dokumen
              </h3>
              <p className="text-xs text-slate-400">
                Data penandatangan otomatis tercetak di Form 8355, Daftar Siswa, dan Absensi
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Kepala Sekolah */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-blue-900 border-b border-slate-200 pb-2 flex items-center gap-2 text-xs">
              <User className="w-4 h-4 text-blue-600" /> Kepala Sekolah
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Nama Lengkap Kepala Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ksNama}
                  onChange={(e) => setKsNama(e.target.value)}
                  required
                  placeholder="Drs. H. Mulyadi, M.Pd."
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  NIP Kepala Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ksNip}
                  onChange={(e) => setKsNip(e.target.value)}
                  required
                  placeholder="196803121995121001"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Pengawas Sekolah */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-blue-900 border-b border-slate-200 pb-2 flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pengawas Sekolah Pembina
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  Nama Lengkap Pengawas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pengawasNama}
                  onChange={(e) => setPengawasNama(e.target.value)}
                  required
                  placeholder="Dr. Hj. Sri Rahayu, M.Pd."
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-slate-700">
                  NIP Pengawas Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pengawasNip}
                  onChange={(e) => setPengawasNip(e.target.value)}
                  required
                  placeholder="196508151990032002"
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Data Wali Kelas & Rombel */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-indigo-600" /> Data Wali Kelas & Rombongan Belajar
              </h4>
              <button
                type="button"
                onClick={handleAddWaliKelas}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Wali Kelas</span>
              </button>
            </div>

            <div className="space-y-3">
              {waliKelasList.length === 0 ? (
                <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-center text-slate-400">
                  Belum ada data Wali Kelas. Klik tombol "+ Tambah Wali Kelas" di atas.
                </div>
              ) : (
                waliKelasList.map((wk, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap sm:flex-nowrap items-center gap-3"
                  >
                    <div className="w-full sm:w-28">
                      <label className="font-semibold block mb-1 text-slate-600 text-[10px]">
                        Nama Kelas
                      </label>
                      <input
                        type="text"
                        value={wk.kelas}
                        onChange={(e) => handleUpdateWaliKelas(index, 'kelas', e.target.value)}
                        required
                        placeholder="VII-A"
                        className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 text-xs"
                      />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <label className="font-semibold block mb-1 text-slate-600 text-[10px]">
                        Nama Lengkap Wali Kelas & Gelar
                      </label>
                      <input
                        type="text"
                        value={wk.nama}
                        onChange={(e) => handleUpdateWaliKelas(index, 'nama', e.target.value)}
                        required
                        placeholder="Nama Guru Wali Kelas"
                        className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 text-xs"
                      />
                    </div>
                    <div className="w-full sm:w-44">
                      <label className="font-semibold block mb-1 text-slate-600 text-[10px]">
                        NIP Wali Kelas
                      </label>
                      <input
                        type="text"
                        value={wk.nip}
                        onChange={(e) => handleUpdateWaliKelas(index, 'nip', e.target.value)}
                        required
                        placeholder="NIP / -"
                        className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-800 text-xs"
                      />
                    </div>
                    <div className="pt-4 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveWaliKelas(index)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition"
                        title="Hapus Baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Penjabat & Rombel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

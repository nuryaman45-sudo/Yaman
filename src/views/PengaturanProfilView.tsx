import React, { useState } from 'react';
import { School, Save, RotateCcw } from 'lucide-react';
import { ProfilSekolah } from '../types';

interface PengaturanProfilViewProps {
  profilSekolah: ProfilSekolah;
  onSave: (profil: ProfilSekolah) => void;
  onReset: () => void;
}

export const PengaturanProfilView: React.FC<PengaturanProfilViewProps> = ({
  profilSekolah,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<ProfilSekolah>(profilSekolah);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Profil Sekolah & Kustomisasi Header Kop
              </h3>
              <p className="text-xs text-slate-400">
                Atur identitas lembaga yang akan dicetak di semua formulir resmi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition p-1.5 rounded-lg hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Nama Instansi Atas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.instansi}
                onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                required
                placeholder="Pemerintah Provinsi DKI Jakarta"
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition font-medium"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Nama Dinas / Sub-Instansi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dinas}
                onChange={(e) => setFormData({ ...formData, dinas: e.target.value })}
                required
                placeholder="Dinas Pendidikan"
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Nama Sekolah (Tampil di Kop) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.namaSekolah}
                onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                required
                placeholder="SMP NEGERI 18 JAKARTA"
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition font-bold text-blue-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                NPSN / Kode Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                required
                placeholder="Nomor Pokok Sekolah Nasional"
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-700">
              Alamat Lengkap Sekolah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              required
              placeholder="Jl. Menteng Kecil No. 3 RT 12 RW 9, Kebon Sirih, Menteng, Jakarta Pusat 10340"
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil & Header</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

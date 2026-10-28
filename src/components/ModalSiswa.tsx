import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { Siswa, WaliKelas } from '../types';

interface ModalSiswaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (siswa: Siswa) => void;
  siswaToEdit: Siswa | null;
  waliKelasList: WaliKelas[];
}

export const ModalSiswa: React.FC<ModalSiswaProps> = ({
  isOpen,
  onClose,
  onSave,
  siswaToEdit,
  waliKelasList,
}) => {
  const [formData, setFormData] = useState<Partial<Siswa>>({
    nama: '',
    nis: '',
    nisn: '',
    kelas: '',
    jk: 'L',
    tempatLahir: '',
    tglLahir: '',
    agama: 'Islam',
    ortu: '',
    alamat: '',
  });

  useEffect(() => {
    if (siswaToEdit) {
      setFormData(siswaToEdit);
    } else {
      const defaultKelas = waliKelasList.length > 0 ? waliKelasList[0].kelas : 'VII-A';
      setFormData({
        nama: '',
        nis: '',
        nisn: '',
        kelas: defaultKelas,
        jk: 'L',
        tempatLahir: '',
        tglLahir: '',
        agama: 'Islam',
        ortu: '',
        alamat: '',
      });
    }
  }, [siswaToEdit, isOpen, waliKelasList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nis || !formData.nisn || !formData.kelas) {
      return;
    }

    const payload: Siswa = {
      id: siswaToEdit ? siswaToEdit.id : Date.now(),
      nama: formData.nama.trim(),
      nis: formData.nis.trim(),
      nisn: formData.nisn.trim(),
      kelas: formData.kelas.trim(),
      jk: (formData.jk as 'L' | 'P') || 'L',
      tempatLahir: (formData.tempatLahir || '').trim(),
      tglLahir: formData.tglLahir || '',
      agama: formData.agama || 'Islam',
      ortu: (formData.ortu || '').trim(),
      alamat: (formData.alamat || '').trim(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide">
              {siswaToEdit ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
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
          <div>
            <label className="font-semibold block mb-1 text-slate-700">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama || ''}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
              placeholder="Contoh: Ahmad Fauzi Alamsyah"
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                NIS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nis || ''}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                required
                placeholder="Nomor Induk Siswa"
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                NISN <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nisn || ''}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                required
                placeholder="10 digit NISN"
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Kelas / Rombel <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.kelas || ''}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium"
              >
                {waliKelasList.length > 0 ? (
                  waliKelasList.map((wk) => (
                    <option key={wk.kelas} value={wk.kelas}>
                      Kelas {wk.kelas}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="VII-A">Kelas VII-A</option>
                    <option value="VII-B">Kelas VII-B</option>
                    <option value="VII-C">Kelas VII-C</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.jk || 'L'}
                onChange={(e) => setFormData({ ...formData, jk: e.target.value as 'L' | 'P' })}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Tempat Lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tempatLahir || ''}
                onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                required
                placeholder="Kota Kelahiran"
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Tanggal Lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tglLahir || ''}
                onChange={(e) => setFormData({ ...formData, tglLahir: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Agama <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.agama || 'Islam'}
                onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen Protestan">Kristen Protestan</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                Nama Orang Tua / Wali <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ortu || ''}
                onChange={(e) => setFormData({ ...formData, ortu: e.target.value })}
                required
                placeholder="Nama Ayah / Ibu / Wali"
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-slate-700">
              Alamat Tempat Tinggal <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.alamat || ''}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              required
              placeholder="Alamat lengkap beserta RT/RW, Kelurahan, Kecamatan"
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

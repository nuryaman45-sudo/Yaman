import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Save, Sparkles, RotateCcw } from 'lucide-react';
import { ProfilSekolah } from '../types';

interface PengaturanLogoViewProps {
  logoDki: string;
  logoSekolah: string;
  logoSidebar: string;
  profilSekolah: ProfilSekolah;
  onUpdateLogo: (type: 'dki' | 'sekolah' | 'sidebar', dataUrl: string) => void;
  onUpdateSidebarTitle: (title: string) => void;
  onResetLogos: () => void;
}

export const PengaturanLogoView: React.FC<PengaturanLogoViewProps> = ({
  logoDki,
  logoSekolah,
  logoSidebar,
  profilSekolah,
  onUpdateLogo,
  onUpdateSidebarTitle,
  onResetLogos,
}) => {
  const [sidebarTitleInput, setSidebarTitleInput] = useState<string>(
    profilSekolah.sidebarTitle || 'SMPN 18 JAKARTA'
  );

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'dki' | 'sekolah' | 'sidebar'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpdateLogo(type, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSidebarTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (sidebarTitleInput.trim()) {
      onUpdateSidebarTitle(sidebarTitleInput.trim());
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Pengaturan Logo Dokumen & Identitas Sidebar
              </h3>
              <p className="text-xs text-slate-400">
                Unggah logo kustom untuk kop surat resmi F4 dan navigasi samping
              </p>
            </div>
          </div>
          <button
            onClick={onResetLogos}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition p-1.5 rounded-lg hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Logo Bawaan</span>
          </button>
        </div>

        {/* 3 Cards for Logos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Card 1: Logo Instansi (DKI) */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col items-center text-center space-y-4 hover:border-blue-400 transition">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Logo Instansi (Kop Kiri)</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Pemprov DKI / Lambang Daerah</p>
            </div>

            <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-3 bg-white shadow-xs overflow-hidden">
              {logoDki ? (
                <img
                  src={logoDki}
                  className="max-h-full max-w-full object-contain"
                  alt="Logo DKI"
                />
              ) : (
                <span className="text-slate-400 font-semibold text-xs">Logo Kiri</span>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="input-logo-dki"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Logo</span>
              </label>
              <input
                type="file"
                id="input-logo-dki"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'dki')}
                className="hidden"
              />
            </div>
          </div>

          {/* Card 2: Logo Sekolah (Kanan) */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col items-center text-center space-y-4 hover:border-indigo-400 transition">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Logo Sekolah (Kop Kanan)</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Logo SMPN 18 / Tut Wuri Handayani</p>
            </div>

            <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-3 bg-white shadow-xs overflow-hidden">
              {logoSekolah ? (
                <img
                  src={logoSekolah}
                  className="max-h-full max-w-full object-contain"
                  alt="Logo Sekolah"
                />
              ) : (
                <span className="text-slate-400 font-semibold text-xs">Logo Kanan</span>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="input-logo-sekolah"
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Logo</span>
              </label>
              <input
                type="file"
                id="input-logo-sekolah"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'sekolah')}
                className="hidden"
              />
            </div>
          </div>

          {/* Card 3: Logo Sidebar */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col items-center text-center space-y-4 hover:border-slate-400 transition">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Logo Sidebar</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Ikon brand pada menu navigasi</p>
            </div>

            <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-3 bg-white shadow-xs overflow-hidden">
              {logoSidebar ? (
                <img
                  src={logoSidebar}
                  className="max-h-full max-w-full object-contain"
                  alt="Logo Sidebar"
                />
              ) : (
                <span className="text-slate-400 font-semibold text-xs">Logo Navigasi</span>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="input-logo-sidebar"
                className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Logo</span>
              </label>
              <input
                type="file"
                id="input-logo-sidebar"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'sidebar')}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Title Customization */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Kustomisasi Tulisan Nama Sekolah pada Sidebar
          </h4>
          <form onSubmit={handleSaveSidebarTitle} className="flex flex-wrap sm:flex-nowrap gap-3">
            <input
              type="text"
              value={sidebarTitleInput}
              onChange={(e) => setSidebarTitleInput(e.target.value)}
              placeholder="Contoh: SMPN 18 JAKARTA"
              className="flex-1 border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-xs font-bold text-slate-800 transition"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm shadow-amber-500/20 flex items-center gap-2 text-xs shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Teks Sidebar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileUp,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { Siswa } from '../types';

interface ModalImporExcelProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedSiswa: Siswa[], mode: 'append' | 'replace') => void;
}

export const ModalImporExcel: React.FC<ModalImporExcelProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Siswa[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'Nama Lengkap': 'Ahmad Fauzi Alamsyah',
        'Kelas': 'VII-A',
        'NIS': '1001',
        'NISN': '0101234567',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir': '2013-05-12',
        'Agama': 'Islam',
        'Nama Orang Tua': 'Budi Santoso',
        'Alamat': 'Jl. Menteng Raya No. 10, Jakarta Pusat',
      },
      {
        'No': 2,
        'Nama Lengkap': 'Siti Rahma Azzahra',
        'Kelas': 'VII-A',
        'NIS': '1002',
        'NISN': '0107654321',
        'Jenis Kelamin': 'P',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir': '2013-08-20',
        'Agama': 'Islam',
        'Nama Orang Tua': 'Suryanto',
        'Alamat': 'Jl. Kebon Sirih No. 5, Jakarta Pusat',
      },
      {
        'No': 3,
        'Nama Lengkap': 'Christian Jonathan Siregar',
        'Kelas': 'VII-B',
        'NIS': '1003',
        'NISN': '0109923812',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Medan',
        'Tanggal Lahir': '2013-02-14',
        'Agama': 'Kristen Protestan',
        'Nama Orang Tua': 'Robert Siregar',
        'Alamat': 'Jl. Sam Ratulangi No. 18, Menteng',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set Column Widths
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 28 }, // Nama
      { wch: 10 }, // Kelas
      { wch: 10 }, // NIS
      { wch: 14 }, // NISN
      { wch: 14 }, // Jenis Kelamin
      { wch: 16 }, // Tempat Lahir
      { wch: 14 }, // Tanggal Lahir
      { wch: 16 }, // Agama
      { wch: 22 }, // Nama Orang Tua
      { wch: 35 }, // Alamat
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'Template_Impor_Siswa_8355.xlsx');
  };

  const cleanHeader = (header: string) => {
    return header.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (fileToRead: File) => {
    setErrorMsg(null);
    setFile(fileToRead);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];

        if (!ws) {
          setErrorMsg('Lembar kerja (sheet) kosong atau tidak terbaca.');
          setIsProcessing(false);
          return;
        }

        // Convert to array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('File Excel tidak berisi data siswa.');
          setIsProcessing(false);
          return;
        }

        const parsedList: Siswa[] = [];
        let autoId = Date.now();

        for (let i = 0; i < rawJson.length; i++) {
          const row = rawJson[i];
          const keys = Object.keys(row);

          let nama = '';
          let kelas = 'VII-A';
          let nis = '';
          let nisn = '';
          let jk: 'L' | 'P' = 'L';
          let tempatLahir = 'Jakarta';
          let tglLahir = '';
          let agama = 'Islam';
          let ortu = '';
          let alamat = '';

          keys.forEach((k) => {
            const cleanKey = cleanHeader(k);
            const val = String(row[k] || '').trim();

            if (cleanKey.includes('nama') && !cleanKey.includes('ortu') && !cleanKey.includes('orangtua')) {
              nama = val;
            } else if (cleanKey === 'kelas' || cleanKey === 'rombel') {
              kelas = val || 'VII-A';
            } else if (cleanKey === 'nis') {
              nis = val;
            } else if (cleanKey === 'nisn') {
              nisn = val;
            } else if (cleanKey.includes('jk') || cleanKey.includes('jeniskelamin') || cleanKey === 'gender') {
              const upper = val.toUpperCase();
              jk = upper.startsWith('P') || upper.startsWith('W') ? 'P' : 'L';
            } else if (cleanKey.includes('tempat')) {
              tempatLahir = val || 'Jakarta';
            } else if (cleanKey.includes('tanggal') || cleanKey.includes('tgl')) {
              if (row[k] instanceof Date) {
                tglLahir = row[k].toISOString().split('T')[0];
              } else {
                tglLahir = val;
              }
            } else if (cleanKey.includes('agama')) {
              agama = val || 'Islam';
            } else if (cleanKey.includes('ortu') || cleanKey.includes('orangtua') || cleanKey.includes('ayah') || cleanKey.includes('wali')) {
              ortu = val;
            } else if (cleanKey.includes('alamat')) {
              alamat = val;
            }
          });

          // Only add rows that at least have a name or NIS
          if (nama || nis) {
            parsedList.push({
              id: autoId++,
              nama: nama || `Siswa Tanpa Nama (${i + 1})`,
              kelas: kelas || 'VII-A',
              nis: nis || String(1000 + i),
              nisn: nisn || '-',
              jk: jk,
              tempatLahir: tempatLahir || 'Jakarta',
              tglLahir: tglLahir || '2013-01-01',
              agama: agama || 'Islam',
              ortu: ortu || '-',
              alamat: alamat || '-',
            });
          }
        }

        if (parsedList.length === 0) {
          setErrorMsg('Tidak ditemukan baris data siswa yang valid di file Excel.');
        } else {
          setPreviewData(parsedList);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Gagal membaca file Excel. Pastikan format file adalah .xlsx atau .xls.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(fileToRead);
  };

  const handleApplyImport = () => {
    if (previewData.length === 0) return;
    onImportSuccess(previewData, importMode);
    onClose();
  };

  const handleResetFile = () => {
    setFile(null);
    setPreviewData([]);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-emerald-950 text-white flex justify-between items-center shrink-0 border-b border-emerald-900">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-emerald-600/30 rounded-lg border border-emerald-500/40">
              <FileUp className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Impor Data Siswa dari Excel (.xlsx / .xls)
              </h3>
              <p className="text-[11px] text-emerald-300">
                Unggah berkas Excel untuk menambahkan atau memperbarui data peserta didik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-5 text-xs flex-1">
          {/* Download Template Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-900 text-xs">
                  Gunakan Template Excel Resmi
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Format tabel telah disesuaikan dengan kolom buku induk Formulir 8355.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition group"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                Klik atau seret file Excel ke sini
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Mendukung file Microsoft Excel (.xlsx dan .xls)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-800 text-xs truncate">
                    {file.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • {previewData.length} baris data siswa terbaca
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetFile}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold p-1.5 hover:bg-rose-50 rounded-lg transition"
              >
                Ganti File
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-[11px] font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Preview Section */}
          {previewData.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Data Siswa ({previewData.length} siswa siap diimpor)
                </h4>

                {/* Import Mode Radio */}
                <div className="flex items-center space-x-3 bg-slate-100 p-1 rounded-lg">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-medium px-2 py-1 rounded">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Tambahkan ke data lama</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-medium px-2 py-1 rounded">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-700 font-bold">Timpa seluruh data</span>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="max-h-56 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-100 sticky top-0 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2 text-center w-8">No</th>
                      <th className="p-2">Nama</th>
                      <th className="p-2 w-16">Kelas</th>
                      <th className="p-2 w-16">NIS</th>
                      <th className="p-2 text-center w-10">JK</th>
                      <th className="p-2">Agama</th>
                      <th className="p-2">Orang Tua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.slice(0, 15).map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-2 font-semibold text-slate-800">{s.nama}</td>
                        <td className="p-2 text-indigo-700 font-medium">{s.kelas}</td>
                        <td className="p-2 font-mono text-slate-600">{s.nis}</td>
                        <td className="p-2 text-center font-bold">
                          <span className={s.jk === 'L' ? 'text-blue-700' : 'text-pink-700'}>
                            {s.jk}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600">{s.agama}</td>
                        <td className="p-2 text-slate-600">{s.ortu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 15 && (
                <p className="text-[10px] text-slate-500 text-center italic">
                  Menampilkan 15 baris pertama dari {previewData.length} baris yang siap diimpor.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={previewData.length === 0 || isProcessing}
            onClick={handleApplyImport}
            className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition shadow-sm ${
              previewData.length > 0 && !isProcessing
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Impor {previewData.length > 0 ? `${previewData.length} Data Siswa` : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

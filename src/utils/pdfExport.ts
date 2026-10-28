import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PDFExportOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  format?: [number, number] | string;
  singlePage?: boolean;
}

/**
 * Triggers browser download for a jsPDF instance using Blob URL.
 */
function downloadPDFDocument(pdf: jsPDF, filename: string): void {
  try {
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 1500);
  } catch {
    // Fallback if Blob fails
    pdf.save(filename);
  }
}

export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<void> {
  const orientation = options.orientation || 'portrait';
  // Standar dimensi kertas F4 (Folio) Indonesia: 215mm x 330mm
  const widthMm = orientation === 'landscape' ? 330 : 215;
  const heightMm = orientation === 'landscape' ? 215 : 330;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    ignoreElements: (el) => el.classList?.contains('no-print'),
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const imgRatio = imgProps.width / imgProps.height;

  // Margin presisi F4: Posisi data SELALU dimulai dari atas (marginTop = 8mm)
  // serta margin kiri dan kanan seimbang (marginX = 8mm)
  const marginX = 8;
  const marginTop = 8;
  const marginBottom = 8;

  const maxContentWidth = pdfWidth - marginX * 2;
  const maxContentHeight = pdfHeight - marginTop - marginBottom;

  let renderWidth = maxContentWidth;
  let renderHeight = renderWidth / imgRatio;

  // Jika opsi singlePage aktif atau konten mendekati 1 halaman, lakukan penyesuaian skala proporsional
  if (options.singlePage || renderHeight <= maxContentHeight * 1.35) {
    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = renderHeight * imgRatio;
    }
    const offsetX = Math.max(0, (pdfWidth - renderWidth) / 2);
    // Data selalu dimulai dari margin atas halaman (tidak diletakkan di tengah halaman)
    const offsetY = marginTop;
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight);
  } else {
    // Multi-halaman berlanjut dengan posisi data selalu rapi dari margin atas
    let heightLeft = renderHeight;
    let position = marginTop;

    const offsetX = Math.max(0, (pdfWidth - renderWidth) / 2);
    pdf.addImage(imgData, 'JPEG', offsetX, position, renderWidth, renderHeight);
    heightLeft -= maxContentHeight;

    while (heightLeft > 0) {
      position -= maxContentHeight;
      pdf.addPage([widthMm, heightMm], orientation);
      pdf.addImage(imgData, 'JPEG', offsetX, position, renderWidth, renderHeight);
      heightLeft -= maxContentHeight;
    }
  }

  downloadPDFDocument(pdf, options.filename);
}

export async function exportMultiplePagesToPDF(
  elements: HTMLElement[],
  options: PDFExportOptions
): Promise<void> {
  const orientation = options.orientation || 'landscape';
  const widthMm = orientation === 'landscape' ? 330 : 215;
  const heightMm = orientation === 'landscape' ? 215 : 330;

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Margin presisi F4 untuk dokumen multipage:
  // Data selalu dimulai dari atas (marginTop = 8mm) dan margin kanan-kiri simetris
  const marginX = 8;
  const marginTop = 8;
  const marginBottom = 8;

  const maxContentWidth = pdfWidth - marginX * 2;
  const maxContentHeight = pdfHeight - marginTop - marginBottom;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: el.scrollWidth,
      ignoreElements: (element) => element.classList?.contains('no-print'),
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;

    let renderWidth = maxContentWidth;
    let renderHeight = renderWidth / imgRatio;

    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = renderHeight * imgRatio;
    }

    const offsetX = Math.max(0, (pdfWidth - renderWidth) / 2);
    // Data selalu dimulai dari atas setiap halaman
    const offsetY = marginTop;

    if (i > 0) {
      pdf.addPage([widthMm, heightMm], orientation);
    }
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight);
  }

  downloadPDFDocument(pdf, options.filename);
}

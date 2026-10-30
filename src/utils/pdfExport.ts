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

/**
 * Prepares and standardizes cloned DOM before rendering to canvas.
 * Sets standard virtual width matching F4 paper, removes scroll wrappers,
 * ensures 100% table visibility without clipping, refines fonts and borders,
 * and removes interactive controls.
 */
function prepareClonedElement(
  _clonedDoc: Document,
  clonedElement: HTMLElement,
  orientation: 'portrait' | 'landscape'
) {
  // Target virtual sheet width matching F4 at standard ~96dpi
  // 330mm landscape ≈ 1248px, 215mm portrait ≈ 813px
  const targetWidth = orientation === 'landscape' ? 1220 : 820;

  // Set clone container styling with clean internal margins
  clonedElement.style.width = `${targetWidth}px`;
  clonedElement.style.minWidth = `${targetWidth}px`;
  clonedElement.style.maxWidth = `${targetWidth}px`;
  clonedElement.style.boxSizing = 'border-box';
  clonedElement.style.overflow = 'visible';
  clonedElement.style.margin = '0 auto';
  clonedElement.style.backgroundColor = '#ffffff';
  clonedElement.style.color = '#0f172a';
  clonedElement.style.borderRadius = '0';
  clonedElement.style.boxShadow = 'none';
  clonedElement.style.border = 'none';
  clonedElement.style.padding = orientation === 'landscape' ? '18px 22px' : '22px 20px';
  clonedElement.style.fontFamily = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // Remove any interactive or no-print elements from cloned DOM
  const noPrintEls = clonedElement.querySelectorAll('.no-print, button, input, select');
  noPrintEls.forEach((el) => {
    if (el.classList.contains('no-print') || el.tagName === 'BUTTON' || el.tagName === 'SELECT') {
      el.remove();
    }
  });

  // Expand all scrollable wrappers so no columns or tables are clipped
  const scrollWrappers = clonedElement.querySelectorAll(
    '.overflow-x-auto, .overflow-auto, .overflow-hidden, .overflow-x-scroll, [class*="overflow-"]'
  );
  scrollWrappers.forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.overflow = 'visible';
    htmlEl.style.width = '100%';
    htmlEl.style.maxWidth = 'none';
  });

  // Ensure all tables are unconstrained, fully visible with solid crisp borders
  const tables = clonedElement.querySelectorAll('table');
  tables.forEach((tbl) => {
    const htmlTbl = tbl as HTMLElement;
    htmlTbl.style.width = '100%';
    htmlTbl.style.minWidth = '100%';
    htmlTbl.style.borderCollapse = 'collapse';
  });

  // Ensure all table borders and lines are crisp in print
  const tableCells = clonedElement.querySelectorAll('th, td');
  tableCells.forEach((cell) => {
    const htmlCell = cell as HTMLElement;
    htmlCell.style.borderColor = '#334155';
  });

  // Ensure images are rendered properly
  const images = clonedElement.querySelectorAll('img');
  images.forEach((img) => {
    img.crossOrigin = 'anonymous';
    img.style.display = 'block';
  });
}

export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<void> {
  const orientation = options.orientation || 'portrait';
  // Standar dimensi kertas F4 (Folio) Indonesia: 215mm x 330mm
  const widthMm = orientation === 'landscape' ? 330 : 215;
  const heightMm = orientation === 'landscape' ? 215 : 330;
  const virtualWidth = orientation === 'landscape' ? 1220 : 820;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: virtualWidth + 40,
    ignoreElements: (el) => el.classList?.contains('no-print'),
    onclone: (clonedDoc, clonedElement) => {
      prepareClonedElement(clonedDoc, clonedElement, orientation);
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const imgRatio = imgWidth / imgHeight;

  // Margin standar resmi F4:
  // Margin Atas = 10mm, Margin Bawah = 10mm, Margin Kiri-Kanan Simetris = 12mm
  const marginX = 12;
  const marginTop = 10;
  const marginBottom = 10;

  const maxContentWidth = pdfWidth - marginX * 2;
  const maxContentHeight = pdfHeight - marginTop - marginBottom;

  let renderWidth = maxContentWidth;
  let renderHeight = renderWidth / imgRatio;

  // Jika opsi singlePage aktif atau konten mendekati 1 halaman, lakukan penyesuaian skala proporsional
  // agar TIDAK ADA BAGIAN APAPUN YANG TERPOTONG BAIK HORIZONTAL MAUPUN VERTIKAL
  if (options.singlePage || renderHeight <= maxContentHeight * 1.35) {
    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = renderHeight * imgRatio;
    }
    if (renderWidth > maxContentWidth) {
      renderWidth = maxContentWidth;
      renderHeight = renderWidth / imgRatio;
    }
    const offsetX = (pdfWidth - renderWidth) / 2;
    const offsetY = marginTop;
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight);
  } else {
    // Multi-halaman berlanjut dengan posisi data rapi dari margin atas
    let heightLeft = renderHeight;
    let position = marginTop;

    const offsetX = (pdfWidth - renderWidth) / 2;
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
  const virtualWidth = orientation === 'landscape' ? 1220 : 820;

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Margin standar resmi F4 untuk multi-halaman
  const marginX = 12;
  const marginTop = 10;
  const marginBottom = 10;

  const maxContentWidth = pdfWidth - marginX * 2;
  const maxContentHeight = pdfHeight - marginTop - marginBottom;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: virtualWidth + 40,
      ignoreElements: (element) => element.classList?.contains('no-print'),
      onclone: (clonedDoc, clonedElement) => {
        prepareClonedElement(clonedDoc, clonedElement, orientation);
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const imgRatio = imgWidth / imgHeight;

    let renderWidth = maxContentWidth;
    let renderHeight = renderWidth / imgRatio;

    // Pastikan tidak ada yang terpotong di bagian bawah halaman
    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = renderHeight * imgRatio;
    }
    if (renderWidth > maxContentWidth) {
      renderWidth = maxContentWidth;
      renderHeight = renderWidth / imgRatio;
    }

    const offsetX = (pdfWidth - renderWidth) / 2;
    const offsetY = marginTop;

    if (i > 0) {
      pdf.addPage([widthMm, heightMm], orientation);
    }
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight);
  }

  downloadPDFDocument(pdf, options.filename);
}

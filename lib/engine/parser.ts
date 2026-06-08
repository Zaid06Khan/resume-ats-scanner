export type SupportedFileType = 'pdf' | 'docx';

export function detectFileType(file: File): SupportedFileType | null {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  ) return 'docx';
  return null;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const pageTexts = await Promise.all(
    Array.from({ length: pdf.numPages }, (_, i) =>
      pdf.getPage(i + 1).then(async page => {
        const content = await page.getTextContent();
        return content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
      })
    )
  );

  return pageTexts.join('\n');
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function extractText(file: File): Promise<string> {
  const type = detectFileType(file);
  if (type === 'pdf') return extractTextFromPDF(file);
  if (type === 'docx') return extractTextFromDOCX(file);
  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

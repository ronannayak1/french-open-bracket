import { useRef, useState } from 'react';
import { extractTextFromPdf, applyPdfResultsToOfficial } from '../pdfParse';
import { OfficialResult } from '../types';

interface OfficialPdfUploadProps {
  existingResults: Record<string, OfficialResult>;
  onApplied: (results: Record<string, OfficialResult>, report: string) => void;
  disabled?: boolean;
}

export default function OfficialPdfUpload({
  existingResults,
  onApplied,
  disabled,
}: OfficialPdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const text = await extractTextFromPdf(file);
      const report = applyPdfResultsToOfficial(text, existingResults);
      const lines = [
        `Imported ${report.matched} match result(s) from PDF.`,
        report.unmatchedPdfLines.length > 0
          ? `${report.unmatchedPdfLines.length} PDF line(s) could not be matched.`
          : null,
      ].filter(Boolean);
      onApplied(report.results, lines.join(' '));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to read PDF.');
    } finally {
      setBusy(false);
    }
  }

  function onFileList(files: FileList | null) {
    const file = files?.[0];
    if (file) void processFile(file);
  }

  return (
    <div className="official-upload">
      <div
        className={`official-upload-zone ${dragOver ? 'official-upload-zone--active' : ''} ${disabled ? 'official-upload-zone--disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) onFileList(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="official-upload-input"
          disabled={disabled || busy}
          onChange={(e) => onFileList(e.target.files)}
        />
        <span className="official-upload-icon">📄</span>
        <span className="official-upload-title">
          {busy ? 'Reading PDF…' : 'Upload nightly draw PDF'}
        </span>
        <span className="official-upload-sub">
          Drop Roland-Garros results PDF here or click to browse. Updates winners and scores for completed matches.
        </span>
      </div>
      {error && (
        <p className="official-upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

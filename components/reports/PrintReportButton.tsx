"use client";

type PrintReportButtonProps = {
  section: string;
  title: string;
};

export default function PrintReportButton({
  section,
  title
}: PrintReportButtonProps) {
  function printSection() {
    const previousTitle = document.title;
    document.body.dataset.printReportSection = section;
    document.title = title;

    window.requestAnimationFrame(() => {
      window.print();
      delete document.body.dataset.printReportSection;
      document.title = previousTitle;
    });
  }

  function exportWord() {
    const el = document.querySelector(`[data-report-section="${section}"]`);
    if (!el) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const el = document.querySelector(`[data-report-section="${section}"]`);
    if (!el) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="report-export-group">
      <button className="report-export-btn report-export-pdf" onClick={printSection} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        PDF
      </button>
      <button className="report-export-btn report-export-word" onClick={exportWord} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Word
      </button>
      <button className="report-export-btn report-export-excel" onClick={exportExcel} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
        Excel
      </button>
    </div>
  );
}

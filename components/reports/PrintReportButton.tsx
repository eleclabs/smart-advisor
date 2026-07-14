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
    <div style={{ display: "flex", gap: 8 }}>
      <button className="report-print-button" onClick={printSection} type="button">
        พิมพ์ / บันทึก PDF
      </button>
      <button className="report-print-button" onClick={exportWord} type="button">
        ส่งออกเป็น Word
      </button>
      <button className="report-print-button" onClick={exportExcel} type="button">
        ส่งออกเป็น Excel
      </button>
    </div>
  );
}

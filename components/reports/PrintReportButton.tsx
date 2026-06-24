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

  return (
    <button className="report-print-button" onClick={printSection} type="button">
      พิมพ์ / บันทึก PDF
    </button>
  );
}

export default function DashboardLoading() {
  return (
    <div aria-label="กำลังโหลดข้อมูลภาพรวม" className="overview-loading" role="status">
      <div className="overview-loading-header" />
      <div className="overview-loading-metrics">
        {[0, 1, 2, 3].map((item) => <div key={item} />)}
      </div>
      <div className="overview-loading-panels">
        <div /><div /><div />
      </div>
    </div>
  );
}

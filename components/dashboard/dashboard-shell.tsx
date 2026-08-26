import {DashboardNavbar} from "./dashboard-navbar";

interface DashboardShellProps {
  children: React.ReactNode; //React.ReactNode = أي محتوى React قابل للعرض: HTML elements، components، نص، رقم، fragment، arrays، وحتى null.
}

export function DashboardShell({children}: DashboardShellProps) { //DashboardShell  الغلاف/الهيكل العام للداشبورد.
  // عملنا هاد الغلاف وستخدمنا children ليصير الغلاف reusable وأنظف.
  return (
    <main className="dashboard-page">
      <DashboardNavbar />

      <div className="dashboard-content" id="main-content">
        {children}
      </div>
    </main>
  );
}

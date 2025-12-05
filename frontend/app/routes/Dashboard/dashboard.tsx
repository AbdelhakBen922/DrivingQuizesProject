import { Outlet } from "react-router";
import DashboardLayout from "~/components/Dashboard/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

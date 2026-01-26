import { Outlet } from "react-router-dom";
import DashboardLayout from "~/components/Dashboard/home/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

import { useTranslation } from "react-i18next";
import DashboardHome from "~/components/Dashboard/home/DashboardHome";

export default function DashboardHomeIndex() {
  const { i18n: _i18n } = useTranslation();

  return (
    <DashboardHome/>
  );
}

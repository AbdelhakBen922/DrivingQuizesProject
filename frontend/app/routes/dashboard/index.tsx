import { useTranslation } from "react-i18next";
import DashboardHome from "~/components/Dashboard/home/DashboardHome";

export default function DashboardHomeIndex() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <DashboardHome/>
  );
}

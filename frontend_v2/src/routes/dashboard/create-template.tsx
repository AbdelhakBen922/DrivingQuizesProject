import CreateTemplatePage from "../../components/Dashboard/Exams/CreateTemplate/CreateTemplatePage";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function CreateTemplate() {
  return (
    <ProtectedRoute allowedUserTypes={["staff"]}>
      <CreateTemplatePage />
    </ProtectedRoute>
  );
}

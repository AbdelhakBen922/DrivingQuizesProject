import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),
    route("select-quiz","routes/Quiz/quiz-select.tsx"),
    route("quiz/:quizId","routes/Quiz/quiz.tsx"),
    route("dashboard/templates/create", "routes/dashboard/create-template.tsx"),
    layout("routes/dashboard.tsx", [
        route("dashboard", "routes/dashboard/index.tsx"),
        route("dashboard/groups", "routes/dashboard/groups.tsx"),
        route("dashboard/groups/:groupId", "routes/dashboard/group-details.tsx"),
        route("dashboard/quizzes", "routes/dashboard/exams.tsx"),
        route("dashboard/templates", "routes/dashboard/templates.tsx"),
        route("dashboard/settings", "routes/dashboard/settings.tsx"),
    ]),
] satisfies RouteConfig;

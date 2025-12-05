import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("select-quiz","routes/Quiz/quiz-select.tsx"),
    route("quiz/:quizId","routes/Quiz/quiz.tsx"),
    layout("routes/Dashboard/dashboard.tsx", [
        route("dashboard", "components/Dashboard/home/DashboardHome.tsx"),
    ]),
] satisfies RouteConfig;

import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("select-quiz","routes/Quiz/quiz-select.tsx"),
    route("quiz/:quizId","routes/Quiz/quiz.tsx"),
    layout("routes/dashboard.tsx", [
        route("dashboard", "routes/dashboard/index.tsx"),
        route("dashboard/groups", "routes/dashboard/groups.tsx"),
    ]),
] satisfies RouteConfig;

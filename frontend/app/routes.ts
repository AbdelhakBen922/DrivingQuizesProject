import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("select-quiz","routes/Quiz/quiz-select.tsx"),
] satisfies RouteConfig;

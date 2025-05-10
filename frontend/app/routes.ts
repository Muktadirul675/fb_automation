import { type RouteConfig, route, index, prefix } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/users", "routes/users.tsx"),
    route("/proxies", "routes/proxies.tsx"),
    route("/posts", "routes/posts.tsx"),
    route("/comments", "routes/comments.tsx"),
    ...prefix("/processes/new",[
        route("/post","routes/processes/PostProcessForm.tsx"),
        route("/comment","routes/processes/CommentProcessForm.tsx"),
        route("/reaction","routes/processes/ReactionProcessForm.tsx"),
    ])
] satisfies RouteConfig;

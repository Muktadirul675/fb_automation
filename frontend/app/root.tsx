import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { BiComment, BiHome, BiNews, BiUser, BiWorld } from "react-icons/bi";
import { Link } from "react-router";
import { CiSettings } from "react-icons/ci";
import { ProcessesProvider } from "./stores/processes";
import { ReactionProcessesProvider } from "./stores/reactionProcesses";
import { PostProcessesProvider } from "./stores/postProcesses";
import { CommentProcessesProvider } from "./stores/commentProcesses";
import { PostsProvider } from "./stores/posts";
import { CommentsProvider } from "./stores/comments";
import { UserProvider } from "./stores/users";
import { Toaster } from "react-hot-toast";
import { GroupProvider } from "./stores/groups";
import { PageProvider } from "./stores/pages";
import { AIProvider } from "./stores/ai";
import { ProxyProvider } from "./stores/proxies";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex items-start">
          <div className="sticky top-0 flex flex-col border-gray-400 border-r min-h-dvh">
            <Link to="/" className="p-3 hover:bg-slate-100 border-gray-400 transition-all border-b">
              <BiHome className="text-xl" />
            </Link>
            <Link to="/users" className="p-3 hover:bg-slate-100 border-gray-400 transition-all border-b">
              <BiUser className="text-xl" />
            </Link>
            <Link to="/posts" className="p-3 hover:bg-slate-100 border-gray-400 transition-all border-b">
              <BiNews className="text-xl" />
            </Link>
            <Link to="/comments" className="p-3 hover:bg-slate-100 border-gray-400 transition-all border-b">
              <BiComment className="text-xl" />
            </Link>
            <Link to="/proxies" className="p-3 hover:bg-slate-100 border-gray-400 transition-all border-b">
              <BiWorld className="text-xl" />
            </Link>
            <Link to="/" className="p-3 mt-auto hover:bg-slate-100 border-gray-400 transition-all border-t">
              <CiSettings className="text-xl" />
            </Link>
          </div>
          <div className="flex-grow">
            {children}
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <>
    <ReactionProcessesProvider>
      <PostProcessesProvider>
        <CommentProcessesProvider>
          <PostsProvider>
            <CommentsProvider>
              <UserProvider>
                <AIProvider>
                  <ProxyProvider>
                    <GroupProvider>
                      <PageProvider>
                        <Toaster />
                        <Outlet />
                      </PageProvider>
                    </GroupProvider>
                  </ProxyProvider>
                </AIProvider>
              </UserProvider>
            </CommentsProvider>
          </PostsProvider>
        </CommentProcessesProvider>
      </PostProcessesProvider>
    </ReactionProcessesProvider>
  </>
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

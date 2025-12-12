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
import "./i18n/config";
import { useTranslation } from "react-i18next";
import { useEffect, useLayoutEffect, useState } from "react";
import Loading from "./components/Loading";
import { AuthProvider } from "./contexts/AuthContext";

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
  const { i18n } = useTranslation();
  // Use a stable initial value to prevent hydration mismatch
  const [currentLang, setCurrentLang] = useState('fr');
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    // Set the correct language after mounting on client
    setCurrentLang(i18n.language);
    setMounted(true);
  }, [i18n.language]);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => setCurrentLang(lng);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  const dir = currentLang === 'ar' ? 'rtl' : 'ltr';


  return (
    <html lang={currentLang} dir={dir}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="title" content="Driving School" />
        <meta
          name="description"
          content="Welcome to the Driving School!"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider>
          <Mount isMounted={mounted}>{children}</Mount>
        </AuthProvider>
        
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
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

function Mount({ children ,isMounted }: { children: React.ReactNode, isMounted: boolean }) {
  return isMounted ? <>{children}</> : <Loading className="min-h-screen flex justify-center items-center"/>;
}
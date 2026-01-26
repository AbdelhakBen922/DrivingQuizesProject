import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

export default function ErrorBoundary() {
  const error = useRouteError()
  
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-3xl font-bold mb-4">{message}</h1>
      <p className="text-lg mb-4">{details}</p>
      {stack && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

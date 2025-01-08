import Link from 'next/link'
import React from 'react'

const NotFoundContent = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-800">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-lg mb-6">
        {"Oops! The page you're looking for doesn't exist or has been moved."}
      </p>
      <Link
        href="/"
        className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  )
}

export default NotFoundContent
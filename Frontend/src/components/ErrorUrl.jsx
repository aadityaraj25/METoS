import React from 'react'

const ErrorUrl = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white font-sans">
      <div className="text-4xl sm:text-2xl font-medium pr-5 border-r border-[#333]">
        404
      </div>
      <div className="text-sm font-normal pl-5">
        This page could not be found.
      </div>
    </div>
  )
}

export default ErrorUrl
import React from 'react'

export default function HeaderBar() {
  return (
    <header className="w-full h-14 flex items-center justify-end px-4 md:px-6 gap-4 text-sm text-neutral-700 select-none">
      <nav className="hidden md:flex items-center gap-5">
        <a href="#" className="hover:underline">Gmail</a>
        <a href="#" className="hover:underline">Images</a>
      </nav>
      <button className="ml-2 p-2 rounded-full hover:bg-neutral-100" aria-label="Apps">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700"><circle cx="5" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="19" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/></svg>
      </button>
      <button className="ml-1 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">Sign in</button>
    </header>
  )
}

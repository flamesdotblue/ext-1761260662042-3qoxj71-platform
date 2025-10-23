import React from 'react'

export default function SearchBox() {
  return (
    <div className="w-full max-w-[580px] px-4">
      <div className="pointer-events-auto group flex items-center gap-3 w-full rounded-full border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow px-4 py-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input className="flex-1 outline-none placeholder:text-neutral-400" placeholder="Search Google or type a URL" />
        <div className="flex items-center gap-3 text-neutral-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17h.01"/><path d="M7 7h10v10H7z"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H15a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-3 pointer-events-auto">
        <button className="px-4 py-2 rounded bg-neutral-100 hover:bg-neutral-200 text-sm">Google Search</button>
        <button className="px-4 py-2 rounded bg-neutral-100 hover:bg-neutral-200 text-sm">I'm Feeling Lucky</button>
      </div>
    </div>
  )
}

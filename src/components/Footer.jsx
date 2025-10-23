import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full h-12 border-t border-neutral-200 text-xs text-neutral-600 flex items-center justify-center px-4 select-none">
      <div className="flex items-center gap-4">
        <a href="#" className="hover:underline">Advertising</a>
        <a href="#" className="hover:underline">Business</a>
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Terms</a>
      </div>
    </footer>
  )
}

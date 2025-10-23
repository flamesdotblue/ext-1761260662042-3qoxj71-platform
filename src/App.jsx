import React from 'react'
import HeaderBar from './components/HeaderBar'
import PhysicsGoogle from './components/PhysicsGoogle'
import SearchBox from './components/SearchBox'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-white text-neutral-900 flex flex-col">
      <HeaderBar />
      <main className="relative flex-1 flex items-center justify-center">
        <div className="absolute inset-0">
          <PhysicsGoogle />
        </div>
        <div className="pointer-events-none relative z-10 mt-40 md:mt-52 w-full flex justify-center">
          <SearchBox />
        </div>
      </main>
      <Footer />
    </div>
  )
}

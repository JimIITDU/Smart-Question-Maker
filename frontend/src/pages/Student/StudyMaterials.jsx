import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiBook, FiDownload, FiSearch } from 'react-icons/fi'

const StudyMaterials = () => {
  const [search, setSearch] = useState('')

  const materials = []

  const filtered = materials.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link to="/student" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiArrowLeft /></div>
            <span className="text-sm">Dashboard</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Study Materials</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Study <span className="text-amber-400">Materials</span></h1>
          <p className="text-gray-400">Access learning resources shared by your teachers</p>
        </div>

        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <FiBook className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No materials available yet</p>
            <p className="text-gray-600 text-sm">Your teachers will upload study materials here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((material, i) => (
              <div key={i} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <FiBook className="text-amber-400 text-xl" />
                </div>
                <h3 className="text-white font-bold mb-1">{material.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{material.description}</p>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition-all">
                  <FiDownload /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default StudyMaterials
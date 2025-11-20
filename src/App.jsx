import { useState } from 'react'
import BookManager from './components/BookManager'
import ChapterEditor from './components/ChapterEditor'

function App() {
  const [selectedBook, setSelectedBook] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      <header className="relative z-10 border-b border-slate-700/60 bg-slate-900/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/flame-icon.svg" alt="Flames" className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-white">Book Translation Studio</h1>
          </div>
          <a href="/test" className="text-blue-300 hover:text-blue-200 text-sm">System Status</a>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          <aside className="col-span-1">
            <BookManager onSelect={setSelectedBook} />
          </aside>
          <section className="col-span-2">
            {selectedBook ? (
              <ChapterEditor book={selectedBook} />
            ) : (
              <div className="h-96 rounded-xl border border-slate-700 bg-slate-800/50 flex items-center justify-center">
                <p className="text-slate-300">Select or create a book to start.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App

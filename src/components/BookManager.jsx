import { useEffect, useState } from 'react'

export default function BookManager({ onSelect }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', description: '' })
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${baseUrl}/api/books`)
      const data = await res.json()
      setBooks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const res = await fetch(`${baseUrl}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setForm({ title: '', author: '', description: '' })
      fetchBooks()
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Books</h2>

      <form onSubmit={submit} className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <input className="col-span-1 bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-white placeholder:text-slate-400" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <input className="col-span-1 bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-white placeholder:text-slate-400" placeholder="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} />
          <input className="col-span-1 bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-white placeholder:text-slate-400" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">Add Book</button>
        </div>
      </form>

      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {loading ? (
          <p className="text-blue-200">Loading...</p>
        ) : (
          books.map(b => (
            <button key={b.id} onClick={()=>onSelect(b)} className="w-full text-left bg-slate-800/60 border border-slate-700 hover:border-blue-500 rounded p-3">
              <p className="text-white font-medium">{b.title}</p>
              <p className="text-slate-300 text-sm">{b.author || 'Unknown'}</p>
            </button>
          ))
        )}
        {(!loading && books.length===0) && (
          <p className="text-slate-300">No books yet. Create one above.</p>
        )}
      </div>
    </div>
  )
}

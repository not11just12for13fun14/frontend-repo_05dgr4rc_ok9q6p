import { useEffect, useRef, useState } from 'react'

export default function ChapterEditor({ book }) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [chapters, setChapters] = useState([])
  const [sel, setSel] = useState(null)
  const [form, setForm] = useState({ title: '', source_language: 'en', target_language: 'es', source_text: '' })
  const [translation, setTranslation] = useState('')
  const evtSrcRef = useRef(null)

  const loadChapters = async () => {
    const res = await fetch(`${baseUrl}/api/chapters?book_id=${book.id}`)
    const data = await res.json()
    setChapters(data)
  }

  useEffect(() => {
    loadChapters()
    // subscribe to collaboration stream
    const es = new EventSource(`${baseUrl}/api/collab/stream`)
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (sel && msg.chapter_id === sel.id) {
          setTranslation(msg.content)
        }
      } catch {}
    }
    evtSrcRef.current = es
    return () => es.close()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, sel?.id])

  const createChapter = async (e) => {
    e.preventDefault()
    const payload = { ...form, book_id: book.id }
    const res = await fetch(`${baseUrl}/api/chapters`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if (res.ok) {
      setForm({ title: '', source_language: 'en', target_language: 'es', source_text: '' })
      loadChapters()
    }
  }

  const openChapter = async (c) => {
    setSel(c)
    setTranslation(c.translation_text || '')
  }

  const translate = async () => {
    const res = await fetch(`${baseUrl}/api/translate`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: sel.source_text, source_language: sel.source_language, target_language: sel.target_language }) })
    const data = await res.json()
    setTranslation(data.translated_text)
  }

  const save = async () => {
    if (!sel) return
    await fetch(`${baseUrl}/api/chapters/${sel.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ translation_text: translation }) })
    await publish(`${sel.title} updated`) // notify others
    await loadChapters()
  }

  const publish = async (content) => {
    await fetch(`${baseUrl}/api/collab/publish`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ chapter_id: sel?.id || '', user: 'editor', content: content ?? translation }) })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Chapters for {book.title}</h3>

      <form onSubmit={createChapter} className="bg-slate-800/60 border border-slate-700 rounded p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input className="bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-white placeholder:text-slate-400" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <div className="grid grid-cols-2 gap-2">
            <input className="bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-white" placeholder="From (en)" value={form.source_language} onChange={e=>setForm({...form,source_language:e.target.value})} />
            <input className="bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-white" placeholder="To (es)" value={form.target_language} onChange={e=>setForm({...form,target_language:e.target.value})} />
          </div>
        </div>
        <textarea rows={4} className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-white placeholder:text-slate-400" placeholder="Source text" value={form.source_text} onChange={e=>setForm({...form,source_text:e.target.value})} />
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">Add Chapter</button>
        </div>
      </form>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-2 max-h-[28rem] overflow-auto pr-1">
          {chapters.map(c => (
            <button key={c.id} onClick={()=>openChapter(c)} className={`w-full text-left rounded p-3 border ${sel?.id===c.id? 'border-blue-500 bg-slate-800/80':'border-slate-700 bg-slate-800/60'}`}>
              <p className="text-white font-medium">{c.title}</p>
              <p className="text-slate-400 text-xs">{c.source_language} → {c.target_language}</p>
            </button>
          ))}
          {chapters.length===0 && (
            <p className="text-slate-300 text-sm">No chapters yet. Create one above.</p>
          )}
        </div>

        <div className="col-span-2 space-y-3">
          {!sel ? (
            <div className="text-slate-300">Select a chapter to start translating.</div>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-800/60 border border-slate-700 rounded p-4">
                <h4 className="text-white font-semibold mb-2">Source</h4>
                <p className="text-slate-200 whitespace-pre-wrap text-sm">{sel.source_text}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">Translation</h4>
                  <div className="space-x-2">
                    <button onClick={translate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm">Auto-translate</button>
                    <button onClick={save} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Save</button>
                  </div>
                </div>
                <textarea rows={10} className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-white" value={translation} onChange={e=>setTranslation(e.target.value)} />
                <div className="flex justify-end mt-2">
                  <button onClick={()=>publish()} className="text-blue-300 hover:text-blue-200 text-xs">Broadcast live update</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

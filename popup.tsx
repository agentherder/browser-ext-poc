import { useState } from "react"

import { searchMessages } from "./db"
import type { Message } from "./types"

function IndexPopup() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Message[]>([])

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    const hits = await searchMessages(q)
    setResults(hits)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div style={{ padding: 16 }}>
      <input
        id="search"
        value={query}
        onChange={onChange}
        placeholder="Search messages..."
      />
      <ul id="results">
        {results.map((m) => (
          <li key={m.id} onClick={() => copyToClipboard(m.content)}>
            <b>{m.role}</b>: {m.content.slice(0, 80)}…
          </li>
        ))}
      </ul>
    </div>
  )
}

export default IndexPopup

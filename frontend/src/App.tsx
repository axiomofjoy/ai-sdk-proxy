import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { Streamdown } from 'streamdown'

type Provider = 'anthropic' | 'openai'

function getTextContent(parts: UIMessage['parts']): string {
  return parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map(p => p.text)
    .join('')
}

function Chat({ provider }: { provider: Provider }) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    api: `/api/chat?provider=${provider}`,
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5">
        {messages.length === 0 && (
          <p className="text-zinc-600 text-center mt-16 text-sm">Send a message to start chatting.</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[0.72rem] font-semibold uppercase tracking-wider ${m.role === 'user' ? 'text-blue-400' : 'text-zinc-600'}`}>
              {m.role === 'user' ? 'You' : provider === 'anthropic' ? 'Claude' : 'GPT'}
            </span>
            {m.role === 'assistant' ? (
              <div className="max-w-[90%] leading-relaxed text-sm">
                <Streamdown>{getTextContent(m.parts)}</Streamdown>
              </div>
            ) : (
              <p className="bg-[#1c2d4a] border border-[#2a4070] rounded-xl rounded-br-sm px-3.5 py-2.5 max-w-[75%] leading-relaxed text-sm">
                {getTextContent(m.parts)}
              </p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-600">
              {provider === 'anthropic' ? 'Claude' : 'GPT'}
            </span>
            <p className="text-zinc-600 animate-pulse text-sm">...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-zinc-800">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm outline-none transition-colors focus:border-zinc-500 placeholder:text-zinc-700 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-2.5 rounded-lg bg-blue-800 text-white text-sm font-medium cursor-pointer transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default function App() {
  const [provider, setProvider] = useState<Provider>('anthropic')

  return (
    <div className="flex flex-col h-full max-w-[800px] mx-auto w-full">
      <header className="px-4 py-4 border-b border-zinc-800 flex items-center gap-6">
        <h1 className="text-[1.1rem] font-semibold text-white">AI SDK Proxy</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-500">Provider:</label>
          <button
            onClick={() => setProvider('anthropic')}
            className={`px-3 py-1 rounded-md border text-sm transition-all cursor-pointer ${
              provider === 'anthropic'
                ? 'bg-zinc-900 border-zinc-500 text-white'
                : 'border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            Anthropic
          </button>
          <button
            onClick={() => setProvider('openai')}
            className={`px-3 py-1 rounded-md border text-sm transition-all cursor-pointer ${
              provider === 'openai'
                ? 'bg-zinc-900 border-zinc-500 text-white'
                : 'border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            OpenAI
          </button>
        </div>
      </header>
      <Chat key={provider} provider={provider} />
    </div>
  )
}

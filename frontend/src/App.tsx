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
    <div className="chat">
      <div className="messages">
        {messages.length === 0 && (
          <p className="empty">Send a message to start chatting.</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={`message ${m.role}`}>
            <span className="role">{m.role === 'user' ? 'You' : provider === 'anthropic' ? 'Claude' : 'GPT'}</span>
            {m.role === 'assistant' ? (
              <Streamdown>{getTextContent(m.parts)}</Streamdown>
            ) : (
              <p>{getTextContent(m.parts)}</p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <span className="role">{provider === 'anthropic' ? 'Claude' : 'GPT'}</span>
            <p className="thinking">...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

export default function App() {
  const [provider, setProvider] = useState<Provider>('anthropic')

  return (
    <div className="app">
      <header>
        <h1>AI SDK Proxy</h1>
        <div className="provider-toggle">
          <label>Provider:</label>
          <button
            className={provider === 'anthropic' ? 'active' : ''}
            onClick={() => setProvider('anthropic')}
          >
            Anthropic
          </button>
          <button
            className={provider === 'openai' ? 'active' : ''}
            onClick={() => setProvider('openai')}
          >
            OpenAI
          </button>
        </div>
      </header>
      <Chat key={provider} provider={provider} />
    </div>
  )
}

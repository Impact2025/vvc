"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Wat is de volgende wedstrijd?",
  "Hoe kan ik doneren?",
  "Wat zijn de sponsorpakketten?",
  "Wat is de huidige stand?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) throw new Error("Geen response");

      const data = await res.json();
      const reply = data.reply ?? "Er ging iets mis.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, er ging iets mis. Probeer het opnieuw." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-orange-600 active:scale-95 ${open ? "hidden" : ""}`}
        aria-label="Chat openen"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-500 text-white">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">VVC Assistent</p>
              <p className="text-xs text-white/70">Vragen over de tour? Vraag het!</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Sluiten"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 min-h-[8rem]">
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-400 pt-2">
                <Bot size={32} className="mx-auto mb-2 text-orange-300" />
                <p>Hallo! Ik help je graag met vragen over VVC Goes UK.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-orange-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {m.content || (
                    <span className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only when no messages) */}
          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Stel een vraag…"
              className="flex-1 text-sm bg-gray-50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-300 border border-gray-200"
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-orange-600 transition-colors"
              aria-label="Versturen"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

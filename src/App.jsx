import { useState, useRef, useEffect } from "react";

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    content: "Hi. I am ARIA, your AI assistant. How can I help you today?",
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  },
];


const SUGGESTED = [
  "How does the rental or subscription work?",
  "How can I return or exchange my device?",
  "My device is damaged or broken — what should I do?",
];
function generateCode(length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
};

const UNIQUE_ID = generateCode();

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 message-enter">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 glow-pulse">
        <span className="text-xs font-bold text-white font-mono-custom">A</span>
      </div>
      <div className="bg-[#13131f] border border-[#1e1e30] rounded-2xl rounded-bl-sm px-5 py-4">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              style={{
                animation: `blink 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono-custom
          ${isUser
            ? "bg-[#1e1e30] border border-[#2a2a45] text-indigo-300"
            : "bg-indigo-600 text-white glow-pulse"
          }`}
      >
        {isUser ? "U" : "A"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[72%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-[#13131f] border border-[#1e1e30] text-gray-200 rounded-bl-sm"
            }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-gray-600 font-mono-custom px-1">{msg.time}</span>
      </div>
      </>
  );
}

function RatingButtons({ msgId, ratings, setRatings }) {
  const current = ratings[msgId];
  return (
    <div className="flex gap-2 mt-1 pl-11">
      {['up', 'down'].map((type) => (
        <button key={type} onClick={() => setRatings(r => ({ ...r, [msgId]: type }))}
          className={`text-sm px-2 py-1 rounded-lg border transition-all
            ${current === type ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-[#2a2a40] text-gray-600 hover:text-gray-400'}`}>
          {type === 'up' ? '👍' : '👎'}
        </button>
      ))}
    </div>
  );
}



export default function App() {
  const [ratings, setRatings] = useState({}); // { messageId: 'up' | 'down' }
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg = {
      // id: Date.now(),
      id:Date.now(),
      CHAT_ID: UNIQUE_ID,
      role: "user",
      content,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Call Anthropic API
    
    try {
      const response = await fetch("https://n8n.srv1707124.hstgr.cloud/webhook/d488e960-ed05-410a-9922-c03cafbde4b6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "Tu es un agent IA d'EVOLLYS, un assistant IA élégant et concis. Réponds toujours en français, de façon claire et utile.",
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content, id: m.CHAT_ID })),
            { role: "user", content, id: userMsg.CHAT_ID },
          ],
        }),
      });

      const data = await response.json();
      console.log(data);
      const reply = data.reply || "Je n'ai pas pu générer une réponse.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      console.log("Error during fetch", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Une erreur est survenue. Vérifiez votre connexion et réessayez.",
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  //const lastAssistantId = [...messages].reverse().find(m => m.role === 'assistant')?.id;
  const lastAssistantId = () => {
    const lastid = [...messages].reverse().find(m => m.role === 'assistant')?.id;
    return Lastid;
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-900/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl flex flex-col h-[90vh] max-h-[800px]">
        {/* Header */}
        <div className="relative bg-[#0d0d18]/80 backdrop-blur border border-[#1e1e30] rounded-t-3xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative float">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center glow-pulse">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.659 1.591L19 14.5m0 0l-2.475 2.475A2.25 2.25 0 0115 18.75H9a2.25 2.25 0 01-1.525-.589L5 14.5m14 0H5" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0d0d18]" />
            </div>
            <div>
              <h1 className="font-display font-800 text-white text-lg leading-none tracking-tight">ARIA</h1>
              <p className="text-[11px] text-emerald-400 font-mono-custom mt-0.5">● En ligne</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages(INITIAL_MESSAGES)}
              className="w-8 h-8 rounded-lg bg-[#1a1a28] border border-[#2a2a40] flex items-center justify-center text-gray-500 hover:text-gray-300 hover:border-indigo-500/50 transition-all"
              title="Nouvelle conversation"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scroll bg-[#0d0d18]/60 backdrop-blur border-x border-[#1e1e30] px-5 py-6 flex flex-col gap-5">
          {messages.map((msg) => (
             <div className={`flex items-end gap-3 message-enter ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <Message key={msg.id} msg={msg} />
            {msg.id === lastAssistantId && !isTyping && (
              <RatingButtons msgId={msg.id} ratings={ratings} setRatings={setRatings} />
             )
            }
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          
          
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && !isTyping && (
          <div className="bg-[#0d0d18]/60 border-x border-[#1e1e30] px-5 pb-3 flex gap-2 flex-wrap">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#1a1a28] border border-[#2a2a40] text-gray-400 hover:text-indigo-300 hover:border-indigo-500/50 transition-all font-mono-custom"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-[#0d0d18]/80 backdrop-blur border border-[#1e1e30] rounded-b-3xl px-4 py-4">
          <div className="flex items-end gap-3 bg-[#13131f] border border-[#1e1e30] rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Écrivez un message..."
              rows={1}
              className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-600 resize-none outline-none font-display leading-relaxed max-h-32 custom-scroll"
              style={{ minHeight: "24px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-700 mt-2 font-mono-custom">
            Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
          </p>
        </div>
      </div>
    </div>
  );
}

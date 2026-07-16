import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Mic, Sparkles, User, Briefcase, Calendar, Clock, AlertTriangle } from "lucide-react";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export const DoctorChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ sender: "ai", text: "Hello Dr. Sharma! I am your AI Clinical Assistant. How can I assist you with your consultations today?" }]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate morning brief on load
    const generateBrief = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/doctor-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query: "Generate a concise morning brief for Dr. Sharma, summarizing appointments, queue status, and next patient overview.",
            history: []
          })
        });
        const data = await response.json();
        setMessages([{ sender: "ai", text: data.response }]);
      } catch (err) {
        setMessages([{ sender: "ai", text: "Welcome Dr. Sharma! Error loading briefing." }]);
      } finally {
        setLoading(false);
      }
    };
    generateBrief();
  }, []);

  const sendMessage = async () => {
    if (!query.trim()) return;
    const userMsg = { sender: "user" as const, text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/doctor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.text, history: messages })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: "ai", text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "ai", text: "Sorry, I couldn't process that request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform"
      >
        <Sparkles size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2"><Sparkles size={16} className="text-emerald-600" /> AI Clinical Assistant</h3>
            <button onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`p-3 rounded-2xl text-xs max-w-[80%] ${m.sender === "ai" ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 self-start" : "bg-emerald-700 text-white self-end"}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="text-[10px] text-slate-400">Assistant is thinking...</div>}
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button className="p-2 text-slate-400 hover:text-emerald-700" onClick={() => alert("Voice input feature coming soon!")}>
              <Mic size={16} />
            </button>
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3"
              placeholder="Ask about schedule or patients..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="p-2 bg-emerald-700 text-white rounded-xl"><Send size={14} /></button>
          </div>
        </div>
      )}
    </>
  );
};

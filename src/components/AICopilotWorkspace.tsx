import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Search, Plus, Trash2, Edit2, Send, Activity, Info, Calendar, Pill, AlertTriangle, ChevronRight, User, X, Loader2, Star, Volume2, VolumeX, Mic, MicOff, Globe, Play, Pause, Square, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  widget?: string;
  widgetData?: any;
}

interface AIConversation {
  id: string;
  title: string;
  sessionMode: "doctor" | "patient";
  patientId: string | null;
  messages: ChatMessage[];
  updatedAt: string;
}

interface AICopilotWorkspaceProps {
  sessionMode: "doctor" | "patient";
  patientId?: string;
  onAction?: (action: any) => void;
}

export const AICopilotWorkspace: React.FC<AICopilotWorkspaceProps> = ({ sessionMode, patientId, onAction }) => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Voice Assistant State
  const [voiceLang, setVoiceLang] = useState<"en" | "hi" | "te" | "auto">("auto");
  const [isListening, setIsListening] = useState(false);
  const [recognitionTranscript, setRecognitionTranscript] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [autoReadEnabled, setAutoReadEnabled] = useState(true);
  
  // Speech Synthesis active states
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  // Refs for audio processing
  const recognitionRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const transcriptRef = useRef<string>("");

  // Keep transcriptRef.current updated so onend can access it fresh
  useEffect(() => {
    transcriptRef.current = recognitionTranscript;
  }, [recognitionTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e){}
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setCurrentlySpeakingMsgId(null);
    setIsSpeechPaused(false);
  };

  const pauseSpeaking = () => {
    if (currentlySpeakingMsgId) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (currentlySpeakingMsgId && isSpeechPaused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
    }
  };

  const cleanupRecognition = () => {
    setIsListening(false);
    setNoiseLevel(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    cleanupRecognition();
  };

  const speakResponse = (text: string, msgId?: string) => {
    window.speechSynthesis.cancel();
    setIsSpeechPaused(false);

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    let langCode = "en-US";
    if (voiceLang === "hi") langCode = "hi-IN";
    else if (voiceLang === "te") langCode = "te-IN";
    else langCode = "en-US";
    
    utterance.lang = langCode;
    
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      if (msgId) setCurrentlySpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setCurrentlySpeakingMsgId(null);
      setIsSpeechPaused(false);
      
      // If continuous mode is enabled, automatically restart listening
      if (isContinuousMode) {
        setTimeout(() => {
          startListening();
        }, 600);
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setCurrentlySpeakingMsgId(null);
      setIsSpeechPaused(false);
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const checkAndExecuteVoiceCommand = (text: string): boolean => {
    const cleanText = text.toLowerCase().trim();
    
    // Switch Views
    if (cleanText.includes("switch to doctor view") || cleanText.includes("doctor view") || cleanText.includes("doctor workspace")) {
      speakResponse("Switching to practitioner dashboard.");
      onAction?.({ type: "SET_SESSION_MODE", mode: "doctor" });
      return true;
    }
    if (cleanText.includes("switch to patient view") || cleanText.includes("patient view") || cleanText.includes("patient workspace")) {
      speakResponse("Switching to patient portal.");
      onAction?.({ type: "SET_SESSION_MODE", mode: "patient" });
      return true;
    }

    // Navigation Commands
    if (cleanText.includes("open timeline") || cleanText.includes("show timeline") || cleanText.includes("medical timeline")) {
      speakResponse("Opening your medical timeline.");
      onAction?.({ type: "SET_TAB", tab: "timeline" });
      return true;
    }
    if (cleanText.includes("open doctor discovery") || cleanText.includes("find a doctor") || cleanText.includes("show doctors") || cleanText.includes("book cardiologist") || cleanText.includes("cardiologist")) {
      speakResponse("Opening doctor discovery.");
      onAction?.({ type: "SET_TAB", tab: "doctors" });
      return true;
    }
    if (cleanText.includes("show medications") || cleanText.includes("open pharmacy") || cleanText.includes("order medicines")) {
      speakResponse("Showing active medications.");
      onAction?.({ type: "SET_TAB", tab: "store" });
      return true;
    }
    if (cleanText.includes("show reports") || cleanText.includes("open reports") || cleanText.includes("latest reports")) {
      speakResponse("Showing medical reports in your timeline.");
      onAction?.({ type: "SET_TAB", tab: "timeline" });
      return true;
    }
    if (cleanText.includes("open telehealth") || cleanText.includes("start telehealth") || cleanText.includes("video call")) {
      speakResponse("Initiating a telehealth video call with Doctor Rajesh Varma.");
      onAction?.({ type: "TRIGGER_TELEHEALTH" });
      return true;
    }

    // Synchronize tab for medical OCR but still send to AI
    if (cleanText.includes("blood report") || cleanText.includes("lab results") || cleanText.includes("lab report")) {
      onAction?.({ type: "SET_TAB", tab: "timeline" });
    }

    return false;
  };

  const startListening = () => {
    stopSpeaking();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please use a modern browser like Chrome, Safari, or Edge.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e){}
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;

    let langCode = "en-US";
    if (voiceLang === "hi") langCode = "hi-IN";
    else if (voiceLang === "te") langCode = "te-IN";
    else langCode = "en-US";
    
    rec.lang = langCode;

    rec.onstart = () => {
      setIsListening(true);
      setRecordingSeconds(0);
      setRecognitionTranscript("");
      
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = setInterval(() => {
        setNoiseLevel(Math.floor(Math.random() * 80) + 20);
      }, 120);
    };

    rec.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const currentText = finalTranscript || interimTranscript;
      setRecognitionTranscript(currentText);

      // Automated Language Detection
      if (voiceLang === "auto" && currentText.trim()) {
        const hindiRegex = /[\u0900-\u097F]/;
        const teluguRegex = /[\u0c00-\u0c7F]/;
        if (teluguRegex.test(currentText)) {
          setVoiceLang("te");
        } else if (hindiRegex.test(currentText)) {
          setVoiceLang("hi");
        }
      }
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      cleanupRecognition();
    };

    rec.onend = () => {
      cleanupRecognition();
      const finalVal = transcriptRef.current;
      if (finalVal.trim()) {
        sendSpokenMessage(finalVal);
      } else {
        if (isContinuousMode) {
          setIsContinuousMode(false);
        }
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const startContinuousConversation = () => {
    setIsContinuousMode(true);
    let greeting = "Hello Supriya! I am your HealthTribe AI Copilot. Speak or type your symptoms. I will calculate critical safety alarms and guide your next clinical booking.";
    
    if (sessionMode === "doctor") {
      greeting = "Welcome, Dr. Supriya Kilari. I am your Clinical Assistant. Speak to draft SOAP notes, summarize patients, or review lab values.";
    }

    if (voiceLang === "te") {
      greeting = sessionMode === "doctor"
        ? "స్వాగతం, డాక్టర్ సుప్రియ కిలారి. నేను మీ క్లినికల్ అసిస్టెంట్. సహాయం కోసం మాట్లాడండి."
        : "హలో సుప్రియ! నేను మీ హెల్త్‌ట్రైబ్ AI కోపైలట్. మీ లక్షణాలను మాట్లాడండి.";
    } else if (voiceLang === "hi") {
      greeting = sessionMode === "doctor"
        ? "स्वागत है, डॉ. सुप्रिया किलारी। मैं आपकी क्लिनिकल असिस्टेंट हूं। सहायता के लिए बात करें।"
        : "नमस्ते सुप्रिया! मैं आपकी हेल्थट्राइब एआई कोपायलट हूं। अपने लक्षणों के बारे में बात करें।";
    }

    speakResponse(greeting, "greeting");
  };

  const sendSpokenMessage = async (text: string) => {
    const isCommand = checkAndExecuteVoiceCommand(text);
    if (isCommand) {
      setRecognitionTranscript("");
      transcriptRef.current = "";
      return;
    }

    let currentConvId = activeConvId;
    if (!currentConvId) {
      try {
        const res = await fetch(`/api/ai-conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Conversation", sessionMode, patientId })
        });
        const data = await res.json();
        currentConvId = data.id;
        setConversations([data, ...conversations]);
        setActiveConvId(currentConvId);
      } catch (e) {
        return;
      }
    }

    setQuery("");
    const tempMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setLoading(true);

    try {
      const res = await fetch(`/api/ai-conversations/${currentConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sender: "user", patientContext, language: voiceLang })
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      const aiMsg = data.aiMessage;
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempMsg.id);
        return [...filtered, data.userMessage, aiMsg];
      });
      
      setConversations(prev => prev.map(c => c.id === currentConvId ? { ...c, title: data.title } : c));

      if (autoReadEnabled && aiMsg && aiMsg.text) {
        const cleanSpeechText = aiMsg.text
          .replace(/[#*`_~\[\]()\-+]/g, " ")
          .replace(/\{[\s\S]*?\}/g, "");
        speakResponse(cleanSpeechText, aiMsg.id);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempMsg.id);
        return [...filtered, tempMsg, { id: "err-" + Date.now(), sender: "ai", text: "Unable to send message.\n\nPlease try again.", timestamp: new Date().toISOString() }];
      });
    } finally {
      setLoading(false);
      setRecognitionTranscript("");
      transcriptRef.current = "";
    }
  };

  const [loadingStage, setLoadingStage] = useState(0);
  const loadingMessages = [
    "Reviewing patient timeline...",
    "Analyzing previous consultations...",
    "Reviewing laboratory results...",
    "Checking medications...",
    "Generating recommendations...",
    "Preparing clinical summary..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [patientContext, setPatientContext] = useState<any>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Fetch conversations on load
  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/ai-conversations?sessionMode=${sessionMode}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        loadConversation(list[0].id);
      }
    } catch (e) {
      console.error(e);
      setConversations([]);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [sessionMode]);

  // Load contextual patient info
  useEffect(() => {
    if (sessionMode === "doctor" && patientId) {
      // Mocked context fetch or build from patientId
      const p = patientId === "fam-self" ? { name: "Supriya Kilari", age: 29, gender: "Female", group: "O+", allergies: "Peanuts, Penicillin", chronic: "Mild Asthma", medications: "Inhaler (SOS)", recentLab: "Normal" } :
                patientId === "fam-1" ? { name: "Rami Kilari", age: 58, gender: "Male", group: "O+", allergies: "None", chronic: "Type 2 Diabetes, Hypertension", medications: "Metformin 500mg, Ramipril 5mg", recentLab: "HbA1c 8.5%" } :
                patientId === "fam-2" ? { name: "Lakshmi Kilari", age: 54, gender: "Female", group: "A+", allergies: "Sulfa drugs", chronic: "Thyroid", medications: "Thyronorm 50mcg", recentLab: "TSH 4.2" } :
                patientId === "ext-1" ? { name: "Ramesh Sharma", age: 64, gender: "Male", group: "B+", allergies: "Penicillin, Sulfa", chronic: "Post-Angioplasty Rehabilitation, Stage II Hypertension", medications: "Aspirin 75mg, Clopidogrel 75mg", recentLab: "Elevated LDL" } :
                { name: "Unknown Patient", age: 0, gender: "Unknown", group: "?", allergies: "None", chronic: "None", medications: "None", recentLab: "None" };
      setPatientContext(p);
    } else {
      setPatientContext(null);
    }
  }, [sessionMode, patientId]);

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-conversations/${id}`);
      const data = await res.json();
      if (data && data.id) {
        setActiveConvId(data.id);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
      setMessages([]);
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await fetch(`/api/ai-conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation", sessionMode, patientId })
      });
      const data = await res.json();
      setConversations([data, ...conversations]);
      setActiveConvId(data.id);
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  };

  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditConversation = (conv: AIConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEditConversation = async (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      await fetch(`/api/ai-conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() })
      });
      setConversations(conversations.map(c => c.id === id ? { ...c, title: editTitle.trim() } : c));
      setEditingConvId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai-conversations/${id}`, { method: "DELETE" });
      setConversations(conversations.filter(c => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async () => {
    if (!query.trim()) return;
    
    stopSpeaking();
    
    let currentConvId = activeConvId;
    if (!currentConvId) {
       // Create one on the fly
       try {
         const res = await fetch(`/api/ai-conversations`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ title: "New Conversation", sessionMode, patientId })
         });
         const data = await res.json();
         currentConvId = data.id;
         setConversations([data, ...conversations]);
         setActiveConvId(currentConvId);
       } catch (e) {
         return;
       }
    }

    const text = query;
    setQuery("");
    
    // Optimistic UI
    const tempMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setLoading(true);

    try {
      const res = await fetch(`/api/ai-conversations/${currentConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sender: "user", patientContext, language: voiceLang })
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      const aiMsg = data.aiMessage;
      setMessages(prev => {
        // remove optimistic and add real
        const filtered = prev.filter(m => m.id !== tempMsg.id);
        return [...filtered, data.userMessage, aiMsg];
      });
      
      // Update title in sidebar
      setConversations(prev => prev.map(c => c.id === currentConvId ? { ...c, title: data.title } : c));

      // Auto-read response if enabled
      if (autoReadEnabled && aiMsg && aiMsg.text) {
        const cleanSpeechText = aiMsg.text
          .replace(/[#*`_~\[\]()\-+]/g, " ")
          .replace(/\{[\s\S]*?\}/g, "");
        speakResponse(cleanSpeechText, aiMsg.id);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempMsg.id);
        return [...filtered, tempMsg, { id: "err-" + Date.now(), sender: "ai", text: "Unable to send message.\n\nPlease try again.", timestamp: new Date().toISOString() }];
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === "ai" && lastMsg.text) {
        try {
          const jsonRegex = /\{[\s\S]*?(?:action|type)[\s\S]*?\}/g;
          const match = lastMsg.text.match(jsonRegex);
          if (match) {
            const parsed = JSON.parse(match[match.length - 1].trim());
            const act = parsed.action || parsed.type;
            const docId = parsed.doctorId || parsed.doctor_id;
            if (act && docId && onAction) {
              const processedKey = `processed_${lastMsg.id || messages.length}`;
              if (!sessionStorage.getItem(processedKey)) {
                sessionStorage.setItem(processedKey, "true");
                onAction({ type: act, doctorId: docId });
              }
            }
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    }
  }, [messages, onAction]);

  const filteredConversations = conversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const mainBg = sessionMode === "doctor" ? "bg-slate-50 dark:bg-slate-900" : "bg-white dark:bg-slate-900";
  const primaryColor = sessionMode === "doctor" ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-emerald-600 text-white hover:bg-emerald-700";
  const primaryText = sessionMode === "doctor" ? "text-emerald-700 dark:text-emerald-400" : "text-emerald-600 dark:text-emerald-400";
  const aiBubbleBg = sessionMode === "doctor" ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700";

  return (
    <div className={`flex h-[calc(100vh-80px)] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm ${mainBg}`}>
      {/* LEFT SIDEBAR: History */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <button 
            onClick={createNewConversation}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${primaryColor}`}
          >
            <Plus className="w-4 h-4" /> New Conversation
          </button>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {filteredConversations.length === 0 && (
            <div className="text-center p-6 text-slate-400 text-xs">No conversations found.</div>
          )}
          {filteredConversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeConvId === conv.id ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30" : "hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent"}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeConvId === conv.id ? primaryText : "text-slate-400"}`} />
                {editingConvId === conv.id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEditConversation(conv.id, e)}
                    onClick={e => e.stopPropagation()}
                    onBlur={(e) => saveEditConversation(conv.id, e as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 text-xs text-slate-900 dark:text-white"
                  />
                ) : (
                  <div className="truncate text-xs font-medium dark:text-slate-200">{conv.title}</div>
                )}
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 gap-0.5">
                <button 
                  onClick={(e) => startEditConversation(conv, e)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button 
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="p-2 text-slate-500 hover:text-emerald-600 bg-slate-50 dark:bg-slate-800 rounded-lg dark:text-slate-400"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-slate-900 dark:text-white truncate mx-2">
            {activeConvId ? conversations.find(c => c.id === activeConvId)?.title : (sessionMode === "doctor" ? "AI Copilot" : "AI Assistant")}
          </span>
          <div className="w-9" /> {/* spacer */}
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="md:hidden absolute inset-0 z-50 flex">
            <div className="w-3/4 max-w-sm bg-white dark:bg-slate-950 h-full flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-slide-right">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">History</span>
                <button onClick={() => setShowMobileSidebar(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 border-b border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => { createNewConversation(); setShowMobileSidebar(false); }}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${primaryColor}`}
                >
                  <Plus className="w-4 h-4" /> New Conversation
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {conversations.map(conv => (
                  <div 
                    key={conv.id}
                    onClick={() => { loadConversation(conv.id); setShowMobileSidebar(false); }}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer ${activeConvId === conv.id ? "bg-emerald-50 dark:bg-emerald-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                  >
                    <div className="truncate text-xs font-medium dark:text-slate-200">{conv.title}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)}></div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${sessionMode === 'doctor' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'}`}>
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {sessionMode === "doctor" ? "Doctor AI Copilot" : "HealthTribe AI Assistant"}
                </h2>
                <p className="text-sm text-slate-500 mt-2 max-w-md dark:text-slate-400">
                  {sessionMode === "doctor" 
                    ? "Your intelligent clinical assistant. Analyze lab reports, draft SOAP notes, or review medical histories with full context."
                    : "Your personal health companion. Ask about symptoms, medications, or book appointments instantly."}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id || i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-3xl p-5 ${
                  msg.sender === "user" 
                    ? `${primaryColor} rounded-tr-sm shadow-sm` 
                    : `${aiBubbleBg} border rounded-tl-sm shadow-sm`
                }`}>
                  {msg.sender === "ai" ? (
                    <div>
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:leading-relaxed prose-a:text-emerald-600 prose-li:my-0.5 marker:text-emerald-500 dark:text-slate-200">
                        <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                      </div>
                      
                      {/* Speaker Controls */}
                      <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {currentlySpeakingMsgId === msg.id ? (
                            <>
                              {isSpeechPaused ? (
                                <button 
                                  onClick={resumeSpeaking} 
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 transition-all cursor-pointer"
                                  title="Resume"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button 
                                  onClick={pauseSpeaking} 
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 transition-all cursor-pointer"
                                  title="Pause"
                                >
                                  <Pause className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={stopSpeaking} 
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer"
                                  title="Stop"
                              >
                                <Square className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => {
                                const cleanText = msg.text
                                  .replace(/[#*`_~\[\]()\-+]/g, " ")
                                  .replace(/\{[\s\S]*?\}/g, "");
                                speakResponse(cleanText, msg.id);
                              }} 
                              className="p-1.5 rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
                              title="Speak"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              const cleanText = msg.text
                                .replace(/[#*`_~\[\]()\-+]/g, " ")
                                .replace(/\{[\s\S]*?\}/g, "");
                              speakResponse(cleanText, msg.id);
                            }} 
                            className="text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-all cursor-pointer"
                            title="Replay from beginning"
                          >
                            Replay
                          </button>
                        </div>
                        {currentlySpeakingMsgId === msg.id && !isSpeechPaused && (
                          <div className="flex gap-0.5 items-center">
                            <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="w-1 h-4.5 bg-emerald-500 rounded-full animate-pulse delay-75"></span>
                            <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse delay-150"></span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
                  
                  
                  {msg.widget === "doctors" && msg.widgetData && (
                    <div className="mt-4 grid gap-3">
                      {msg.widgetData.map((doc: any) => (
                        <div key={doc.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                            <p className="text-sm text-slate-500">{doc.specialty} • {doc.experience}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              {doc.rating}
                            </div>
                          </div>
                          <button onClick={() => onAction && onAction({ type: "OPEN_BOOKING", doctorId: doc.id })} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer uppercase tracking-wider">
                            BOOK APPOINTMENT
                          </button>
                          <button onClick={() => onAction && onAction({ type: "OPEN_DOCTOR_PROFILE", doctorId: doc.id })} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-black rounded-xl transition-all cursor-pointer ml-2 uppercase tracking-wider">
                            VIEW PROFILE
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.widget === "timeline" && msg.widgetData && (
                    <div className="mt-4 flex flex-col gap-2">
                      {msg.widgetData.map((event: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border border-slate-100 dark:border-slate-700">
                           <div className="font-semibold text-slate-700 dark:text-slate-300">{event.date} - {event.category}</div>
                           <div className="text-slate-500">{event.details}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.text.includes("Unable to send message") && (
                    <button 
                      onClick={() => {
                        // find the last user message
                        const lastUserMsg = messages.slice().reverse().find(m => m.sender === 'user');
                        if (lastUserMsg) {
                          setQuery(lastUserMsg.text);
                        }
                      }}
                      className="mt-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all border border-slate-200 dark:border-slate-600"
                    >
                      Retry Message
                    </button>
                  )}

                  <div className={`text-[10px] mt-2 opacity-60 flex justify-end ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className={`max-w-[85%] rounded-3xl p-5 border rounded-tl-sm shadow-sm flex items-center gap-3 ${aiBubbleBg}`}>
                <Loader2 className={`w-4 h-4 animate-spin ${primaryText}`} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {sessionMode === "doctor" ? loadingMessages[loadingStage] : "Thinking..."}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* VOICE HUD OVERLAY */}
        {isListening && (
          <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-bounce-short">
            <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-emerald-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Listening...</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-slate-800 text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {voiceLang === "auto" ? "Detecting..." : voiceLang === "te" ? "Telugu" : voiceLang === "hi" ? "Hindi" : "English"}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">
                    {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
                  </span>
                </div>
              </div>
              
              {/* Animated Waveform */}
              <div className="flex items-end justify-center gap-1 h-12 py-1">
                {[...Array(24)].map((_, idx) => {
                  // Generate random-looking height scales based on noiseLevel state
                  const baseHeight = (idx % 4 === 0 ? 20 : idx % 3 === 0 ? 45 : idx % 2 === 0 ? 65 : 30);
                  const randomFluctuation = Math.sin((idx + noiseLevel) * 0.5) * 15;
                  const finalHeight = Math.max(10, Math.min(100, (noiseLevel / 100) * baseHeight + randomFluctuation));
                  return (
                    <div 
                      key={idx} 
                      className="w-1.5 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full transition-all duration-100" 
                      style={{ height: `${finalHeight}%` }}
                    />
                  );
                })}
              </div>
              
              {/* Subtitle / Real-time Transcript */}
              <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Live Transcription</p>
                <p className="text-xs leading-relaxed text-slate-200 font-medium italic min-h-[16px]">
                  {recognitionTranscript || "Speak now... (Silence triggers auto-submit)"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* INPUT AREA */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Voice Auxiliary Controls Bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-2.5 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-3">
              {/* Continuous Conversation Mode Trigger */}
              {isContinuousMode ? (
                <button
                  onClick={() => {
                    setIsContinuousMode(false);
                    stopSpeaking();
                    stopListening();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition-all cursor-pointer animate-pulse"
                >
                  <Square className="w-3 h-3" /> End Conversation
                </button>
              ) : (
                <button
                  onClick={startContinuousConversation}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-200" /> Start Conversation
                </button>
              )}

              {/* Auto-Read Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={autoReadEnabled}
                  onChange={(e) => setAutoReadEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  Auto-Speak
                </span>
              </label>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lang:</span>
              <select
                value={voiceLang}
                onChange={(e) => {
                  setVoiceLang(e.target.value as any);
                  stopSpeaking();
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-600 dark:text-slate-300 py-0.5 px-2 focus:ring-1 focus:ring-emerald-500/20 outline-none cursor-pointer"
              >
                <option value="auto">🇮🇳 Auto Detect</option>
                <option value="en">🇮🇳 English</option>
                <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                <option value="te">🇮🇳 తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>

          <div className="p-4">
            <div className="max-w-4xl mx-auto relative flex items-center gap-2">
              <div className="relative flex-1">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={sessionMode === "doctor" ? "Message Doctor AI Copilot..." : "Ask your AI Assistant..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl py-4 pl-5 pr-24 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none min-h-[60px] max-h-[200px] custom-scrollbar dark:text-white"
                  rows={1}
                />
                
                {/* Action Buttons */}
                <div className="absolute right-3 bottom-2.5 flex items-center gap-1.5">
                  {isListening ? (
                    <button
                      onClick={stopListening}
                      className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer animate-pulse"
                      title="Stop listening"
                    >
                      <MicOff className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={startListening}
                      className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition-all cursor-pointer"
                      title="Voice Command"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}

                  <button 
                    onClick={sendMessage}
                    disabled={!query.trim() || loading}
                    className={`p-2 rounded-full transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${query.trim() ? primaryColor : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-3 text-[10px] text-slate-400">
            AI Assistant can make mistakes. Consider verifying critical {sessionMode === 'doctor' ? 'clinical' : 'medical'} information.
          </div>
        </div>
      </div>            {/* RIGHT CONTEXT PANEL (Doctor Only) */}
      {sessionMode === "doctor" && (
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col shrink-0 hidden lg:flex h-full sticky top-0">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs z-10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Clinical EHR Summary</h3>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Active Sync
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
            {patientContext ? (
              <div className="space-y-6">
                {/* Patient Snapshot */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/55 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-inner mx-auto mb-3 border border-emerald-100 dark:border-emerald-900/40">
                    {patientContext.name.charAt(0)}
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight leading-tight">{patientContext.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Medical Record ID</p>
                  
                  {/* Demographics Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-center">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Age</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{patientContext.age} Yrs</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-center">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Gender</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{patientContext.gender}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-center">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Blood</p>
                      <p className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5">{patientContext.group}</p>
                    </div>
                  </div>
                </div>

                {/* Grouped Clinical Info Cards */}
                <div className="space-y-4">
                  {/* 1. Allergies */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Allergic Sensitivities</span>
                    </div>
                    {patientContext.allergies !== "None" ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patientContext.allergies.split(",").map((allergy: string, idx: number) => (
                          <span key={idx} className="bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/30">
                            {allergy.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-400 italic">No known allergic reactions</p>
                    )}
                  </div>

                  {/* 2. Conditions */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Conditions</span>
                    </div>
                    {patientContext.chronic !== "None" ? (
                      <div className="space-y-1.5">
                        {patientContext.chronic.split(",").map((cond: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span>{cond.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-400 italic">No chronic medical history</p>
                    )}
                  </div>

                  {/* 3. Medications */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Pill className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Medication List</span>
                    </div>
                    {patientContext.medications !== "None" ? (
                      <div className="space-y-1.5">
                        {patientContext.medications.split(",").map((med: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                            <Pill className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate">{med.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-400 italic">No current active prescriptions</p>
                    )}
                  </div>

                  {/* 4. Lab Insights */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Info className="w-3.5 h-3.5 text-sky-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biomarker & Lab Alerts</span>
                    </div>
                    <div className="bg-sky-50/50 dark:bg-sky-950/25 border border-sky-100 dark:border-sky-900/30 p-2.5 rounded-xl">
                      <p className="text-xs font-extrabold text-sky-900 dark:text-sky-300 leading-snug">
                        {patientContext.recentLab}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center opacity-60 space-y-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">EHR Standby</p>
                  <p className="text-xs text-slate-500 mt-1">Select a patient to sync clinical workspace.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
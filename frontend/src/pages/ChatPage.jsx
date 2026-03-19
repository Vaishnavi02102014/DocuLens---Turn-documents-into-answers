import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import { useLocation } from "react-router-dom";

import {
  Send,
  Bot,
  Star,
  Menu,
  ChevronDown,
  User,
  FileText
} from "lucide-react";

function ChatPage() {

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const chatEndRef = useRef(null);
  const location = useLocation(); 

  /* LOAD CHAT FROM SESSION */

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("chatMessages");
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  }, []);

  /* SAVE CHAT */

  const prevLength = useRef(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (messages.length > 0) {
      sessionStorage.setItem(
        "chatMessages",
        JSON.stringify(messages)
      );
    }

    if (messages.length > prevLength.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevLength.current = messages.length;

  }, [messages]);

  /* ✅ SYNC LISTENER (ADDED ONLY THIS BLOCK) */

  useEffect(() => {

    const syncHandler = async () => {
      try {
        const res = await API.get("/starred-questions");
        const starredList = res.data;

        const saved = sessionStorage.getItem("chatMessages");
        if (!saved) return;

        const currentMessages = JSON.parse(saved);

        const updatedMessages = currentMessages.map(msg => {

          if (msg.role !== "ai") return msg;

          const match = starredList.find(
            item =>
              item.question.trim().toLowerCase() ===
              msg.question?.trim().toLowerCase()
          );

          if (match) {
            return {
              ...msg,
              starred: true,
              star_id: match.id
            };
          } else {
            return {
              ...msg,
              starred: false,
              star_id: null
            };
          }
        });

        setMessages(updatedMessages);
        sessionStorage.setItem(
          "chatMessages",
          JSON.stringify(updatedMessages)
        );

      } catch (err) {
        console.error("Sync failed:", err);
      }
    };

    // ✅ cross-tab
    const storageHandler = (e) => {
      if (e.key === "starred_updated") {
        syncHandler();
      }
    };

    // ✅ same-tab (THIS WAS MISSING)
    const manualHandler = () => {
      syncHandler();
    };

    window.addEventListener("storage", storageHandler);
    window.addEventListener("starred_updated_manual", manualHandler);

    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener("starred_updated_manual", manualHandler);
    };

  }, []);

  /* FETCH DOCUMENTS */

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await API.get("/list-pdfs");
      setDocuments(res.data.pdfs);
    } catch (err) {
      console.error(err);
    }
  };

  /* CLOSE DROPDOWN ON OUTSIDE CLICK */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  useEffect(() => {

  const syncOnNavigation = async () => {
    try {
      const res = await API.get("/starred-questions");
      const starredList = res.data;

      const saved = sessionStorage.getItem("chatMessages");
      if (!saved) return;

      const currentMessages = JSON.parse(saved);

      const updatedMessages = currentMessages.map(msg => {

        if (msg.role !== "ai") return msg;

        const match = starredList.find(
          item =>
            item.question.trim().toLowerCase() ===
            msg.question?.trim().toLowerCase()
        );

        return match
          ? { ...msg, starred: true, star_id: match.id }
          : { ...msg, starred: false, star_id: null };
      });

      setMessages(updatedMessages);
      sessionStorage.setItem(
        "chatMessages",
        JSON.stringify(updatedMessages)
      );

    } catch (err) {
      console.error("Navigation sync failed:", err);
    }
  };

  syncOnNavigation();

}, [location.pathname]);

  /* ASK QUESTION */

  const askQuestion = async () => {

    if (!question.trim()) return;

    const userText = question;

    setQuestion("");

    const userMessage = {
      role: "user",
      text: userText
    };

    setMessages(prev => [...prev, userMessage]);

    setLoading(true);

    try {

      const res = await API.post("/ask-question", {
        question: userText,
        pdf_name: selectedDoc === "all" ? null : selectedDoc
      });

      const aiMessage = {
        role: "ai",
        text: res.data.answer,
        question: res.data.question,
        sources: res.data.sources || [],
        starred: false,
        star_id: null
      };

      setMessages(prev => {
        const updated = [...prev, aiMessage];

        // ✅ immediately store correct data with sources
        sessionStorage.setItem(
          "chatMessages",
          JSON.stringify(updated)
        );

        return updated;
      });

    } catch (err) {

      console.error(err);

    }

    setLoading(false);

  };

  /* STAR / UNSTAR */

  const toggleStar = async (index) => {

    const msg = messages[index];

    try {

      if (!msg.starred) {

        const res = await API.post("/star-question", {
          question: msg.question,
          answer: msg.text,
          sources: msg.sources || []
        });

        msg.starred = true;
        msg.star_id = res.data.star_id;

      } else {

        await API.delete(`/starred-question/${msg.star_id}`);

        msg.starred = false;
        msg.star_id = null;

      }

      // ✅ IMPORTANT: update state PROPERLY (deep copy)
      const updatedMessages = [...messages];
      updatedMessages[index] = { ...msg };

      setMessages(updatedMessages);

      // ✅ ALSO UPDATE SESSION STORAGE (CRITICAL FIX)
      sessionStorage.setItem(
        "chatMessages",
        JSON.stringify(updatedMessages)
      );

      // ✅ trigger sync
      localStorage.setItem("starred_updated", Date.now());
      window.dispatchEvent(new Event("starred_updated_manual"));

    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div className="flex h-screen bg-[#050816] text-white">

      {/* SIDEBAR */}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN */}

      <div className="flex flex-col flex-1">

        {/* HEADER */}

        <div className="flex justify-between items-center p-6 border-b border-white/10">

          <div className="flex items-center gap-4">

            <Menu
              className="cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />

            <div>

              <h1 className="text-2xl font-bold">
                Ask AI
              </h1>

              <p className="text-gray-400 text-sm">
                Ask questions about your uploaded documents
              </p>

            </div>

          </div>

          {/* CUSTOM DROPDOWN */}

          <div
            ref={dropdownRef}
            className="relative"
          >

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 bg-[#0f1431] px-4 py-2 rounded-xl border border-white/10 hover:border-purple-500 transition text-sm min-w-[200px]"
            >

              {selectedDoc === "all"
                ? "All Documents"
                : selectedDoc}

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />

            </button>

            {dropdownOpen && (

              <div className="absolute right-0 mt-2 w-full bg-[#0f1431] border border-white/10 rounded-xl shadow-lg overflow-hidden animate-[fadeIn_.15s_ease] z-50">

                <div
                  onClick={()=>{
                    setSelectedDoc("all");
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-purple-600/20 cursor-pointer transition"
                >
                  All Documents
                </div>

                {documents.map((doc,i)=>(

                  <div
                    key={i}
                    onClick={()=>{
                      setSelectedDoc(doc.name);
                      setDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-purple-600/20 cursor-pointer transition"
                  >
                    {doc.name}
                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* CHAT AREA */}

        <div className="flex-1 overflow-y-auto p-8 space-y-8 chat-scroll">

          {messages.map((msg,index)=>{

            if(msg.role==="user"){

              return(

            <div key={index} className="flex justify-end items-start gap-3 animate-[fadeIn_.3s_ease]">

              <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 rounded-2xl max-w-xl shadow-md">
                {msg.text}
              </div>

              <div className="w-8 h-8 flex items-center justify-center bg-purple-600/20 rounded-lg mt-1">
                <User size={18} className="text-purple-300"/>
              </div>

            </div>

              );

            }

            return(

              <div key={index} className="flex items-start gap-3 animate-[fadeIn_.3s_ease]">

                <div className="w-8 h-8 flex items-center justify-center bg-purple-600/20 rounded-lg mt-1">
                  <Bot size={18} className="text-purple-400"/>
                </div>

                <div className="relative max-w-2xl">

                  <button
                    onClick={()=>toggleStar(index)}
                    className="absolute -top-2 -right-2 bg-[#050816] p-1 rounded-full border border-white/10 hover:bg-purple-600 transition"
                  >
                    {msg.starred ? (
                      <Star size={16} fill="yellow" color="yellow"/>
                    ) : (
                      <Star size={16}/>
                    )}
                  </button>

                  <div className="bg-[#0f1431] p-5 rounded-2xl border border-white/10 shadow-md hover:border-purple-500/30 transition">

                    <p className="leading-relaxed">
                      {msg.text}
                    </p>

                    {msg.sources && msg.sources.length > 0 && (

                      <div className="mt-5">

                        {/* Divider */}
                        <div className="border-t border-white/10 mb-4"></div>

                        {/* Header */}
                        <div className="flex items-center gap-2 text-sm text-gray-300 font-semibold">
                          <FileText size={16} className="text-purple-400"/>
                          Sources
                        </div>

                        {/* Source Pills */}
                        <div className="flex flex-wrap gap-3 mt-3">

                          {msg.sources.map((s, i) => (

                            <div
                              key={i}
                              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#050816] border border-white/10 rounded-full hover:border-purple-500/40 hover:bg-[#0b0f2a] transition-all"
                            >
                              <FileText size={14} className="text-purple-400"/>

                              <span className="text-gray-200">
                                {s.pdf}
                              </span>

                              {s.pages && (
                                <span className="text-gray-400 text-xs">
                                  • Pages {s.pages.join(", ")}
                                </span>
                              )}
                            </div>

                          ))}

                        </div>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            );

          })}

          {loading && (

            <div className="flex gap-3">

              <Bot className="text-purple-400 mt-1"/>

              <div className="bg-[#0f1431] p-4 rounded-xl border border-white/10 flex gap-2 items-center">

                <span>Thinking</span>

                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>

              </div>

            </div>

          )}

          <div ref={chatEndRef}></div>

        </div>

        {/* INPUT AREA */}

        <div className="border-t border-white/10 p-5 flex justify-center">

          <div className="flex items-center gap-3 w-full max-w-3xl bg-[#0f1431] px-3 py-2 rounded-xl border border-white/10">

            <input
              value={question}
              onChange={(e)=>setQuestion(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==="Enter") askQuestion(); }}
              placeholder="Ask a question about your documents..."
              className="flex-1 bg-[#0f1431] px-4 py-3 rounded-lg outline-none border border-white/10 focus:border-purple-500"
            />

            <button
              onClick={askQuestion}
              className="bg-purple-600 p-3 rounded-full hover:bg-purple-700 transition shadow-lg hover:scale-105"
            >
              <Send size={18}/>
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default ChatPage;
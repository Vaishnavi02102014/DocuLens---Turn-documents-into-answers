import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import { Star, Menu, Search, FileText } from "lucide-react";

function Starred() {

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [insights, setInsights] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await API.get("/starred-questions");
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ SYNC LISTENER (ONLY ADDITION)
  useEffect(() => {

    const syncHandler = () => {
      fetchInsights();
    };

    const storageHandler = (e) => {
      if (e.key === "starred_updated") {
        syncHandler();
      }
    };

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

  const unstar = async (id) => {
    try {
      await API.delete(`/starred-question/${id}`);
      setInsights(prev => prev.filter(item => item.id !== id));

      // existing (cross-tab)
      localStorage.setItem("starred_updated", Date.now());

      // ✅ NEW (same-tab)
      window.dispatchEvent(new Event("starred_updated_manual"));

    } catch (err) {
      console.error(err);
    }
  };

  const filtered = insights.filter((item) =>
    item.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#070b1a] text-white">

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 px-8 py-6">

        <div className="flex justify-between items-center mb-10 max-w-5xl mx-auto w-full">

          <div className="flex items-center gap-4">
            <Menu onClick={() => setSidebarOpen(!sidebarOpen)} />

            <div>
              <h1 className="text-3xl font-semibold">
                Saved Insights
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Access your starred questions from all documents
              </p>
            </div>
          </div>

          <div className="flex items-center bg-[#121733] px-4 py-2 rounded-xl border border-white/10 w-72">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              placeholder="Search saved questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

        </div>

        <div className="max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">

          {filtered.map((item) => {

            const date = new Date(item.created_at).toLocaleDateString();

            const pdfNames = item.sources
              ? [...new Set(item.sources.map(s => s.pdf))]
              : [];

            return (

              <div key={item.id} className="bg-[#111735] p-6 rounded-2xl border border-white/10 relative">

                <button onClick={() => unstar(item.id)} className="absolute top-5 right-5">
                  <Star size={18} fill="#facc15" color="#facc15" />
                </button>

                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">

                  <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-md text-xs">
                    PDF
                  </span>

                  <span className="truncate max-w-[300px]">
                    {pdfNames.length > 0 ? pdfNames.join(", ") : "No sources"}
                  </span>

                  <span className="text-gray-500">
                    • Updated on {date}
                  </span>

                </div>

                <h2 className="text-lg font-semibold mb-4">
                  {item.question}
                </h2>

                <div className="bg-[#0c1026] border border-white/10 p-4 rounded-xl text-sm text-gray-300 mb-5">
                  {item.answer}
                </div>

                {/* ✅ SOURCES (RESTORED — THIS WAS MISSING) */}
                {item.sources && item.sources.length > 0 && (

                  <div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 uppercase tracking-wide">
                      <FileText size={14} />
                      Sources
                    </div>

                    <div className="flex flex-wrap gap-2">

                      {item.sources.map((s, i) => (

                        <div
                          key={i}
                          className="flex items-center gap-2 bg-[#0c1026] border border-white/10 px-3 py-1.5 rounded-full text-xs"
                        >
                          <FileText size={12} />

                          <span>{s.pdf}</span>

                          <span className="text-gray-400">
                            • Pages {s.pages?.join(", ")}
                          </span>

                        </div>

                      ))}

                    </div>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      </div>
    </div>
  );
}

export default Starred;



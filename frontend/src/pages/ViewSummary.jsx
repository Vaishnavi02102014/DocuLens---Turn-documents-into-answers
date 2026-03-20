import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, FileText, Menu } from "lucide-react";

export default function ViewSummary() {

  const { filename } = useParams();

  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/generate-summary/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!data.summary) return;

      const parsed = parseSummary(data.summary);

      setTopics(parsed);

    } catch (error) {

      console.error("Summary fetch failed:", error);

    }

  };

  /* -------- SUMMARY PARSER -------- */

  const parseSummary = (text) => {

    const sections = text.split("\n\n");

    const parsed = [];

    sections.forEach(section => {

      const lines = section.split("\n").filter(Boolean);

      if (lines.length < 2) return;

      let title = lines[0].replace("•", "").trim();

      const points = lines
        .slice(1)
        .map(line => line.replace("•", "").trim());

      parsed.push({ title, points });

    });

    return parsed;

  };

  /* -------- LOADING SCREEN -------- */

  if (!topics.length) {

    return (
      <div className="flex min-h-screen bg-[#050816] text-white items-center justify-center">
        Generating summary...
      </div>
    );

  }

  return (

    <div className="flex min-h-screen bg-[#050816] text-white">

      {/* SIDEBAR */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN CONTENT */}

      <div className="flex-1 p-8 overflow-x-hidden">

        {/* TOP BAR */}

        <div className="flex items-center gap-4 mb-8">

          <Menu
            size={24}
            className="cursor-pointer text-gray-300 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />

          <span className="text-gray-400 text-sm">
            Workspace / Summary
          </span>

        </div>

        {/* PAGE TITLE */}

        <h1 className="text-3xl font-bold mb-6">
          Document Summary
        </h1>

        {/* PDF CARD */}

        <div className="bg-[#0f1431] border border-white/10 p-6 rounded-xl mb-8 flex items-center gap-4">

          <div className="bg-purple-600 p-3 rounded-lg">
            <FileText size={20}/>
          </div>

          <div>

            {/* CLICKABLE PDF */}

            <h2
              className="text-lg font-medium cursor-pointer hover:text-purple-400 transition"
              onClick={() => {

                const userId = localStorage.getItem("user_id") || 1;

                const pdfUrl =
                  `${import.meta.env.VITE_API_URL}/uploads/user_${userId}/${filename}`;

                window.open(pdfUrl, "_blank");

              }}
            >
              {decodeURIComponent(filename)}
            </h2>

            <p className="text-gray-400 text-sm">
              AI Generated Study Summary
            </p>

          </div>

        </div>

        {/* TOPIC TABS */}

        <div className="flex gap-8 border-b border-white/10 pb-3 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">

          {topics.map((topic, index) => (

            <button
              key={index}
              onClick={() => setActiveTopic(index)}
              className={`pb-2 whitespace-nowrap transition ${
                activeTopic === index
                  ? "border-b-2 border-purple-500 text-purple-300 font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >

              {topic.title
                .toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase())
              }

            </button>

          ))}

        </div>

        {/* SUMMARY CONTENT */}

        <div className="mt-8 bg-[#0f1431] p-10 rounded-xl border border-white/10 shadow-lg shadow-black/30">

          <h2 className="text-lg font-semibold mb-6">

            {topics[activeTopic].title
              .toLowerCase()
              .replace(/\b\w/g, c => c.toUpperCase())
            }

          </h2>

          <ul className="space-y-4">

            {topics[activeTopic].points.map((point, i) => (

              <li
                key={i}
                className="flex gap-3 text-gray-300 leading-relaxed"
              >

                <CheckCircle
                  size={18}
                  className="text-purple-400 mt-1"
                />

                {point}

              </li>

            ))}

          </ul>

        </div>

      </div>

    </div>

  );

}
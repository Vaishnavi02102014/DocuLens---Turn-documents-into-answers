import { uploadPDF, getDocuments, deleteDocument } from "../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  Menu,
  Upload,
  FileText,
  Trash2
} from "lucide-react";

function Home() {

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ✅ NEW: reactive username
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "User"
  );

  const navigate = useNavigate();

  const initial = username.charAt(0).toUpperCase();

  /* ---------------- LOAD DOCUMENTS ---------------- */

  const loadDocs = async () => {
    try {
      const res = await getDocuments();
      const pdfs = res.data.pdfs || [];
      setDocuments(pdfs);
    } catch (err) {
      console.error("Error loading documents:", err);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  /* ---------------- ✅ PROFILE SYNC ---------------- */

  useEffect(() => {

    const handler = () => {
      setUsername(localStorage.getItem("username") || "User");
    };

    // cross-tab sync
    const storageHandler = (e) => {
      if (e.key === "username") handler();
    };

    window.addEventListener("profile_updated", handler);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("profile_updated", handler);
      window.removeEventListener("storage", storageHandler);
    };

  }, []);

  /* ---------------- UPLOAD ---------------- */

  const handleUpload = async (file) => {

    if (!file) return;

    try {

      setUploading(true);

      await uploadPDF(file);

      setTimeout(() => {
        loadDocs();
      }, 800);

    } catch (err) {

      console.error("Upload failed:", err);

    } finally {

      setUploading(false);

    }

  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (filename) => {

    try {

      await deleteDocument(filename);
      loadDocs();

    } catch (err) {

      console.error("Delete failed:", err);

    }

  };

  /* ---------------- CLEAR SESSION ON TAB CLOSE ---------------- */

  useEffect(() => {

    const handleUnload = () => {

      const token = localStorage.getItem("token");
      if (!token) return;

      const data = JSON.stringify({ token });
      const blob = new Blob([data], { type: "application/json" });

      navigator.sendBeacon(
        "http://localhost:8000/clear-session",
        blob
      );
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };

  }, []);

  /* ---------------- LOGOUT ---------------- */

  const logout = async () => {

    const confirmLogout = window.confirm("Are you sure you want to sign out?");

    if (!confirmLogout) return;

    const token = localStorage.getItem("token");

    try {

      if (token) {
        await fetch("http://localhost:8000/clear-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
      }

    } catch (err) {
      console.error("Session cleanup failed:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    navigate("/");
  };

  return (

    <div className="flex min-h-screen bg-[#050816] text-white">

      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex-1 p-8">

        {/* TOP BAR */}

        <div className="flex justify-between items-center mb-8">

          <div className="flex items-center gap-4">

            <Menu
              className="cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />

            <span className="text-gray-400 text-sm">
              Workspace / Documents
            </span>

          </div>

          {/* ✅ CLICKABLE AVATAR */}
          <div
            onClick={() => navigate("/account")}
            title="Go to Account"
            className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold cursor-pointer hover:scale-105 hover:bg-purple-600 transition"
          >
            {initial}
          </div>

        </div>

        {/* GREETING */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold mb-2">
           Hi {username.charAt(0).toUpperCase() + username.slice(1)} 👋
          </h1>

          <p className="text-gray-400">
            Ready to turn your documents into answers?
          </p>

        </div>

        {/* UPLOAD */}

        <input
          type="file"
          accept="application/pdf"
          hidden
          id="pdfUpload"
          disabled={uploading}
          onChange={(e) => handleUpload(e.target.files[0])}
        />

        <label
          htmlFor="pdfUpload"
          className="border-2 border-dashed border-purple-500/40 rounded-xl p-12 flex flex-col items-center justify-center mb-4 hover:border-purple-400 transition cursor-pointer"
        >

          <Upload size={40} className="mb-4 text-purple-400"/>

          <p className="text-lg">
            Click to upload or drag and drop
          </p>

          <p className="text-gray-400 text-sm mt-1">
            PDF files up to 50MB each
          </p>

        </label>

        {uploading && (
          <p className="text-purple-400 mb-6 animate-pulse">
            Processing PDF... please wait
          </p>
        )}

        {/* DOCUMENT LIST */}

        {documents.length > 0 && (

          <div>

            <h2 className="text-xl font-semibold mb-5">
              Recent Documents
            </h2>

            <div className="grid grid-cols-3 gap-6">

              {documents.map((doc, index) => (

                <div
                  key={index}
                  className="group bg-[#0f1431] p-5 rounded-xl border border-white/10 hover:border-purple-500 transition"
                >

                  <div className="flex gap-4 items-start">

                    <div className="w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded-lg">
                      <FileText className="text-purple-400"/>
                    </div>

                    <div className="flex-1">

                      <h3 className="font-medium">{doc.name}</h3>

                      <p className="text-gray-400 text-sm">{doc.size}</p>

                      <p className="text-gray-500 text-xs mb-3">
                        Uploaded {doc.date_uploaded}
                      </p>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">

                        <button
                          onClick={() => navigate(`/summary/${encodeURIComponent(doc.name)}`)}
                          className="text-sm bg-purple-500 px-3 py-1 rounded hover:bg-purple-600"
                        >
                          View Summary
                        </button>

                        <button
                          onClick={() => handleDelete(doc.name)}
                          className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                        >
                          <Trash2 size={14}/> Delete
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

export default Home;



// import { uploadPDF, getDocuments, deleteDocument } from "../services/api";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";

// import {
//   Menu,
//   Upload,
//   FileText,
//   Trash2,
//   LayoutDashboard,
//   MessageSquare,
//   Bookmark,
//   User,
//   LogOut,
//   File
// } from "lucide-react";

// function Home() {

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [documents, setDocuments] = useState([]);
//   const [uploading, setUploading] = useState(false);

//   const navigate = useNavigate();

//   const username = localStorage.getItem("username") || "User";
//   const initial = username.charAt(0).toUpperCase();

//   /* ---------------- LOAD DOCUMENTS ---------------- */

//   const loadDocs = async () => {
//     try {
//       const res = await getDocuments();
//       const pdfs = res.data.pdfs || [];
//       setDocuments(pdfs);
//     } catch (err) {
//       console.error("Error loading documents:", err);
//     }
//   };

//   useEffect(() => {
//     loadDocs();
//   }, []);

//   /* ---------------- UPLOAD ---------------- */

//   const handleUpload = async (file) => {

//     if (!file) return;

//     try {

//       setUploading(true);

//       await uploadPDF(file);

//       // small delay so backend finishes processing
//       setTimeout(() => {
//         loadDocs();
//       }, 800);

//     } catch (err) {

//       console.error("Upload failed:", err);

//     } finally {

//       setUploading(false);

//     }

//   };

//   /* ---------------- DELETE ---------------- */

//   const handleDelete = async (filename) => {

//     try {

//       await deleteDocument(filename);

//       loadDocs();

//     } catch (err) {

//       console.error("Delete failed:", err);

//     }

//   };

//   useEffect(() => {

//     const handleUnload = () => {

//       const token = localStorage.getItem("token");
//       if (!token) return;

//       const data = JSON.stringify({ token });

//       const blob = new Blob([data], { type: "application/json" });

//       navigator.sendBeacon(
//         "http://localhost:8000/clear-session",
//         blob
//       );
//     };

//     window.addEventListener("beforeunload", handleUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleUnload);
//     };

//   }, []);

//   /* ---------------- LOGOUT ---------------- */

//   const logout = async () => {

//     const token = localStorage.getItem("token");

//     try {

//       if (token) {

//         await fetch("http://localhost:8000/clear-session", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify({ token })
//         });

//       }

//     } catch (err) {

//       console.error("Session cleanup failed:", err);

//     }

//     localStorage.removeItem("token");
//     localStorage.removeItem("username");

//     navigate("/");

//   };

//   return (

//     <div className="flex min-h-screen bg-[#050816] text-white">

//       <Sidebar sidebarOpen={sidebarOpen} />

//       <div className="flex-1 p-8">

//         {/* TOP BAR */}

//         <div className="flex justify-between items-center mb-8">

//           <div className="flex items-center gap-4">

//             <Menu
//               className="cursor-pointer"
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//             />

//             <span className="text-gray-400 text-sm">
//               Workspace / Documents
//             </span>

//           </div>

//           <div
//             onClick={() => navigate("/account")}
//             className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold cursor-pointer hover:scale-105 hover:bg-purple-600 transition"
//           >
//             {initial}
//           </div>

//         </div>

//         {/* GREETING */}

//         <div className="mb-8">

//           <h1 className="text-3xl font-bold mb-2">
//             Hi {username} 👋
//           </h1>

//           <p className="text-gray-400">
//             Ready to turn your documents into answers?
//           </p>

//         </div>

//         {/* UPLOAD */}

//         <input
//           type="file"
//           accept="application/pdf"
//           hidden
//           id="pdfUpload"
//           disabled={uploading}
//           onChange={(e) => handleUpload(e.target.files[0])}
//         />

//         <label
//           htmlFor="pdfUpload"
//           className="border-2 border-dashed border-purple-500/40 rounded-xl p-12 flex flex-col items-center justify-center mb-4 hover:border-purple-400 transition cursor-pointer"
//         >

//           <Upload size={40} className="mb-4 text-purple-400"/>

//           <p className="text-lg">
//             Click to upload or drag and drop
//           </p>

//           <p className="text-gray-400 text-sm mt-1">
//             PDF files up to 50MB each
//           </p>

//         </label>

//         {uploading && (
//           <p className="text-purple-400 mb-6 animate-pulse">
//             Processing PDF... please wait
//           </p>
//         )}

//         {/* DOCUMENT LIST */}

//         {documents.length > 0 && (

//           <div>

//             <h2 className="text-xl font-semibold mb-5">
//               Recent Documents
//             </h2>

//             <div className="grid grid-cols-3 gap-6">

//               {documents.map((doc, index) => (

//                 <div
//                   key={index}
//                   className="group bg-[#0f1431] p-5 rounded-xl border border-white/10 hover:border-purple-500 transition"
//                 >

//                   <div className="flex gap-4 items-start">

//                     <div className="w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded-lg">
//                       <FileText className="text-purple-400"/>
//                     </div>

//                     <div className="flex-1">

//                       <h3 className="font-medium">{doc.name}</h3>

//                       <p className="text-gray-400 text-sm">{doc.size}</p>

//                       <p className="text-gray-500 text-xs mb-3">
//                         Uploaded {doc.date_uploaded}
//                       </p>

//                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">

//                         <button
//                           onClick={() => navigate(`/summary/${encodeURIComponent(doc.name)}`)}
//                           className="text-sm bg-purple-500 px-3 py-1 rounded hover:bg-purple-600"
//                         >
//                           View Summary
//                         </button>

//                         <button
//                           onClick={() => handleDelete(doc.name)}
//                           className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
//                         >
//                           <Trash2 size={14}/> Delete
//                         </button>

//                       </div>

//                     </div>

//                   </div>

//                 </div>

//               ))}

//             </div>

//           </div>

//         )}

//       </div>

//     </div>

//   );

// }

// export default Home;
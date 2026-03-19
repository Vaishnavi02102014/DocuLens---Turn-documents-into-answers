import { LayoutDashboard, MessageSquare, Bookmark, User, LogOut, File } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Sidebar({ sidebarOpen }) {

  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logout = async () => {

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

    // clear temporary chat
    sessionStorage.removeItem("chatMessages");

    // remove login data
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    navigate("/");
  };

  return (

    <>
      <div
        className={`bg-[#0f1431] border-r border-white/10 transition-all duration-500 ease-in-out flex flex-col justify-between h-screen ${
          sidebarOpen
            ? "w-64 min-w-[16rem] p-5"
            : "w-0 min-w-0 p-0 overflow-hidden"
        }`}
      >

        <div>

          {/* LOGO */}

          <div className="flex items-center gap-2 text-xl font-bold mb-8">

            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <File size={16}/>
            </div>

            DocuLens

          </div>

          {/* NAVIGATION */}

          <nav className="space-y-2 text-sm">

            {/* WORKSPACE */}

            <div
              onClick={() => navigate("/home")}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                ${
                  location.pathname === "/home"
                    ? "bg-black/30 border border-white/10"
                    : "hover:bg-white/5"
                }`}
            >
              <LayoutDashboard size={18}/>
              Workspace
            </div>

            {/* ASK AI */}

            <div
              onClick={() => navigate("/chat")}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                ${
                  location.pathname === "/chat"
                    ? "bg-black/30 border border-white/10"
                    : "hover:bg-white/5"
                }`}
            >
              <MessageSquare size={18}/>
              Ask AI
            </div>

            {/* SAVED INSIGHTS */}

            <div
              onClick={() => navigate("/starred")}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                ${
                  location.pathname === "/starred"
                    ? "bg-black/30 border border-white/10"
                    : "hover:bg-white/5"
                }`}
            >
              <Bookmark size={18}/>
              Saved Insights
            </div>

          </nav>

        </div>

        {/* BOTTOM SECTION */}

        <div>

          <div className="border-t border-white/10 my-4"></div>

          <div className="space-y-2 text-sm">

            {/* ACCOUNT  */}

            <div
              onClick={() => navigate("/account")}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                ${
                  location.pathname === "/account"
                    ? "bg-black/30 border border-white/10"
                    : "hover:bg-white/5"
                }`}
            >
              <User size={18}/>
              Account
            </div>

            {/* SIGN OUT */}

            <div
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/20 cursor-pointer text-red-400"
            >
              <LogOut size={18}/>
              Sign Out
            </div>

          </div>

        </div>

      </div>

      {/* 🔥 LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-gradient-to-br from-[#111735] to-[#0b0f2a] p-6 rounded-2xl border border-white/10 w-[320px] shadow-2xl">

            <p className="text-center text-lg font-medium text-white mb-6">
              Are you sure you want to Sign Out?
            </p>

            <div className="flex justify-center gap-4">

              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
              >
                Cancel
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition text-sm shadow-md"
              >
                Sign Out
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );

}

export default Sidebar;


// import { LayoutDashboard, MessageSquare, Bookmark, User, LogOut, File } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";

// function Sidebar({ sidebarOpen }) {

//   const navigate = useNavigate();
//   const location = useLocation();

//   const logout = async () => {

//     const token = localStorage.getItem("token");

//     try {

//       if (token) {
//         await fetch("http://localhost:8000/clear-session", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ token })
//         });
//       }

//     } catch (err) {
//       console.error("Session cleanup failed:", err);
//     }

//     // clear temporary chat
//     sessionStorage.removeItem("chatMessages");

//     // remove login data
//     localStorage.removeItem("token");
//     localStorage.removeItem("username");

//     navigate("/");
//   };

//   return (

//     <div
//       className={`bg-[#0f1431] border-r border-white/10 transition-all duration-300 flex flex-col justify-between h-screen ${
//         sidebarOpen ? "w-64 min-w-[16rem] p-5" : "w-0 overflow-hidden"
//       }`}
//     >

//       <div>

//         {/* LOGO */}

//         <div className="flex items-center gap-2 text-xl font-bold mb-8">

//           <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
//             <File size={16}/>
//           </div>

//           DocuLens

//         </div>

//         {/* NAVIGATION */}

//         <nav className="space-y-2 text-sm">

//           {/* WORKSPACE */}

//           <div
//             onClick={() => navigate("/home")}
//             className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
//               ${
//                 location.pathname === "/home"
//                   ? "bg-black/30 border border-white/10"
//                   : "hover:bg-white/5"
//               }`}
//           >
//             <LayoutDashboard size={18}/>
//             Workspace
//           </div>

//           {/* ASK AI */}

//           <div
//             onClick={() => navigate("/chat")}
//             className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
//               ${
//                 location.pathname === "/chat"
//                   ? "bg-black/30 border border-white/10"
//                   : "hover:bg-white/5"
//               }`}
//           >
//             <MessageSquare size={18}/>
//             Ask AI
//           </div>

//           {/* SAVED INSIGHTS */}

//           <div
//             onClick={() => navigate("/starred")}
//             className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
//               ${
//                 location.pathname === "/starred"
//                   ? "bg-black/30 border border-white/10"
//                   : "hover:bg-white/5"
//               }`}
//           >
//             <Bookmark size={18}/>
//             Saved Insights
//           </div>

//         </nav>

//       </div>

//       {/* BOTTOM SECTION */}

//       <div>

//         <div className="border-t border-white/10 my-4"></div>

//         <div className="space-y-2 text-sm">

//           {/* ACCOUNT  */}

//           <div
//             onClick={() => navigate("/account")}
//             className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
//               ${
//                 location.pathname === "/account"
//                   ? "bg-black/30 border border-white/10"
//                   : "hover:bg-white/5"
//               }`}
//           >
//             <User size={18}/>
//             Account
//           </div>

//           {/* SIGN OUT */}

//           <div
//             onClick={logout}
//             className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/20 cursor-pointer text-red-400"
//           >
//             <LogOut size={18}/>
//             Sign Out
//           </div>

//         </div>

//       </div>

//     </div>

//   );

// }

// export default Sidebar;
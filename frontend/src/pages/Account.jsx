import Sidebar from "../components/Sidebar";
import API from "../services/api";
import { useState, useEffect } from "react";

import {
  Menu,
  User,
  Mail,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

function Account() {

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: ""
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/me");

      setProfile({
        name: res.data.name,
        email: res.data.email
      });

    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {

    if (!name.trim() || !email.trim()) {
      setMessage({ type: "error", text: "Name and email are required" });
      return;
    }

    try {

      const res = await API.put("/auth/update-profile", { name, email });

      // ✅ update UI
      setProfile({
        name: res.data.user.name,
        email: res.data.user.email
      });

      // ✅ IMPORTANT: update localStorage (for Home.jsx)
      localStorage.setItem("username", res.data.user.name);

      // ✅ IMPORTANT: notify other pages
      window.dispatchEvent(new Event("profile_updated"));

      // reset inputs
      setName("");
      setEmail("");

      setMessage({ type: "success", text: "Profile updated successfully" });

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Update failed"
      });
    }
  };

  const changePassword = async () => {
    try {

      await API.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      setMessage({ type: "success", text: "Password updated successfully" });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Password update failed"
      });
    }
  };

  return (

    <div className="flex h-screen bg-[#050816] text-white">

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1">

        {/* HEADER */}
        <div className="flex items-center gap-4 p-6 border-b border-white/10">

          <Menu
            className="cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />

          <div>
            <h1 className="text-3xl font-bold">Account</h1>
            <p className="text-gray-400 text-sm">
              Manage your profile and security settings
            </p>
          </div>

        </div>

        {/* TOAST */}
        {message && (
          <div className="fixed top-6 right-6 z-50">
            <div className={`px-5 py-3 rounded-xl text-sm border shadow-lg ${
              message.type === "success"
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30"
            }`}>
              {message.text}
            </div>
          </div>
        )}

        <div className="flex justify-center overflow-y-auto">

          <div className="w-full max-w-4xl p-8 space-y-6">

            {/* TOP CARD */}
            <div className="bg-gradient-to-r from-[#111736] to-[#1b2150] px-8 py-7 rounded-3xl flex justify-between items-center border border-white/10 shadow-lg">

              <div className="flex items-center gap-6">

                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {profile.name?.charAt(0) || "U"}
                </div>

                <div className="space-y-2">

                  <div className="flex items-center gap-3 text-xl font-semibold">
                    <User size={20} className="text-purple-400"/>
                    {profile.name || "User"}
                  </div>

                  <div className="flex items-center gap-3 text-gray-300 text-base">
                    <Mail size={18}/>
                    {profile.email || "email@example.com"}
                  </div>

                </div>

              </div>

              <div className="text-sm bg-purple-600/20 text-purple-300 px-4 py-1.5 rounded-full border border-purple-500/30">
                PRO USER
              </div>

            </div>

            {/* PERSONAL INFO */}
            <div className="bg-[#0f1431] p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition">

              <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
                <User className="text-purple-400"/>
                Personal Information
              </div>

              <div className="grid grid-cols-2 gap-5">

                <div>
                  <label className="text-sm text-gray-300">Full Name</label>
                  <input
                    placeholder="John Doe"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-[#050816] rounded-xl border border-white/10 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Email Address</label>
                  <input
                    placeholder="john@email.com"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-[#050816] rounded-xl border border-white/10 focus:border-purple-500 outline-none"
                  />
                </div>

              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={updateProfile}
                  className="px-6 py-2 bg-purple-600 rounded-xl hover:bg-purple-700 transition"
                >
                  Save Changes
                </button>
              </div>

            </div>

            {/* SECURITY */}
            <div className="bg-[#0f1431] p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition">

              <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
                <Shield className="text-purple-400"/>
                Security & Password
              </div>

              <div className="space-y-5">

                <div className="relative">
                  <label className="text-sm text-gray-300">Current Password</label>
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e)=>setCurrentPassword(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-[#050816] rounded-xl border border-white/10 focus:border-purple-500 outline-none"
                  />
                  <div
                    className="absolute right-3 top-11 cursor-pointer"
                    onClick={()=>setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">

                  <div className="relative">
                    <label className="text-sm text-gray-300">New Password</label>
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e)=>setNewPassword(e.target.value)}
                      className="mt-2 w-full px-4 py-3 bg-[#050816] rounded-xl border border-white/10 focus:border-purple-500 outline-none"
                    />
                    <div
                      className="absolute right-3 top-11 cursor-pointer"
                      onClick={()=>setShowNew(!showNew)}
                    >
                      {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-sm text-gray-300">Confirm Password</label>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e)=>setConfirmPassword(e.target.value)}
                      className="mt-2 w-full px-4 py-3 bg-[#050816] rounded-xl border border-white/10 focus:border-purple-500 outline-none"
                    />
                    <div
                      className="absolute right-3 top-11 cursor-pointer"
                      onClick={()=>setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </div>
                  </div>

                </div>

              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={changePassword}
                  className="px-6 py-2 bg-purple-600 rounded-xl hover:bg-purple-700 transition"
                >
                  Update Password
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Account;
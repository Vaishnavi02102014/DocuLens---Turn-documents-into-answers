import { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { signup, login } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ TOAST STATE
  const [toast, setToast] = useState(null);

  const handleSubmit = async () => {
    try {

      // SIGNUP FLOW
      if (isSignup) {

        if (password !== confirmPassword) {
          setToast({ type: "error", message: "Passwords do not match!" });
          return;
        }

        await signup({
          name: name,
          email: email,
          password: password,
          confirm_password: confirmPassword
        });

        // auto login after signup
        const res = await login({
          email: email,
          password: password
        });

        localStorage.setItem("token", res.data.token);

        const username = email.split("@")[0];
        localStorage.setItem("username", username);

        navigate("/home");
        return;
      }

      // LOGIN FLOW
      const res = await login({
        email: email,
        password: password
      });

      const token = res.data.token;

      if (!token) {
        setToast({ type: "error", message: "Login failed. Try again." });
        return;
      }

      localStorage.setItem("token", token);

      const username = email.split("@")[0];
      localStorage.setItem("username", username);

      navigate("/home");

    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Authentication failed!" });
    }
  };

  // ✅ AUTO HIDE TOAST
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050816] text-white">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className={`px-6 py-3 rounded-lg shadow-xl text-sm font-medium transition-all duration-300
          ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.message}
        </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-[#050816] via-[#0b1026] to-[#02030a]" />

      <div className="absolute w-[600px] h-[600px] bg-purple-600/30 blur-[160px] rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />

      <div className="relative w-[420px] bg-[#0f1431]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        <div className="text-center mb-7">

          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            DocuLens
          </h1>

          <p className="text-gray-400 mt-2 text-sm">
            Turn documents into answers!
          </p>

        </div>

        {/* Toggle */}
        <div className="relative flex bg-black/40 rounded-lg p-1 mb-7">

          <div
            className={`absolute top-1 bottom-1 w-[48%] bg-gray-700 rounded-md transition-all duration-300 ${
              isSignup ? "left-[50%]" : "left-1"
            }`}
          />

          <button
            onClick={() => setIsSignup(false)}
            className="relative w-1/2 py-2 text-sm z-10"
          >
            Sign In
          </button>

          <button
            onClick={() => setIsSignup(true)}
            className="relative w-1/2 py-2 text-sm z-10"
          >
            Sign Up
          </button>

        </div>

        <div className="space-y-5">

          {/* NAME */}
          {isSignup && (
            <div>

              <label className="block text-sm text-gray-400 mb-1">
                Full Name
              </label>

              <div className="relative">

                <User size={18} className="absolute left-3 top-3 text-gray-400" />

                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 p-3 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

            </div>
          )}

          {/* EMAIL */}
          <div>

            <label className="block text-sm text-gray-400 mb-1">
              Email
            </label>

            <div className="relative">

              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />

              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div>

            <label className="block text-sm text-gray-400 mb-1">
              Password
            </label>

            <div className="relative">

              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 p-3 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>

            </div>

          </div>

          {/* CONFIRM PASSWORD */}
          {isSignup && (
            <div>

              <label className="block text-sm text-gray-400 mb-1">
                Confirm Password
              </label>

              <div className="relative">

                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 p-3 rounded-lg bg-black/40 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>

              </div>

            </div>
          )}

        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          className="w-full mt-7 py-3 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
        >
          {isSignup ? "Create Account" : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">

          {isSignup ? "Already have an account?" : "New to DocuLens?"}

          <span
            onClick={() => setIsSignup(!isSignup)}
            className="ml-2 text-purple-400 cursor-pointer"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </span>

        </p>

      </div>

    </div>
  );
}

export default Login;
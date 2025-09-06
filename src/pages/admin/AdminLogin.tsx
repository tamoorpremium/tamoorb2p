// src/pages/AdminLogin.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { User } from "@supabase/supabase-js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState(""); // For reset password
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false); // Toggle for reset section

  // 🔄 Check existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user: User = session.user;
        const role = (user.user_metadata as any)?.role;

        if (role) {
          localStorage.setItem("userRole", role);
          localStorage.setItem("token", session.access_token);
          navigate("/admin/dashboard", { replace: true });
        } else {
          console.error("⛔ Access denied: not an admin user.");
        }
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user: User = data.session?.user!;
    const role = (user.user_metadata as any)?.role;

    if (role) {
      localStorage.setItem("userRole", role);
      localStorage.setItem("token", data.session!.access_token);
      navigate("/admin/dashboard", { replace: true });
    } else {
      alert("Access denied. You are not an admin user.");
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email for reset.");
      return;
    }
    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + "/admin-login",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent!");
      setResetEmail("");
      setShowReset(false); // hide reset form after sending
    }

    setResetLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Admin Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-200 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-200 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* 🔹 Forgot Password Link */}
        <div className="mt-6 text-center">
          <p
            className="text-blue-400 cursor-pointer hover:underline mb-2"
            onClick={() => setShowReset(!showReset)}
          >
            Forgot password?
          </p>

          {/* 🔹 Reset Password Section (shown only when clicked) */}
          {showReset && (
            <div className="mt-2">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                placeholder="Enter your email"
              />
              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLogin;

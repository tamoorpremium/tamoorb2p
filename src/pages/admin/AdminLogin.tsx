import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { User } from "@supabase/supabase-js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LogIn, Mail, Key, Send } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // --- All original logic is preserved ---
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // FIX: Replaced alert with toast
      toast.error(error.message);
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
      // FIX: Replaced alert with toast
      toast.error("Access denied. You are not an admin user.");
      // Also sign out the non-admin user
      await supabase.auth.signOut();
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
      redirectTo: window.location.origin + "/reset-password", // Using your existing public reset page
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent!");
      setResetEmail("");
      setShowReset(false);
    }
    setResetLoading(false);
  };

  // --- UI/JSX Section Redesigned for Consistency ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
        <ToastContainer position="top-center" theme="dark" />
        <div className="w-full max-w-sm p-8 rounded-2xl bg-black/20 backdrop-blur-xl shadow-2xl border border-yellow-400/20">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-wide text-yellow-400">TAMOOR</h1>
                <p className="text-gray-400">Admin Panel</p>
            </div>
            
            {!showReset ? (
                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900/70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Key className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900/70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-gray-900 font-bold rounded-xl shadow-lg transition disabled:opacity-50"
                    >
                        <LogIn size={18}/>
                        {loading ? "Authenticating..." : "Login"}
                    </button>
                </form>
            ) : (
                <div className="space-y-5">
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                        <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900/70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Enter your registered email"
                            required
                        />
                    </div>
                    <button
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50"
                    >
                        <Send size={16}/>
                        {resetLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                </div>
            )}
            
            <div className="mt-6 text-center">
                <button
                    className="text-sm text-yellow-300/80 hover:text-yellow-300 hover:underline"
                    onClick={() => setShowReset(!showReset)}
                >
                    {showReset ? "Back to Login" : "Forgot your password?"}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AdminLogin;

// utils/logout.ts
import { supabase } from "./supabaseClient";
import { toast } from "react-toastify";

export const logout = async (navigate?: (path: string) => void) => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");

    // Show success toast
    toast.success("Logged out successfully");

    // Redirect
    if (navigate) {
      navigate("/auth"); // for SPA navigation
    } else {
      window.location.href = "/"; // fallback for non-SPA
    }
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Error logging out");
  }
};

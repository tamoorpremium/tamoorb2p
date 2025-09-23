// src/pages/ProfileCompletion.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Save } from "lucide-react";
import { CountryCode, countryCodes, isValidEmail } from "../utils/validators";

interface UserInfo {
  full_name: string;
  email: string;
  phone: string;
  country?: CountryCode;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const ProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectAfter = (location.state as any)?.redirectAfter || "/profile";
  const initialEmail = (location.state as any)?.email || "";

  const [userInfo, setUserInfo] = useState<UserInfo>({
    full_name: "",
    email: initialEmail,
    phone: "",
    country: countryCodes.find(c => c.code === "+91"),
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !profile) return;

      setUserInfo({
        full_name: profile.full_name || "",
        email: profile.email || initialEmail,
        phone: profile.phone || "",
        country: countryCodes.find(c => c.code === profile.country_code) || countryCodes[0],
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg("User not found. Please login.");
      return;
    }

    // Trim all inputs
    const full_name = userInfo.full_name.trim();
    const email = userInfo.email.trim();
    const address = userInfo.address.trim();
    const city = userInfo.city.trim();
    const state = userInfo.state.trim();
    const pincode = userInfo.pincode.trim();
    const country = userInfo.country;
    // Keep only digits in phone
    const phone = (userInfo.phone || "").replace(/\D/g, "");

    // Validations
    if (!full_name) return setErrorMsg("Full Name is required.");
    if (!email || !isValidEmail(email)) return setErrorMsg("Valid Email is required.");
    if (!phone || !country) return setErrorMsg("Valid Phone number is required.");
    if (phone.length < country.minLength || phone.length > country.maxLength) {
      return setErrorMsg(`Phone number must be between ${country.minLength} and ${country.maxLength} digits for ${country.name}`);
    }

    if (!address || !city || !state || !pincode)
      return setErrorMsg("Complete address is required.");

    setIsSaving(true);
    const fullPhone = phone;

    // Upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name,
        email,
        phone: fullPhone,
        country_code: country.code,
      });

    if (profileError) {
      setErrorMsg("Failed to save profile: " + profileError.message);
      setIsSaving(false);
      return;
    }

    // Insert default address
    const { error: addressError } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        full_name,
        email,
        phone: fullPhone,
        address,
        city,
        state,
        pincode,
        is_default: true,
      });

    if (addressError) {
      setErrorMsg("Failed to save address: " + addressError.message);
      setIsSaving(false);
      return;
    }

    setSuccessMsg("Profile and default address saved successfully!");
    setTimeout(() => navigate(redirectAfter), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark">
      <div className="w-full max-w-3xl glass rounded-3xl p-8 luxury-card">
        <h2 className="text-3xl font-display font-bold text-neutral-800 mb-6">Complete Your Profile</h2>

        {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}
        {successMsg && <div className="text-green-600 mb-4">{successMsg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={userInfo.full_name}
              onChange={e => setUserInfo({ ...userInfo, full_name: e.target.value })}
              className="w-full p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={userInfo.email}
              onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
              className="w-full p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <div className="flex gap-2">
              <select
                value={userInfo.country?.code}
                onChange={e => setUserInfo({
                  ...userInfo,
                  country: countryCodes.find(c => c.code === e.target.value)
                })}
                className="p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50"
              >
                {countryCodes.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={userInfo.phone}
                onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                className="flex-1 p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50"
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={userInfo.address}
              onChange={e => setUserInfo({ ...userInfo, address: e.target.value })}
              className="w-full p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50 resize-none"
              rows={3}
              placeholder="Street, building, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={userInfo.city}
              onChange={e => setUserInfo({ ...userInfo, city: e.target.value })}
              className="w-full p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              value={userInfo.state}
              onChange={e => setUserInfo({ ...userInfo, state: e.target.value })}
              className="w-full p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">PIN Code</label>
            <input
              type="text"
              value={userInfo.pincode}
              onChange={e => setUserInfo({ ...userInfo, pincode: e.target.value })}
              className="w-full p-4 rounded-xl neomorphism-inset focus:ring-2 focus:ring-luxury-gold/50"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 btn-premium text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save & Continue</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;

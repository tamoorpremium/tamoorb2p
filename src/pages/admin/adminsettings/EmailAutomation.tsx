import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { Mail, FileText, Play, Pause, Send, Loader2 } from "lucide-react";

type Template = {
  id: number;
  name: string;
  type: "order_confirmation" | "invoice" | string;
  subject: string;
  is_active: boolean | null;
  automation_enabled: boolean | null;
  banner_url: string | null;
};

const FUNCTIONS = [
  { key: "order_confirmation", label: "Order Confirmation", icon: Mail },
  { key: "invoice", label: "Invoice Email", icon: FileText },
] as const;

const EmailAutomation: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [testOrderId, setTestOrderId] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("email_templates")
      .select("*")
      .order("id", { ascending: true });
    if (data) setTemplates(data);
    setLoading(false);
  };

  const templatesByType = useMemo(() => {
    const map: Record<string, Template[]> = {};
    for (const t of templates) {
      if (!map[t.type]) map[t.type] = [];
      map[t.type].push(t);
    }
    return map;
  }, [templates]);

  const toggleAutomation = async (templateId: number, enabled: boolean) => {
    setSaving((s) => ({ ...s, [templateId]: true }));
    await supabase
      .from("email_templates")
      .update({ automation_enabled: enabled })
      .eq("id", templateId);
    fetchTemplates();
    setSaving((s) => ({ ...s, [templateId]: false }));
  };

  const setActiveTemplate = async (type: string, templateId: number) => {
    setSaving((s) => ({ ...s, [templateId]: true }));
    // Deactivate other templates of this type
    await supabase.from("email_templates").update({ is_active: false }).eq("type", type);
    await supabase.from("email_templates").update({ is_active: true }).eq("id", templateId);
    fetchTemplates();
    setSaving((s) => ({ ...s, [templateId]: false }));
  };

  const sendTestEmail = async (fnKey: string) => {
    if (!testOrderId) {
      alert("Enter an Order ID to send a test.");
      return;
    }
    try {
      const endpoint =
        fnKey === "order_confirmation"
          ? "/functions/v1/send-confirmation-email"
          : "/functions/v1/send-invoice-email";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: Number(testOrderId) }),
      });

      if (!res.ok) throw new Error(await res.text());
      alert("Test email sent!");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const inputClasses = "w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors";

  if (loading) {
     return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>;
  }

  return (
    <div className="animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-yellow-400">Email Automation</h2>
        <p className="text-slate-400 mt-1">
          Toggle automation on/off and select active templates for each function.
        </p>
      </header>
      
      <div className="space-y-8">
          {/* Test with Order ID */}
          <section className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
            <h3 className="font-bold text-slate-100 mb-1">Send Test Email</h3>
            <p className="text-sm text-slate-400 mb-4">Trigger a test email for a specific order ID to preview the active template.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className={inputClasses}
                placeholder="Enter an existing Order ID (e.g. 117)"
                value={testOrderId}
                onChange={(e) => setTestOrderId(e.target.value)}
              />
            </div>
          </section>

          {/* Automation Functions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {FUNCTIONS.map(({ key, label, icon: Icon }) => {
              const options = templatesByType[key] || [];
              const activeTemplate = options.find((t) => t.is_active) || null;
              const isAnythingSaving = Object.values(saving).some(Boolean);

              return (
                <div
                  key={key}
                  className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-slate-800">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-100">{label}</h2>
                    </div>
                  </div>
                  
                  {/* Template Selector */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Active Template</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        className={`${inputClasses} appearance-none flex-1`}
                        value={activeTemplate?.id ?? ""}
                        disabled={isAnythingSaving}
                        onChange={(e) => setActiveTemplate(key, Number(e.target.value))}
                      >
                        <option value="" disabled>Choose a template</option>
                        {options.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} {t.is_active ? "(Active)" : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => sendTestEmail(key)}
                        disabled={isAnythingSaving || !testOrderId}
                        className="inline-flex justify-center items-center gap-2 rounded-lg px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" /> Send Test
                      </button>
                    </div>
                  </div>

                  {/* Automation Toggle */}
                  {activeTemplate && (
                    <div className="border-t border-slate-800 pt-6 flex justify-between items-center">
                       <div>
                          <h4 className="font-semibold text-slate-100">Automation Status</h4>
                          <p className="text-sm text-slate-400">Turn this automated email on or off.</p>
                       </div>
                       <label className="flex items-center cursor-pointer">
                          <div className="relative">
                              <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={!!activeTemplate.automation_enabled}
                                  disabled={saving[activeTemplate.id]}
                                  onChange={(e) => toggleAutomation(activeTemplate.id, e.target.checked)}
                              />
                              <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
                              <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-cyan-300"></div>
                          </div>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
};

export default EmailAutomation;


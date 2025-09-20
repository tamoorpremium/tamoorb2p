//src\pages\admin\adminsettings\EmailAutomation.tsx
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { Mail, FileText, Play, Pause, Send } from "lucide-react";

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-gradient1">
        <span className="text-xl font-semibold text-white">Loading Email Automation...</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-dashboard-gradient1 text-tamoor-charcoal flex flex-col px-6 md:px-12 py-10">
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
        Email <span className="tamoor-gradient">Automation</span>
      </h1>
      <p className="text-white/80 mb-6">
        Toggle automation on/off and select active templates for each function.
      </p>

      {/* Test with Order ID */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-lg border border-white/10 mb-6">
        <label className="block text-sm text-white/80 mb-2">Test with Order ID</label>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            className="flex-1 rounded-xl px-4 py-2 sm:py-3 bg-white/80 focus:bg-white outline-none text-sm sm:text-base"
            placeholder="e.g. 117"
            value={testOrderId}
            onChange={(e) => setTestOrderId(e.target.value)}
          />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {FUNCTIONS.map(({ key, label, icon: Icon }) => {
          const options = templatesByType[key] || [];
          const activeTemplate = options.find((t) => t.is_active) || null;

          return (
            <div
              key={key}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{label}</h2>
                </div>
              </div>

              {/* Template Selector */}
              {/* Template Selector */}
              <div className="mb-4">
                <label className="block text-sm text-white/80 mb-2">Select Template</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="flex-1 rounded-xl px-3 py-2 sm:px-4 sm:py-3 bg-white/80 focus:bg-white outline-none text-sm sm:text-base"
                    value={activeTemplate?.id ?? ""}
                    onChange={(e) => setActiveTemplate(key, Number(e.target.value))}
                  >
                    <option value="" disabled>
                      Choose a template
                    </option>
                    {options.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.is_active ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => sendTestEmail(key)}
                    className="inline-flex justify-center items-center gap-2 rounded-xl px-3 py-2 sm:px-4 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base transition"
                  >
                    <Send className="w-4 h-4" /> <span className="hidden sm:inline">Send Test</span>
                  </button>
                </div>
              </div>


              {/* Automation Toggle */}
              {activeTemplate && (
                <button
                  onClick={() => toggleAutomation(activeTemplate.id, !activeTemplate.automation_enabled)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white transition ${
                    activeTemplate.automation_enabled ? "bg-green-600 hover:bg-green-700" : "bg-slate-500 hover:bg-slate-600"
                  }`}
                >
                  {activeTemplate.automation_enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {activeTemplate.automation_enabled ? "Automation On" : "Automation Off"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmailAutomation;

// src/pages/admin/adminsettings/EmailTemplates.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { FileText, Plus, Trash2, ImageIcon, Save, Eye, Send } from "lucide-react";

type Template = {
  id: number;
  name: string;
  type: "order_confirmation" | "invoice" | string;
  subject: string;
  body: string;
  banner_url: string | null;
  is_active: boolean | null;
  automation_enabled: boolean | null;
};

const PLACEHOLDERS: Record<string, string[]> = {
  order_confirmation: [
    "{{customerName}}",
    "{{orderId}}",
    "{{total}}",
    "{{deliveryOption}}",
  ],
  invoice: [
    "{{customerName}}",
    "{{orderId}}",
    "{{subtotal}}",
    "{{discount}}",
    "{{deliveryFee}}",
    "{{total}}",
  ],
  custom: ["{{customerName}}", "{{orderId}}"],
};

// helper for safe public url
const getPublicUrl = (path: string | null) => {
  if (!path) return null;
  const { data } = supabase.storage.from("email-banners").getPublicUrl(path);
  return data?.publicUrl || null;
};

const AdminEmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // test state
  const [testOrderId, setTestOrderId] = useState<string>("");
  const [useAdminEmail, setUseAdminEmail] = useState<boolean>(false);
  const [sendingTest, setSendingTest] = useState<boolean>(false);

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

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);

    let banner_url = editing.banner_url;

    // Upload banner if new file selected
    if (bannerFile) {
      const { data, error } = await supabase.storage
        .from("email-banners")
        .upload(`banner_${Date.now()}_${bannerFile.name}`, bannerFile, {
          upsert: true,
        });
      if (error) {
        alert("Banner upload failed: " + error.message);
        setSaving(false);
        return;
      }
      banner_url = data?.path ?? null;
    }

    if (editing.id) {
      // Update existing template
      await supabase
        .from("email_templates")
        .update({ ...editing, banner_url })
        .eq("id", editing.id);
    } else {
      // Create new template
      const { data: newTemplate } = await supabase
        .from("email_templates")
        .insert([{ ...editing, banner_url }])
        .select()
        .single();
      editing.id = newTemplate?.id ?? 0;
    }

    // ensure only one active template per type
    if (editing.is_active) {
      await supabase
        .from("email_templates")
        .update({ is_active: false })
        .neq("id", editing.id)
        .eq("type", editing.type);
    }

    setEditing(null);
    setBannerFile(null);
    fetchTemplates();
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    await supabase.from("email_templates").delete().eq("id", id);
    fetchTemplates();
  };

  const startEditing = (template?: Template) => {
    setEditing(
      template
        ? { ...template }
        : {
            id: 0,
            name: "",
            type: "order_confirmation",
            subject: "",
            body: "",
            banner_url: null,
            is_active: false,
            automation_enabled: true,
          }
    );
    setBannerFile(null);
  };

  // ✅ Fixed: triggerEmail uses supabase.functions.invoke
  const triggerEmail = async (
    templateId: number,
    mode: "test" | "invoice" | "confirmation"
  ) => {
    if (!testOrderId) {
      alert("Please enter an Order ID before testing.");
      return;
    }
    setSendingTest(true);

    try {
      let fnName = "";
      let payload: any = {};

      switch (mode) {
        case "test":
          fnName = "send_test_email"; // your test email function
          payload = {
            templateId,
            orderId: testOrderId,
            testEmail: useAdminEmail ? "tamoorpremium@gmail.com" : null,
          };
          break;

        case "invoice":
          fnName = "send-invoice-email";
          payload = {
            orderId: testOrderId,
            testEmail: useAdminEmail ? "tamoorpremium@gmail.com" : null,
          };
          break;

        case "confirmation":
          fnName = "send-confirmation-email";
          payload = {
            orderId: testOrderId,
            testEmail: useAdminEmail ? "tamoorpremium@gmail.com" : null,
          };
          break;
      }

      const { data, error } = await supabase.functions.invoke(fnName, {
        body: payload,
      });

      if (error) throw error;

      alert(
        `✅ ${mode} email sent successfully to ${
          data?.sentTo || "customer email"
        }`
      );
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }

    setSendingTest(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-gradient1">
        <span className="text-xl font-semibold text-white">
          Loading Templates...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-dashboard-gradient1 text-tamoor-charcoal flex flex-col px-6 md:px-12 py-10">
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
        Manage <span className="tamoor-gradient">Email Templates</span>
      </h1>
      <p className="text-white/80 mb-6">
        Create, edit, preview and manage your email templates.
      </p>

      <button
        onClick={() => startEditing()}
        className="inline-flex items-center gap-2 mb-6 rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white transition"
      >
        <Plus className="w-4 h-4" /> Add New Template
      </button>

{/* Templates List */}
<div className="flex flex-col gap-6 pb-4">
  {templates.map((t) => (
    <div
      key={t.id}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/10 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{t.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => startEditing(t)}
            className="text-green-400 hover:text-green-500"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(t.id)}
            className="text-red-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-white/70 mb-1">Type: {t.type}</p>
      <p className="text-sm text-white/70 mb-1">Subject: {t.subject}</p>
      <p className="text-sm text-white/70 mb-2 truncate">Body: {t.body}</p>
      {t.banner_url && (
        <img
          src={getPublicUrl(t.banner_url) || ""}
          alt="Banner"
          className="rounded-lg mt-2"
        />
      )}
      <div className="flex gap-2 mt-2">
        <span
          className={`px-2 py-1 rounded-lg text-sm ${
            t.is_active ? "bg-green-600" : "bg-gray-500"
          }`}
        >
          Active
        </span>
        <span
          className={`px-2 py-1 rounded-lg text-sm ${
            t.automation_enabled ? "bg-blue-600" : "bg-gray-500"
          }`}
        >
          Automation
        </span>
      </div>

      {/* --- Test Section --- */}
      <div className="mt-4 bg-black/30 p-3 rounded-xl text-white/80 text-sm">
              <p className="mb-2 font-semibold">Test this Template</p>
              <input
                type="text"
                placeholder="Enter Order ID"
                className="w-full mb-2 rounded-lg px-3 py-2 text-black"
                value={testOrderId}
                onChange={(e) => setTestOrderId(e.target.value)}
              />
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={useAdminEmail}
                  onChange={(e) => setUseAdminEmail(e.target.checked)}
                />
                Send to admin email (tamoorpremium@gmail.com)
              </label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => triggerEmail(t.id, "test")}
                  disabled={sendingTest}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white transition w-full justify-center"
                >
                  <Send className="w-4 h-4" />
                  {sendingTest ? "Sending..." : "Send Test Email"}
                </button>
                <button
                  onClick={() => triggerEmail(t.id, "invoice")}
                  disabled={sendingTest}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-green-600 hover:bg-green-700 text-white transition w-full justify-center"
                >
                  <FileText className="w-4 h-4" />
                  {sendingTest ? "Sending..." : "Send Invoice Email"}
                </button>
                <button
                  onClick={() => triggerEmail(t.id, "confirmation")}
                  disabled={sendingTest}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white transition w-full justify-center"
                >
                  <FileText className="w-4 h-4" />
                  {sendingTest ? "Sending..." : "Send Confirmation Email"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-3xl w-full flex flex-col gap-4 shadow-lg border border-white/10">
            <h2 className="text-xl font-semibold text-white">
              {editing.id ? "Edit Template" : "Add New Template"}
            </h2>

            <input
              className="rounded-xl px-4 py-2 outline-none"
              placeholder="Name"
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <select
              className="rounded-xl px-4 py-2 outline-none"
              value={editing.type}
              onChange={(e) =>
                setEditing({ ...editing, type: e.target.value })
              }
            >
              <option value="order_confirmation">Order Confirmation</option>
              <option value="invoice">Invoice</option>
              <option value="custom">Custom</option>
            </select>

            <input
              className="rounded-xl px-4 py-2 outline-none"
              placeholder="Subject"
              value={editing.subject}
              onChange={(e) =>
                setEditing({ ...editing, subject: e.target.value })
              }
            />

            <textarea
              className="rounded-xl px-4 py-2 outline-none"
              placeholder="Body (HTML allowed)"
              rows={6}
              value={editing.body}
              onChange={(e) =>
                setEditing({ ...editing, body: e.target.value })
              }
            />

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setBannerFile(e.target.files?.[0] ?? null)
                }
              />
              {editing.banner_url && <ImageIcon className="w-5 h-5 text-white" />}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 mt-2">
              <label className="text-white/80 text-sm">Set as Active:</label>
              <input
                type="checkbox"
                checked={editing.is_active ?? false}
                onChange={(e) =>
                  setEditing({ ...editing, is_active: e.target.checked })
                }
              />
            </div>

            {/* Placeholders Helper */}
            <div className="bg-black/30 rounded-xl p-3 text-white/80 text-sm mt-2">
              <p className="font-semibold mb-1">Available Placeholders:</p>
              <div className="flex flex-wrap gap-2">
                {(PLACEHOLDERS[editing.type] || []).map((ph) => (
                  <span
                    key={ph}
                    className="px-2 py-1 rounded-lg bg-white/20 text-xs"
                  >
                    {ph}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-xl p-4 mt-2">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Preview
              </h3>
              {editing.banner_url && (
                <img
                  src={getPublicUrl(editing.banner_url) || ""}
                  alt="Banner"
                  className="rounded mb-2"
                />
              )}
              <h4 className="font-bold mb-1">{editing.subject}</h4>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: editing.body }}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailTemplates;

import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { FileText, Plus, Trash2, ImageIcon, Save, Eye, Send, Loader2, X, Edit } from "lucide-react";

type Template = {
  id?: number;
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
    "{{customerName}}", // from profiles.full_name
    "{{orderId}}",      // from orders.id
    "{{total}}",        // from orders.total
    "{{deliveryOption}}", // from orders.delivery_option
    "{{paymentMethod}}"   // from orders.payment_method
  ],
  invoice: [
    "{{customerName}}", // from profiles.full_name
    "{{orderId}}",      // from orders.id
    "{{subtotal}}",     // from orders.subtotal
    "{{discount}}",     // from orders.discount
    "{{deliveryFee}}",  // from orders.delivery_fee
    "{{total}}",        // from orders.total
    "{{paymentMethod}}" // from orders.payment_method
  ],
  custom: [
    "{{customerName}}",
    "{{orderId}}",
    "{{total}}"
  ],
};


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

    // Upload new banner if selected
    if (bannerFile) {
      const { data, error } = await supabase.storage
        .from("email-banners")
        .upload(`banner_${Date.now()}_${bannerFile.name}`, bannerFile, { upsert: true });
      if (error) { alert("Banner upload failed: " + error.message); setSaving(false); return; }
      banner_url = data?.path ?? null;
    }

    try {
      const payload = {
        name: editing.name,
        type: editing.type,
        subject: editing.subject,
        body: editing.body,
        banner_url,
        is_active: editing.is_active ?? false,
        automation_enabled: editing.automation_enabled ?? false
      };

      if (editing.id) {
        // Update existing template
        const { error } = await supabase
          .from("email_templates")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        // Insert new template
        const { data: newTemplate, error } = await supabase
          .from("email_templates")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        editing.id = newTemplate?.id;
      }

      // Ensure only one active template per type
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
    } catch (err: any) {
      alert("Error saving template: " + err.message);
    }

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

  const triggerEmail = async (templateId: number, mode: "test" | "invoice" | "confirmation") => {
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
          fnName = "send_test_email";
          payload = { templateId, orderId: testOrderId, testEmail: useAdminEmail ? "tamoorpremium@gmail.com" : null };
          break;
        case "invoice":
          fnName = "send-invoice-email";
          payload = { orderId: testOrderId, testEmail: useAdminEmail ? "tamoorpremium@gmail.com" : null };
          break;
        case "confirmation":
          fnName = "send-confirmation-email";
          payload = { orderId: testOrderId, testEmail: useAdminEmail ? "tamoorpremium@gmail.com" : null };
          break;
      }

      const { data, error } = await supabase.functions.invoke(fnName, { body: payload });
      if (error) throw error;

      alert(`✅ ${mode} email sent successfully to ${data?.sentTo || "customer email"}`);
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }

    setSendingTest(false);
  };

  const inputClasses = "w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors";

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-cyan-400" size={32} /></div>;
  }

  return (
    <div className="animate-fadeIn">
       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
              <h2 className="text-2xl font-bold text-yellow-400">Manage Email Templates</h2>
              <p className="text-slate-400 mt-1">Create, edit, preview and manage your email templates.</p>
          </div>
          <button
              onClick={() => startEditing()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 transition-all duration-200"
          >
              <Plus size={18} /> Add New Template
          </button>
      </header>

      {/* Templates List */}
      <div className="space-y-6">
        {templates.map((t) => (
          <div key={t.id} className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-100">{t.name}</h3>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-slate-400">
                        <span className="capitalize">Type: <span className="font-semibold text-slate-300">{t.type.replace('_', ' ')}</span></span>
                        <div className="flex items-center gap-2">Status: 
                            {t.is_active ? <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-cyan-500/20 text-cyan-300">Active</span> : <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-slate-700 text-slate-400">Inactive</span>}
                        </div>
                        <div className="flex items-center gap-2">Automation: 
                            {t.automation_enabled ? <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-green-500/20 text-green-300">On</span> : <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-slate-700 text-slate-400">Off</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => startEditing(t)} className="p-2 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(t.id!)} className="p-2 rounded-md bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            {/* --- Test Section --- */}
            <div className="mt-6 border-t border-slate-800 pt-6">
                <h4 className="font-bold text-slate-200 mb-4">Test this Template</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Order ID</label>
                        <input type="text" placeholder="Enter Order ID to test" className={inputClasses} value={testOrderId} onChange={(e) => setTestOrderId(e.target.value)} />
                        <div className="mt-4">
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500" checked={useAdminEmail} onChange={(e) => setUseAdminEmail(e.target.checked)} />
                                Send to admin email (tamoorpremium@gmail.com)
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                         <button onClick={() => triggerEmail(t.id!, "test")} disabled={sendingTest} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition font-semibold disabled:opacity-50">
                            {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Test
                         </button>
                         <button onClick={() => triggerEmail(t.id!, "invoice")} disabled={sendingTest} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition font-semibold disabled:opacity-50">
                             {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Invoice
                         </button>
                         <button onClick={() => triggerEmail(t.id!, "confirmation")} disabled={sendingTest} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition font-semibold disabled:opacity-50">
                             {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Confirm
                         </button>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
              <header className="p-6 flex justify-between items-center border-b border-slate-800">
                  <h2 className="text-xl font-bold text-yellow-400">{editing.id ? "Edit Template" : "Add New Template"}</h2>
                  <button onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"><X size={20} /></button>
              </header>

              <main className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Form Section */}
                  <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-slate-300 mb-2">Template Name</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputClasses} placeholder="e.g., Standard Confirmation" /></div>
                      <div><label className="block text-sm font-medium text-slate-300 mb-2">Template Type</label><select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className={`${inputClasses} appearance-none`}><option value="order_confirmation">Order Confirmation</option><option value="invoice">Invoice</option><option value="custom">Custom</option></select></div>
                      <div><label className="block text-sm font-medium text-slate-300 mb-2">Email Subject</label><input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className={inputClasses} placeholder="e.g., Your Order is Confirmed!" /></div>
                      <div><label className="block text-sm font-medium text-slate-300 mb-2">Email Body (HTML supported)</label><textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className={inputClasses} rows={8} placeholder="<p>Hi {{customerName}},</p>..." /></div>
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Banner Image</label>
                          <label className="w-full flex items-center gap-3 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700">
                              <ImageIcon className="w-5 h-5 text-cyan-400" />
                              <span className="text-slate-300 text-sm font-medium">{bannerFile ? bannerFile.name : "Choose a file..."}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} />
                          </label>
                      </div>
                       <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg"><span className="font-medium text-slate-200">Set as Active Template for this Type</span><label className="cursor-pointer"><div className="relative"><input type="checkbox" checked={editing.is_active ?? false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="sr-only peer" /><div className="block bg-slate-700 w-11 h-6 rounded-full"></div><div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full peer-checked:bg-cyan-300"></div></div></label></div>
                  </div>
                  
                  {/* Preview Section */}
                  <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                          <h3 className="text-sm font-bold text-yellow-400 mb-2">Available Placeholders</h3>
                          <div className="flex flex-wrap gap-2">
                              {(PLACEHOLDERS[editing.type] || []).map((ph) => <span key={ph} className="px-2 py-1 rounded bg-slate-700 text-xs font-mono text-cyan-300">{ph}</span>)}
                          </div>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-slate-600"><Eye className="w-4 h-4" /> Live Preview</h3>
                          <div className="border-t pt-4">
                              {(bannerFile || editing.banner_url) && <img src={bannerFile ? URL.createObjectURL(bannerFile) : getPublicUrl(editing.banner_url) || ""} alt="Banner Preview" className="rounded mb-4 w-full object-cover" />}
                              <h4 className="font-bold mb-2 text-lg text-slate-800">{editing.subject || "Subject Line"}</h4>
                              <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: editing.body || "<p>Your email content will appear here.</p>" }} />
                          </div>
                      </div>
                  </div>
              </main>

              <footer className="p-6 flex justify-end gap-4 border-t border-slate-800">
                  <button onClick={() => setEditing(null)} className="px-5 py-2.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition font-semibold">Cancel</button>
                  <button onClick={handleSave} className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 transition disabled:opacity-50" disabled={saving}>
                    {saving && <Loader2 className="animate-spin" size={18} />}
                    {saving ? "Saving..." : "Save Template"}
                  </button>
              </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailTemplates;
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

const EmailTemplates: React.FC = () => {
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
      await supabase
        .from("email_templates")
        .update({ ...editing, banner_url })
        .eq("id", editing.id);
    } else {
      const { data: newTemplate } = await supabase
        .from("email_templates")
        .insert([{ ...editing, banner_url }])
        .select()
        .single();
      editing.id = newTemplate?.id ?? 0;
    }

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

  // ✅ Fixed triggerEmail to call Edge Functions directly
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
          fnName = "send-template-email"; // your test email function
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
      {/* --- rest of your JSX unchanged --- */}
      {/* Buttons now call fixed triggerEmail */}
    </div>
  );
};

export default EmailTemplates;

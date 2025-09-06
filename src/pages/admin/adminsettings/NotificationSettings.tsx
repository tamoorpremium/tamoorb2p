import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

interface NotificationSetting {
  id: number;
  type: string; // email, sms, push
  templates: any;
  enabled: boolean;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
        .from<'notification_settings', NotificationSetting>('notification_settings').select('*');
        if (error) throw error;
        setSettings(data || []);
      } catch {
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // For brevity, only show basic enabled toggles
  return loading ? (
    <p>Loading notification settings...</p>
  ) : (
    <div className="space-y-4">
      {settings.map((setting) => (
        <div key={setting.id} className="flex items-center space-x-4 border-b p-2">
          <span className="capitalize">{setting.type}</span>
          <input type="checkbox" checked={setting.enabled} readOnly />
        </div>
      ))}
      <p className="italic mt-4">Editing notification templates and detailed controls can be implemented later.</p>
    </div>
  );
};

export default NotificationSettings;

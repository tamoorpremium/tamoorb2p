import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

interface Integration {
  id: number;
  name: string;
  api_key: string;
  enabled: boolean;
}

const IntegrationSettings = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
        .from<'integration_settings', Integration>('integration_settings').select('*');
        if (error) throw error;
        setIntegrations(data || []);
      } catch {
        toast.error('Failed to fetch integrations');
      } finally {
        setLoading(false);
      }
    };
    fetchIntegrations();
  }, []);

  return loading ? (
    <p>Loading integrations...</p>
  ) : (
    <div>
      {integrations.map((integration) => (
        <div key={integration.id} className="mb-4 border p-3 rounded">
          <h3 className="font-semibold mb-2">{integration.name}</h3>
          <p>API Key: {integration.api_key}</p>
          <p>Enabled: {integration.enabled ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </div>
  );
};

export default IntegrationSettings;

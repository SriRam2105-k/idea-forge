import { createAdminClient } from '@/lib/supabase/server';
import { AdminSettingsClient } from '@/components/admin/settings-client';

async function getSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('hackathon_settings').select('*').order('key');
  return data || [];
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Hackathon configuration and metadata</p>
          </div>
          <AdminSettingsClient settings={settings} />
        </div>
      </main>
  );
}


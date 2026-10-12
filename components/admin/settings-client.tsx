'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSetting } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { HackathonSetting } from '@/types';

export function AdminSettingsClient({ settings }: { settings: HackathonSetting[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);

  const getVal = (key: string) => {
    const s = settings.find(s => s.key === key);
    return s ? (typeof s.value === 'string' ? s.value : JSON.stringify(s.value, null, 2)) : '';
  };

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ message: msg, ok });
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>, key: string, isJson: boolean = false) {
    e.preventDefault();
    setSaving(key);
    
    const fd = new FormData(e.currentTarget);
    const rawValue = fd.get('value') as string;
    
    let parsedValue: unknown = rawValue;
    if (isJson) {
      try {
        parsedValue = JSON.parse(rawValue);
      } catch {
        showFeedback(`Invalid JSON for ${key}`, false);
        setSaving(null);
        return;
      }
    }

    const result = await updateSetting(key, parsedValue);
    setSaving(null);
    
    if (result.success) {
      showFeedback('Setting updated successfully.', true);
      router.refresh();
    } else {
      showFeedback(result.message, false);
    }
  }

  const sections: { title: string; items: { key: string; label: string; type: string; isJson?: boolean }[] }[] = [
    {
      title: 'General Event Info',
      items: [
        { key: 'hackathon_name', label: 'Hackathon Name', type: 'text' },
        { key: 'hackathon_tagline', label: 'Tagline', type: 'text' },
        { key: 'hackathon_description', label: 'Short Description', type: 'textarea' },
        { key: 'hackathon_year', label: 'Year/Edition', type: 'text' },
      ]
    },
    {
      title: 'Dates & Contact',
      items: [
        { key: 'hackathon_start_date', label: 'Start Date (ISO 8601)', type: 'text' },
        { key: 'hackathon_end_date', label: 'End Date (ISO 8601)', type: 'text' },
        { key: 'contact_email', label: 'Contact Email', type: 'text' },
        { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
      ]
    },
    {
      title: 'Configuration (JSON arrays)',
      items: [
        { key: 'problem_categories', label: 'Problem Categories (JSON array)', type: 'textarea', isJson: true },
      ]
    }
  ];

  return (
    <div>
      {feedback && (
        <div role="alert" className={`mb-4 px-4 py-3 rounded-lg text-sm border animate-fade-in sticky top-4 z-10 ${
          feedback.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900 text-sm">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map(item => (
                <div key={item.key} className="p-5">
                  <form onSubmit={e => handleSave(e, item.key, item.isJson)} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{item.label}</label>
                      {item.type === 'textarea' ? (
                        <textarea
                          name="value"
                          defaultValue={getVal(item.key)}
                          rows={item.isJson ? 6 : 3}
                          className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B] resize-y ${item.isJson ? 'font-mono text-xs' : ''}`}
                        />
                      ) : (
                        <input
                          type="text"
                          name="value"
                          defaultValue={getVal(item.key)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B6B]"
                        />
                      )}
                    </div>
                    <Button type="submit" variant="outline" size="sm" loading={saving === item.key} className="w-full sm:w-auto shrink-0">
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useGlobalPreferences } from '@/lib/global-context';
import { SUPPORTED_LOCALES, getLocaleLabel } from '@/lib/locale';
import { COMMON_TIMEZONES } from '@/lib/timezone';
import { setUserGlobalPreferences } from '@/app/actions/global';

export default function GlobalSettingsForm() {
  const { preferences, updatePreferences } = useGlobalPreferences();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      const result = await setUserGlobalPreferences({
        locale: formData.get('locale') as string,
        timezone: formData.get('timezone') as string,
        country: formData.get('country') as string,
        region: formData.get('region') as string,
      });

      if (result.success) {
        updatePreferences({
          locale: formData.get('locale') as string,
          timezone: formData.get('timezone') as string,
          country: formData.get('country') as string,
          region: formData.get('region') as string,
        });
        setMessage('Global preferences updated successfully!');
      } else {
        setMessage('Failed to update preferences');
      }
    } catch (error) {
      setMessage('Error updating preferences');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900">Global Preferences</h2>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully')
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div>
        <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-2">
          Language / Locale
        </label>
        <select
          id="locale"
          name="locale"
          defaultValue={preferences.locale}
          className="input-base"
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {getLocaleLabel(locale)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={preferences.timezone}
          className="input-base"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            defaultValue={preferences.country || ''}
            placeholder="e.g., United States"
            className="input-base"
          />
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            Region / State
          </label>
          <input
            type="text"
            id="region"
            name="region"
            defaultValue={preferences.region || ''}
            placeholder="e.g., California"
            className="input-base"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}

import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Moon, Bell, Shield, Save } from 'lucide-react';

export const SettingsPage = () => {
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    quizReminders: true,
    weeklyReport: false,
  });

  const handleSave = () => {
    addToast('Preferences saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Header title="Platform Settings" subtitle="Configure interface theme, notifications, and account preferences." />

      {/* Appearance Section */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-100 border-b border-dark-border pb-3 mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-brand-cyan" /> Appearance & Theme
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-ms bg-dark-bg border border-brand-cyan/40">
            <div>
              <p className="text-sm font-bold text-slate-100">Microsoft Dark Desktop (Default)</p>
              <p className="text-xs text-slate-400">Deep charcoal canvas with electric cyan & vivid accent glow</p>
            </div>
            <span className="text-xs font-bold text-brand-cyan px-2.5 py-1 rounded-full bg-brand-cyan/20">Active</span>
          </div>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-100 border-b border-dark-border pb-3 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-purple" /> Notification Preferences
        </h3>
        <div className="space-y-4 text-sm">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-slate-200">Email Notifications</p>
              <p className="text-xs text-slate-400">Receive assessment submission receipts and status updates</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailAlerts}
              onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
              className="w-4 h-4 rounded border-dark-border bg-dark-bg text-brand-cyan focus:ring-brand-cyan"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-dark-border/60">
            <div>
              <p className="font-semibold text-slate-200">Quiz Reminders</p>
              <p className="text-xs text-slate-400">Get notified when new quizzes are assigned or published</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.quizReminders}
              onChange={(e) => setNotifications({ ...notifications, quizReminders: e.target.checked })}
              className="w-4 h-4 rounded border-dark-border bg-dark-bg text-brand-cyan focus:ring-brand-cyan"
            />
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" icon={Save} onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { oversightApi } from '../../api/oversightApi';
import { useToast } from '../../context/ToastContext';
import { ACTIVITY_MODULES, ISSUE_SEVERITIES } from '../../utils/constants';
import { Modal } from '../common/Modal';

const emptyForm = { title: '', description: '', severity: 'MEDIUM', module: '' };

/** Super Admin form for reporting an issue to the Admin team, optionally
 *  linked to a specific activity record. The form mounts fresh on every open. */
export const ReportIssueModal = ({ isOpen, onClose, activity = null }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Report Issue to Admin"
    subtitle={activity ? `Linked to: ${activity.summary}` : 'Describe what is incorrect and what should change.'}
  >
    {isOpen && <ReportIssueForm activity={activity} onClose={onClose} />}
  </Modal>
);

const ReportIssueForm = ({ activity, onClose }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState(() =>
    activity
      ? { ...emptyForm, title: `Review: ${activity.summary}`.slice(0, 255), module: activity.module || '' }
      : emptyForm
  );
  const [formError, setFormError] = useState(null);

  const mutation = useMutation({
    mutationFn: (payload) => oversightApi.createReport(payload),
    onSuccess: () => {
      toast.success('Issue Reported', 'The Admin team has been notified.');
      queryClient.invalidateQueries({ queryKey: ['oversight'] });
      onClose();
    },
    onError: (err) => setFormError(err.detail || err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3) return setFormError('Please enter a title (at least 3 characters).');
    if (form.description.trim().length < 5) return setFormError('Please describe what needs to change.');
    mutation.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      module: form.module || null,
      activity_log_id: activity?.id || null,
    });
  };

  const inputClass =
    'w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500/50';

  return (
      <form onSubmit={submit} className="space-y-3 text-xs">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {formError}
          </div>
        )}
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            className={inputClass}
            value={form.title}
            maxLength={255}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">What is wrong / what should change</label>
          <textarea
            className={`${inputClass} min-h-28`}
            value={form.description}
            maxLength={5000}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1">Severity</label>
            <select
              className={inputClass}
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              {ISSUE_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Area</label>
            <select
              className={inputClass}
              value={form.module}
              onChange={(e) => setForm({ ...form, module: e.target.value })}
            >
              <option value="">General</option>
              {ACTIVITY_MODULES.filter((m) => m.value !== 'oversight').map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60 flex items-center space-x-1.5"
          >
            {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Send Report</span>
          </button>
        </div>
      </form>
  );
};

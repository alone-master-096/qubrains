import { useState } from "react";
import { KeyRound } from "lucide-react";
import { changeUserPassword } from "../../services/auth";
import { getAuthErrorMessage } from "../../utils/firebaseErrors";
import { passwordStrengthError } from "../../utils/validation";
import ErrorMessage from "../common/ErrorMessage";

export default function AccountSettings() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const pwError = passwordStrengthError(newPassword);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      await changeUserPassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setOpen(false), 1200);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Account</h2>
      <div className="mt-2 rounded-2xl border border-zinc-100">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-medium text-ink transition hover:bg-zinc-50"
        >
          <KeyRound size={17} className="text-zinc-400" />
          Change password
        </button>

        {open && (
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-zinc-100 p-4">
            {error && <ErrorMessage message={error} />}
            {success && <p className="text-sm text-pulse">Password updated.</p>}

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              aria-label="Current password"
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              aria-label="New password"
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              aria-label="Confirm new password"
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-paper transition disabled:opacity-60"
            >
              {saving ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

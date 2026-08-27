import AccountSettings from "./AccountSettings";
import AppearanceSettings from "./AppearanceSettings";
import PrivacySettings from "./PrivacySettings";

export default function Settings() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-xl font-semibold text-ink">Settings</h1>

      <div className="mt-6 space-y-8">
        <AccountSettings />
        <AppearanceSettings />
        <PrivacySettings />
      </div>
    </div>
  );
}

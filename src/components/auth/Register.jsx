import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "./AuthLayout";
import ErrorMessage from "../common/ErrorMessage";
import { registerUser } from "../../services/auth";
import { getAuthErrorMessage } from "../../utils/firebaseErrors";
import {
  isValidEmail,
  isValidUsername,
  passwordStrengthError,
  USERNAME_RULES,
} from "../../utils/validation";

export default function Register() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    if (!displayName.trim()) return "Enter your name.";
    if (!isValidUsername(username)) return `Username: ${USERNAME_RULES}`;
    if (!isValidEmail(email)) return "Enter a valid email address.";
    const pwError = passwordStrengthError(password);
    if (pwError) return pwError;
    if (password !== confirmPassword) return "Passwords don't match.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await registerUser({
        email: email.trim(),
        password,
        username: username.trim(),
        displayName: displayName.trim(),
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err.code === "qubrains/username-taken") {
        setError("That username is taken. Try another.");
      } else {
        setError(getAuthErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout eyebrow="Get started" title="Create your account" subtitle="Takes less than a minute.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && <ErrorMessage message={error} />}

        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            placeholder="Ada Lovelace"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-ink">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            placeholder="ada"
          />
          <p className="mt-1 text-xs text-zinc-400">{USERNAME_RULES}</p>
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-ink">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            placeholder="Re-enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-signal hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

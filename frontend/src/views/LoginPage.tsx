import { motion } from "framer-motion";
import type { AuthConfig, UserRole } from "@machine-health/shared";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Github, HardHat, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setStoredUser } from "../auth/session";
import { api } from "../services/api";
import { IndustrialBackground } from "../ui/IndustrialBackground";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-.8 2.3-1.8 3.1l3 2.3c1.8-1.6 2.8-4 2.8-6.9 0-.7-.1-1.5-.2-2.2H12z"
      />
      <path
        fill="#34A853"
        d="M12 21c2.5 0 4.7-.8 6.3-2.2l-3-2.3c-.8.6-1.9 1-3.3 1-2.5 0-4.6-1.7-5.4-4H3.5v2.5C5.1 19 8.3 21 12 21z"
      />
      <path
        fill="#4A90E2"
        d="M6.6 13.5c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7V7.6H3.5C2.9 8.8 2.5 10 2.5 11.8s.4 3 1 4.2l3.1-2.5z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.1c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.7 3 14.5 2 12 2 8.3 2 5.1 4 3.5 7.6l3.1 2.5c.8-2.3 2.9-4 5.4-4z"
      />
    </svg>
  );
}

const roles: Array<{
  role: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    role: "operator",
    title: "Operator",
    description: "Detailed machine monitoring, live telemetry, alerts, and maintenance actions.",
    icon: HardHat
  },
  {
    role: "boss",
    title: "Boss",
    description: "Fleet exposure, energy usage, predictive overview, and business-level reporting.",
    icon: Shield
  }
];

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup" | "verify">("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("operator");
  const [name, setName] = useState("Shift Operator");
  const [email, setEmail] = useState("operator@factory.local");
  const [password, setPassword] = useState("operator123");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);

    if (role === "operator") {
      setName("Shift Operator");
      setEmail("operator@factory.local");
      setPassword("operator123");
    } else {
      setName("Operations Boss");
      setEmail("boss@factory.local");
      setPassword("boss123");
    }
  };

  useEffect(() => {
    void api.getAuthConfig().then(setAuthConfig).catch(() => {
      setAuthConfig({
        oAuthProviders: [],
        requireEmailVerification: true,
        passwordMinLength: 6,
        verifyEmailMethod: "code"
      });
    });
  }, []);

  useEffect(() => {
    const code = searchParams.get("insforge_code");
    const storedVerifier = window.sessionStorage.getItem("machine-health-oauth-verifier");
    const storedRole = window.sessionStorage.getItem("machine-health-oauth-role");
    const status = searchParams.get("insforge_status");
    const authError = searchParams.get("insforge_error");

    if (status === "error" && authError) {
      setError(authError);
    }

    if (!code || !storedVerifier || (storedRole !== "operator" && storedRole !== "boss")) {
      return;
    }

    setSubmitting(true);
    setError(null);

    void api
      .exchangeOAuth({
        code,
        codeVerifier: storedVerifier,
        role: storedRole
      })
      .then((result) => {
        setStoredUser(result.user);
        window.sessionStorage.removeItem("machine-health-oauth-verifier");
        window.sessionStorage.removeItem("machine-health-oauth-role");
        setSearchParams({});
        navigate(`/${result.user.role}`);
      })
      .catch((oauthError) => {
        setError(oauthError instanceof Error ? oauthError.message : "OAuth login failed");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [navigate, searchParams, setSearchParams]);

  const handleLogin = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await api.login({ email, password, role: selectedRole });
      setStoredUser(result.user);
      navigate(`/${result.user.role}`);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await api.signUp({ name, email, password, role: selectedRole });
      if (result.requireEmailVerification) {
        window.sessionStorage.setItem(
          "machine-health-pending-signup",
          JSON.stringify({ name, email, role: selectedRole })
        );
        setMode("verify");
      }
    } catch (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const stored = window.sessionStorage.getItem("machine-health-pending-signup");
      const pending = stored ? (JSON.parse(stored) as { name: string; email: string; role: UserRole }) : null;
      const verifyName = pending?.name ?? name;
      const verifyEmailAddress = pending?.email ?? email;
      const verifyRole = pending?.role ?? selectedRole;

      const result = await api.verifyEmail({
        email: verifyEmailAddress,
        otp,
        role: verifyRole,
        name: verifyName
      });

      window.sessionStorage.removeItem("machine-health-pending-signup");
      setStoredUser(result.user);
      navigate(`/${result.user.role}`);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await api.startOAuth({
        provider,
        redirectTo: `${window.location.origin}/login`
      });

      window.sessionStorage.setItem("machine-health-oauth-verifier", result.codeVerifier);
      window.sessionStorage.setItem("machine-health-oauth-role", selectedRole);
      window.location.href = result.url;
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : "OAuth start failed");
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <IndustrialBackground compact />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl rounded-[38px] border border-white/70 bg-white/62 p-8 shadow-panel backdrop-blur lg:p-10"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-industrial-blue">Access Control</p>
            <h1 className="mt-4 font-display text-5xl font-semibold text-steel-900">Choose your factory role.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-steel-500">
              Animated scan lines, conveyor motion, and industrial flow cues frame a focused entry point into the monitoring platform.
            </p>
            <div className="relative mt-10 h-56 overflow-hidden rounded-[30px] bg-steel-900">
              <motion.div
                animate={{ y: ["-15%", "100%"] }}
                transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute inset-x-0 h-10 bg-gradient-to-b from-industrial-amber/0 via-industrial-amber/55 to-industrial-amber/0"
              />
              <motion.div
                animate={{ x: ["-10%", "100%"] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute top-24 h-1 w-32 rounded-full bg-industrial-blue"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_20px)]" />
              <div className="absolute inset-y-8 left-8 right-8 rounded-[24px] border border-white/15" />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute bottom-8 right-10 h-16 w-16 rounded-full border border-industrial-amber/50"
              >
                <div className="absolute inset-3 rounded-full border border-industrial-amber/30" />
              </motion.div>
            </div>
          </div>
          <div className="grid gap-5 self-center">
            {roles.map(({ role, title, description, icon: Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.12 }}
              >
                <button
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`group flex items-center justify-between rounded-[30px] border p-6 transition hover:-translate-y-1 hover:shadow-panel ${
                    selectedRole === role
                      ? "border-industrial-blue bg-gradient-to-br from-white to-blue-50 shadow-panel"
                      : "border-steel-200 bg-gradient-to-br from-white to-steel-100"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-industrial-blue/10 p-4 text-industrial-blue">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl font-semibold text-steel-900">{title}</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-steel-500">{description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-steel-400 transition group-hover:translate-x-1 group-hover:text-industrial-amber" />
                </button>
              </motion.div>
            ))}
            <div className="rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-panel backdrop-blur">
              <div className="flex gap-2 rounded-full bg-steel-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "signin" ? "bg-white text-steel-900 shadow" : "text-steel-500"}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "signup" ? "bg-white text-steel-900 shadow" : "text-steel-500"}`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setMode("verify")}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "verify" ? "bg-white text-steel-900 shadow" : "text-steel-500"}`}
                >
                  Verify Code
                </button>
              </div>
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl bg-steel-50 px-4 py-3 text-sm text-steel-600">
                  Selected role: <span className="font-semibold uppercase">{selectedRole}</span>
                </div>
                {authConfig && authConfig.oAuthProviders.includes("google") && mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => void handleOAuth("google")}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-3 rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm font-semibold text-steel-900 transition hover:bg-steel-50 disabled:opacity-60"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                )}
                {mode === "signin" && authConfig && authConfig.oAuthProviders.includes("google") && (
                  <div className="relative py-1 text-center text-xs uppercase tracking-[0.28em] text-steel-400">
                    <span className="relative z-10 bg-white/75 px-3">or use credentials</span>
                    <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-steel-200" />
                  </div>
                )}
                {mode !== "signin" && (
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full name"
                    className="rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-industrial-blue"
                  />
                )}
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-industrial-blue"
                />
                {mode !== "verify" && (
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-industrial-blue"
                  />
                )}
                {mode === "verify" && (
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="6-digit verification code"
                    className="rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-industrial-blue"
                  />
                )}
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => void handleLogin()}
                    disabled={submitting}
                    className="rounded-2xl bg-industrial-blue px-5 py-3 font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
                  >
                    {submitting ? "Signing In..." : `Sign In as ${selectedRole}`}
                  </button>
                )}
                {mode === "signup" && (
                  <button
                    type="button"
                    onClick={() => void handleSignUp()}
                    disabled={submitting}
                    className="rounded-2xl bg-industrial-blue px-5 py-3 font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
                  >
                    {submitting ? "Creating Account..." : `Create ${selectedRole} Account`}
                  </button>
                )}
                {mode === "verify" && (
                  <button
                    type="button"
                    onClick={() => void handleVerify()}
                    disabled={submitting}
                    className="rounded-2xl bg-industrial-blue px-5 py-3 font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
                  >
                    {submitting ? "Verifying..." : "Verify Email Code"}
                  </button>
                )}
                {authConfig && authConfig.oAuthProviders.length > 0 && mode === "signin" && (
                  <div className="grid gap-3">
                    {authConfig.oAuthProviders.filter((provider) => provider !== "google").map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => void handleOAuth(provider)}
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-steel-200 bg-white px-4 py-3 text-sm font-semibold text-steel-900 transition hover:bg-steel-50 disabled:opacity-60"
                      >
                        {provider === "github" ? <Github className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        Continue with {provider}
                      </button>
                    ))}
                  </div>
                )}
                <div className="rounded-2xl bg-steel-50 px-4 py-3 text-xs leading-6 text-steel-500">
                  Operator: `operator@factory.local` / `operator123`
                  <br />
                  Boss: `boss@factory.local` / `boss123`
                </div>
                {error && <p className="text-sm text-rose-600">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

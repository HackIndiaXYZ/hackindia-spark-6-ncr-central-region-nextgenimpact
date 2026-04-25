"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveUser, getInitials } from "@/lib/userStore";

function PasswordStrength({ password }: { password: string }) {
  const score = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const labels = ["", "Weak", "Medium", "Strong"];
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-green-500"];
  const textColors = ["", "text-red-400", "text-orange-400", "text-green-400"];
  return password.length > 0 ? (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-border"}`} />
        ))}
      </div>
      <span className={`text-xs font-medium ${textColors[score]}`}>{labels[score]}</span>
    </div>
  ) : null;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", company: "", designation: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (!form.company.trim()) e.company = "Company is required";
    if (password.length < 6) e.password = "Min 6 characters";
    if (password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!agreed) e.agreed = "Please accept terms";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Save user profile to localStorage
    saveUser({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      company: form.company.trim(),
      designation: form.designation.trim() || "Engineer",
      role: "", // will be set in onboarding
      language: "en", // will be set in onboarding
      joinedAt: new Date().toISOString(),
      avatar: getInitials(form.name),
    });

    router.push("/onboarding");
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  return (
    <div className="min-h-screen flex animated-bg overflow-hidden">
      {/* Floating AWS icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {["EC2", "S3", "λ", "EKS", "RDS", "IAM", "VPC", "SNS"].map((icon, i) => (
          <div key={icon} className="absolute text-white/5 font-bold select-none"
            style={{ fontSize: `${20 + (i % 3) * 12}px`, left: `${(i * 13) % 90}%`, top: `${(i * 19 + 5) % 85}%`, transform: `rotate(${(i * 23) % 30 - 15}deg)` }}>
            {icon}
          </div>
        ))}
      </div>

      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-[55%] relative z-10">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl">⚡</span>
            <h1 className="text-5xl font-black text-text-primary">AWS Pulse</h1>
          </div>
          <p className="text-2xl font-semibold text-text-primary leading-snug mb-4">
            Join engineers who never miss a critical AWS update.
          </p>
          <p className="text-text-secondary text-lg mb-10">Set up in 2 minutes. Personalized from day one.</p>
          <div className="space-y-4">
            {[
              "Role-filtered feed — only updates that matter to you",
              "AI-simplified summaries in plain English, Hindi, or Hinglish",
              "Critical alerts before they become production incidents",
              "Real-time AWS RSS feed — always up to date",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-text-secondary">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <span className="text-3xl">⚡</span>
            <span className="text-2xl font-black text-text-primary">AWS Pulse</span>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-1">Create your account</h2>
            <p className="text-text-secondary text-sm mb-6">Tell us about yourself to personalize your feed</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input id="name" type="text" value={form.name} onChange={set("name")}
                  placeholder="Rahul Sharma"
                  className={`w-full bg-bg-secondary border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-orange focus:outline-none transition-colors text-sm ${errors.name ? "border-red-500" : "border-border"}`} />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              {/* Work Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Work Email *
                </label>
                <input id="email" type="email" value={form.email} onChange={set("email")}
                  placeholder="rahul@techcorp.com"
                  className={`w-full bg-bg-secondary border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-orange focus:outline-none transition-colors text-sm ${errors.email ? "border-red-500" : "border-border"}`} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Company *
                </label>
                <input id="company" type="text" value={form.company} onChange={set("company")}
                  placeholder="TechCorp India"
                  className={`w-full bg-bg-secondary border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-orange focus:outline-none transition-colors text-sm ${errors.company ? "border-red-500" : "border-border"}`} />
                {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company}</p>}
              </div>

              {/* Designation */}
              <div>
                <label htmlFor="designation" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Designation <span className="text-text-secondary/50 normal-case font-normal">(optional)</span>
                </label>
                <input id="designation" type="text" value={form.designation} onChange={set("designation")}
                  placeholder="Senior DevOps Engineer"
                  className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-orange focus:outline-none transition-colors text-sm" />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"}
                    value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => { const n={...p}; delete n.password; return n; }); }}
                    placeholder="Create a strong password"
                    className={`w-full bg-bg-secondary border rounded-lg px-4 py-3 pr-12 text-text-primary placeholder-text-secondary/50 focus:border-accent-orange focus:outline-none transition-colors text-sm ${errors.password ? "border-red-500" : "border-border"}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary text-sm"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <PasswordStrength password={password} />
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Confirm Password *
                </label>
                <input id="confirm" type="password" value={form.confirmPassword} onChange={set("confirmPassword")}
                  placeholder="Repeat your password"
                  className={`w-full bg-bg-secondary border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-orange focus:outline-none transition-colors text-sm ${errors.confirmPassword ? "border-red-500" : "border-border"}`} />
                {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors(p => { const n={...p}; delete n.agreed; return n; }); }}
                  className="mt-0.5 w-4 h-4 accent-orange-500 rounded" />
                <span className="text-sm text-text-secondary">
                  I agree to the{" "}
                  <Link href="#" className="text-accent-orange hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-accent-orange hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-red-400">{errors.agreed}</p>}

              <button type="submit"
                className="w-full bg-accent-orange hover:bg-orange-400 text-white font-semibold py-3 rounded-lg transition-all text-sm shadow-lg shadow-orange-500/20">
                Create Account & Continue →
              </button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-accent-orange hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

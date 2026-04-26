"use client";
import { useState, Suspense, lazy, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CenterOrb = lazy(() => import("@/components/three/CenterOrb"));

function CursorGlow() {
  const [p, setP] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const fn = (e: MouseEvent) => setP({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);
  return (
    <div className="pointer-events-none fixed z-[2]"
      style={{ left: p.x-300, top: p.y-300, width:600, height:600,
        background:"radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)" }} />
  );
}

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email"); return; }

    setLoading(true);
    // Save email to localStorage so dashboard can use it
    localStorage.setItem("aws_pulse_email", email.toLowerCase());
    setTimeout(() => router.push("/dashboard"), 800);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative" style={{ background:"#07051A" }}>
      <CursorGlow />

      {/* ── Background blobs ── */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{background:"radial-gradient(circle, rgba(88,28,220,0.20) 0%, transparent 65%)"}} />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full"
          style={{background:"radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 65%)"}} />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize:"60px 60px"}} />
      </div>

      {/* ── TOP NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{background:"linear-gradient(135deg,rgba(255,153,0,0.35),rgba(124,58,237,0.35))", border:"1px solid rgba(255,153,0,0.5)"}}>
            <span className="text-base">⚡</span>
          </div>
          <span className="font-black text-white text-lg tracking-tight">
            AWS <span style={{color:"#FF9900"}}>Pulse</span>
          </span>
        </div>
        <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors"
          style={{color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)"}}>
          <span>?</span> Need help?
        </button>
      </nav>

      {/* ── MAIN GRID — 3 columns: Left | Center(3D) | Right ── */}
      <div className="relative z-10 flex items-center min-h-[calc(100vh-120px)] px-6 lg:px-0">

        {/* LEFT — Content (z-index above 3D) */}
        <div className={`hidden lg:flex flex-col w-[30%] pl-12 xl:pl-16 relative z-20 transition-all duration-1000 ${mounted?"opacity-100 translate-x-0":"opacity-0 -translate-x-8"}`}>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full mb-6"
            style={{background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.35)"}}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="text-[11px] font-semibold tracking-widest uppercase" style={{color:"#A78BFA"}}>
              LIVE · AWS Intelligence. Real-Time.
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-black leading-[1.05] mb-4" style={{fontSize:"clamp(2.4rem,3.2vw,3.4rem)"}}>
            <span className="text-white block">Stay Ahead.</span>
            <span className="block" style={{background:"linear-gradient(135deg,#FF9900 0%,#A78BFA 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
              Build Smarter.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-sm leading-relaxed mb-7 max-w-[280px]" style={{color:"rgba(255,255,255,0.5)"}}>
            AI-powered AWS updates, personalized for your role, in your language.
          </p>

          {/* Stat cards */}
          <div className="flex flex-col gap-2.5 mb-7">
            {[
              {icon:"⚡", val:"3,500+", label:"Updates Tracked"},
              {icon:"👥", val:"4",      label:"Engineer Roles"},
              {icon:"🌐", val:"3",      label:"Languages (EN · HI · HG)"},
            ].map((s) => (
              <div key={s.val} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)"}}>
                <span className="text-lg flex-shrink-0">{s.icon}</span>
                <span className="text-base font-black text-white">{s.val}</span>
                <span className="text-xs" style={{color:"rgba(255,255,255,0.45)"}}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="p-4 rounded-2xl"
            style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="text-purple-400 text-2xl font-serif leading-none mb-2">&ldquo;</div>
            <p className="text-sm italic leading-relaxed mb-3" style={{color:"rgba(255,255,255,0.65)"}}>
              &ldquo;AWS Pulse saved us from a production outage.&rdquo;
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{background:"linear-gradient(135deg,#FF9900,#7C3AED)"}}>AK</div>
                <div>
                  <p className="text-xs font-semibold text-white">Arjun Kumar</p>
                  <p className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>Lead DevOps, Flipkart</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i=><span key={i} className="text-yellow-400 text-sm">★</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER — 3D orb as true full-screen background, centered */}
        <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border border-purple-500/40 border-t-purple-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-orange-500/40 border-b-orange-400 animate-spin" style={{animationDirection:"reverse"}} />
              </div>
            </div>
          }>
            <div className="pointer-events-auto w-full h-full">
              <CenterOrb />
            </div>
          </Suspense>
        </div>

        {/* RIGHT — Login card — fixed to right side */}
        <div className={`ml-auto w-full lg:w-[460px] lg:mr-10 xl:mr-14 relative z-20 transition-all duration-1000 delay-150 ${mounted?"opacity-100 translate-x-0":"opacity-0 translate-x-8"}`}>
          <div className="w-full">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-black text-white">AWS <span style={{color:"#FF9900"}}>Pulse</span></span>
            </div>

            {/* Glass card */}
            <div className="relative">
              {/* Animated border glow */}
              <div className="absolute -inset-px rounded-2xl"
                style={{background:"linear-gradient(135deg,rgba(255,153,0,0.35),rgba(124,58,237,0.35),rgba(59,130,246,0.2))", filter:"blur(0.5px)"}} />

              <div className="relative rounded-2xl p-7"
                style={{background:"rgba(7,5,26,0.88)", backdropFilter:"blur(32px)", border:"1px solid rgba(255,255,255,0.07)"}}>

                <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
                <p className="text-sm mb-7" style={{color:"rgba(255,255,255,0.4)"}}>
                  Sign in to continue to AWS Pulse
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                      style={{color:"rgba(255,255,255,0.4)"}}>Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm select-none"
                        style={{color:"rgba(255,255,255,0.3)"}}>✉</span>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                        style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)"}}
                        onFocus={e=>{e.target.style.borderColor="rgba(124,58,237,0.65)"; e.target.style.background="rgba(124,58,237,0.06)";}}
                        onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.09)"; e.target.style.background="rgba(255,255,255,0.05)";}}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                      style={{color:"rgba(255,255,255,0.4)"}}>Password</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm select-none"
                        style={{color:"rgba(255,255,255,0.3)"}}>🔒</span>
                      <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                        style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)"}}
                        onFocus={e=>{e.target.style.borderColor="rgba(124,58,237,0.65)"; e.target.style.background="rgba(124,58,237,0.06)";}}
                        onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.09)"; e.target.style.background="rgba(255,255,255,0.05)";}}
                      />
                      <button type="button" onClick={()=>setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors"
                        style={{color:"rgba(255,255,255,0.3)"}}>
                        {showPw?"🙈":"👁️"}
                      </button>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Link href="#" className="text-xs font-medium" style={{color:"#A78BFA"}}>
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {/* CTA */}
                  <button type="submit" disabled={loading}
                    className="relative w-full py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 mt-1"
                    style={{background:"linear-gradient(135deg,#FF9900 0%,#c97a00 45%,#7C3AED 100%)"}}>
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                      style={{background:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.12) 50%,transparent 65%)"}} />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</>
                        : "Sign In to AWS Pulse →"}
                    </span>
                  </button>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                      <span className="text-red-400 text-xs">⚠️ {error}</span>
                      {error.includes("Account not found") && (
                        <Link href="/register" className="text-xs font-semibold text-accent-orange hover:underline whitespace-nowrap">
                          Register →
                        </Link>
                      )}
                    </div>
                  )}
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{background:"rgba(255,255,255,0.07)"}} />
                  <span className="text-xs" style={{color:"rgba(255,255,255,0.3)"}}>or continue with</span>
                  <div className="flex-1 h-px" style={{background:"rgba(255,255,255,0.07)"}} />
                </div>

                {/* Google */}
                <button className="w-full py-3 rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-white/70 hover:text-white transition-all hover:scale-[1.01]"
                  style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)"}}>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center text-sm mt-5" style={{color:"rgba(255,255,255,0.35)"}}>
                  New to AWS Pulse?{" "}
                  <Link href="/register" className="font-semibold" style={{color:"#A78BFA"}}>
                    Create Account
                  </Link>
                </p>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-5 mt-5 pt-5"
                  style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                  {["🔒 SOC 2","🛡️ GDPR","⚡ 99.9%"].map(b=>(
                    <span key={b} className="text-[10px] font-medium" style={{color:"rgba(255,255,255,0.22)"}}>{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="relative z-20 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-5 text-xs" style={{color:"rgba(255,255,255,0.22)"}}>
          <span>© 2024 AWS Pulse. All rights reserved.</span>
          <Link href="#" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white/50 transition-colors">Terms of Service</Link>
        </div>
        {/* Dark mode toggle */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)"}}>
          <span className="text-sm">☀️</span>
          <div className="w-8 h-4 rounded-full relative mx-1" style={{background:"rgba(124,58,237,0.7)"}}>
            <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-sm">🌙</span>
        </div>
      </div>

      {/* ── Scroll hint ── */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2 opacity-25">
        <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{border:"1px solid rgba(255,255,255,0.4)"}}>
          <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
        </div>
        <span className="text-[10px] text-white/50 tracking-widest uppercase">Scroll to explore</span>
      </div>
    </div>
  );
}

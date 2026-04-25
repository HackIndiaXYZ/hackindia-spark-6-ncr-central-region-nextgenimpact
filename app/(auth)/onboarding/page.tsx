"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/userStore";

const ROLES = [
  {
    id: "devops",
    icon: "⚙️",
    title: "DevOps Engineer",
    subtitle: "Infrastructure & Pipeline",
    tags: ["ECS", "EKS", "CI/CD", "CloudWatch", "CodePipeline"],
    color: "green",
    border: "border-green-500",
    bg: "bg-green-500/5",
    tagStyle: "bg-green-500/10 text-green-400 border-green-500/20",
    desc: "Container orchestration, CI/CD pipelines, infrastructure automation",
  },
  {
    id: "developer",
    icon: "💻",
    title: "Developer",
    subtitle: "Build & Deploy",
    tags: ["Lambda", "APIs", "SDKs", "DynamoDB", "Cognito"],
    color: "orange",
    border: "border-accent-orange",
    bg: "bg-orange-500/5",
    tagStyle: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    desc: "Serverless, APIs, SDKs, application development",
  },
  {
    id: "architect",
    icon: "🏗️",
    title: "Solution Architect",
    subtitle: "Architecture & Design",
    tags: ["VPC", "CloudFront", "Pricing", "Well-Arch", "Route53"],
    color: "blue",
    border: "border-blue-500",
    bg: "bg-blue-500/5",
    tagStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "System design, networking, cost optimization, best practices",
  },
  {
    id: "data-engineer",
    icon: "📊",
    title: "Data Engineer",
    subtitle: "Data & Analytics",
    tags: ["Redshift", "Glue", "Athena", "Kinesis", "EMR"],
    color: "purple",
    border: "border-purple-500",
    bg: "bg-purple-500/5",
    tagStyle: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    desc: "Data pipelines, warehousing, analytics, lake formation",
  },
  {
    id: "sre",
    icon: "🔧",
    title: "SRE",
    subtitle: "Site Reliability Engineering",
    tags: ["CloudWatch", "X-Ray", "Auto Scaling", "Incident Manager"],
    color: "cyan",
    border: "border-cyan-500",
    bg: "bg-cyan-500/5",
    tagStyle: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    desc: "Reliability, observability, incident response, SLOs",
  },
  {
    id: "ml-engineer",
    icon: "🤖",
    title: "ML Engineer",
    subtitle: "Machine Learning & AI",
    tags: ["SageMaker", "Bedrock", "Rekognition", "Comprehend"],
    color: "pink",
    border: "border-pink-500",
    bg: "bg-pink-500/5",
    tagStyle: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    desc: "Model training, inference, generative AI, MLOps",
  },
  {
    id: "security-engineer",
    icon: "🛡️",
    title: "Security Engineer",
    subtitle: "Cloud Security",
    tags: ["IAM", "GuardDuty", "WAF", "KMS", "Security Hub"],
    color: "red",
    border: "border-red-500",
    bg: "bg-red-500/5",
    tagStyle: "bg-red-500/10 text-red-400 border-red-500/20",
    desc: "IAM, threat detection, compliance, encryption",
  },
  {
    id: "finops",
    icon: "💰",
    title: "FinOps Engineer",
    subtitle: "Cloud Cost Optimization",
    tags: ["Cost Explorer", "Savings Plans", "Budgets", "Pricing"],
    color: "yellow",
    border: "border-yellow-500",
    bg: "bg-yellow-500/5",
    tagStyle: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    desc: "Cost management, savings plans, budget alerts, optimization",
  },
];

// Map role id → Role type used in data.ts
const ROLE_MAP: Record<string, string> = {
  devops: "DevOps",
  developer: "Developer",
  architect: "Architect",
  "data-engineer": "Data Engineer",
  sre: "SRE",
  "ml-engineer": "ML Engineer",
  "security-engineer": "Security Engineer",
  finops: "FinOps",
};

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) return;
    const roleName = ROLE_MAP[selected];
    localStorage.setItem("aws_pulse_role", roleName);
    updateUser({ role: roleName });
    router.push("/onboarding/language");
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Step 1 of 2</span>
            <span className="text-xs text-text-secondary">50% complete</span>
          </div>
          <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-accent-orange rounded-full transition-all" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">⚡</span>
            <span className="text-xl font-bold text-text-primary">AWS Pulse</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">What&apos;s your role?</h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            We&apos;ll filter AWS updates to show only what matters for your work. You can always search for everything else.
          </p>
        </div>

        {/* Role cards — 4 column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${isSelected ? `${role.border} ${role.bg}` : "border-border bg-bg-card hover:bg-bg-hover"}
                  hover:scale-[1.02] active:scale-[0.99]`}
                aria-pressed={isSelected}
                aria-label={`Select ${role.title}`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-accent-orange rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="text-2xl mb-2">{role.icon}</div>
                <h3 className="text-sm font-bold text-text-primary mb-0.5">{role.title}</h3>
                <p className="text-xs text-text-secondary mb-2">{role.subtitle}</p>
                <p className="text-xs text-text-secondary/70 mb-3 leading-relaxed hidden sm:block">{role.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {role.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${isSelected ? role.tagStyle : "bg-bg-secondary text-text-secondary border-border"}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-bg-card border border-border mb-6">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Smart Feed:</strong> Your dashboard will show only updates relevant to your role.
            Use <strong className="text-accent-orange">Search</strong> anytime to find any AWS update regardless of your role.
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full bg-accent-orange hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

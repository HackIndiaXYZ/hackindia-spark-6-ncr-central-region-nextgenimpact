"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/userStore";

const LANGUAGES = [
  {
    id: "en",
    flag: "🇬🇧",
    name: "English",
    desc: "Plain English summaries",
    powered: "Powered by AWS Bedrock",
  },
  {
    id: "hi",
    flag: "🇮🇳",
    name: "Hindi — हिंदी",
    desc: "AWS अपडेट हिंदी में",
    powered: "Amazon Translate powered",
  },
  {
    id: "hg",
    flag: "🇮🇳",
    name: "Hinglish",
    desc: "AWS updates in mixed style",
    powered: "Best of both languages",
  },
];

export default function LanguagePage() {
  const [selected, setSelected] = useState("en");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Step 2 of 2</span>
            <span className="text-xs text-text-secondary">100% complete</span>
          </div>
          <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
            <div className="h-full w-full bg-accent-orange rounded-full transition-all" />
          </div>
        </div>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">⚡</span>
            <span className="text-xl font-bold text-text-primary">AWS Pulse</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-3">Choose your language</h1>
          <p className="text-text-secondary">AWS updates will be AI-simplified in your language.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setSelected(lang.id)}
                className={`flex-1 text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-[1.02]
                  ${isSelected ? "border-accent-orange bg-orange-500/5" : "border-border bg-bg-card hover:bg-bg-hover"}`}
                aria-pressed={isSelected}
                aria-label={`Select ${lang.name}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{lang.flag}</span>
                  {isSelected && (
                    <span className="w-5 h-5 bg-accent-orange rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                  )}
                </div>
                <h3 className="font-bold text-text-primary mb-1">{lang.name}</h3>
                <p className="text-sm text-text-secondary mb-1">{lang.desc}</p>
                <p className="text-xs text-text-secondary/60">{lang.powered}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            localStorage.setItem("aws_pulse_language", selected);
            updateUser({ language: selected });
            router.push("/dashboard");
          }}
          className="w-full bg-accent-orange hover:bg-orange-400 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20"
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
];

interface ClassifyRequest {
  title: string;
  summary: string;
  category: string;
  role: string;
}

interface ClassifyResult {
  priority: "critical" | "high" | "normal";
  reason: string;
  roleImpact: string;
  actionRequired: boolean;
}

const CLASSIFY_PROMPT = `You are an AWS expert. Classify the priority of an AWS update for a specific engineering role.

Rules:
- "critical": Requires immediate action, has a deadline, causes production outage if ignored, breaking change, deprecation with deadline, mandatory security change
- "high": Important improvement, security advisory, significant performance impact, recommended upgrade
- "normal": New feature, pricing change (positive), general announcement, optional improvement

Respond ONLY with valid JSON in this exact format:
{
  "priority": "critical" | "high" | "normal",
  "reason": "one sentence why this priority",
  "roleImpact": "one sentence how this specifically impacts the given role",
  "actionRequired": true | false
}`;

export async function POST(req: NextRequest) {
  try {
    const body: ClassifyRequest = await req.json();
    const { title, summary, category, role } = body;

    if (!title || !summary || !role) {
      return NextResponse.json({ error: "title, summary, and role are required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback to rule-based if no API key
      const result = ruleBasedClassify(title, summary, role);
      return NextResponse.json(result);
    }

    const userMessage = `AWS Update Title: ${title}
Category: ${category || "General"}
Summary: ${summary}
Engineer Role: ${role}

Classify the priority of this update for a ${role} engineer.`;

    let lastError: Error | null = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: CLASSIFY_PROMPT,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1, // Low temperature for consistent classification
          },
        });

        const result = await model.generateContent(userMessage);
        const text = result.response.text().trim();

        // Parse and validate JSON response
        const parsed: ClassifyResult = JSON.parse(text);

        if (!["critical", "high", "normal"].includes(parsed.priority)) {
          throw new Error("Invalid priority value from AI");
        }

        return NextResponse.json({
          ...parsed,
          model: modelName,
          aiPowered: true,
        });
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (!lastError.message.includes("429") && !lastError.message.includes("quota")) {
          // Not a quota error — try rule-based fallback
          break;
        }
        console.warn(`Model ${modelName} quota exceeded, trying next...`);
      }
    }

    console.warn("AI classification failed, using rule-based fallback:", lastError?.message);
    // Fallback to rule-based classification
    const fallback = ruleBasedClassify(title, summary, role);
    return NextResponse.json({ ...fallback, aiPowered: false });
  } catch (err) {
    console.error("Classify priority error:", err);
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}

// Rule-based fallback when AI is unavailable
function ruleBasedClassify(title: string, summary: string, role: string): ClassifyResult & { aiPowered: boolean } {
  const text = `${title} ${summary}`.toLowerCase();

  let priority: "critical" | "high" | "normal" = "normal";
  let reason = "General AWS update or new feature announcement.";
  let roleImpact = `This update may be relevant to ${role} workflows.`;
  let actionRequired = false;

  if (
    text.includes("deprecat") ||
    text.includes("end of support") ||
    text.includes("breaking change") ||
    text.includes("mandatory") ||
    text.includes("will be blocked") ||
    text.includes("production outage") ||
    text.includes("no longer available")
  ) {
    priority = "critical";
    reason = "Deprecation or breaking change that requires immediate action.";
    actionRequired = true;

    const roleImpacts: Record<string, string> = {
      DevOps: "Your CI/CD pipelines or container workloads may be directly affected.",
      Developer: "Your Lambda functions or SDK usage may break without migration.",
      Architect: "Your infrastructure design may need to be updated.",
      "Data Engineer": "Your data pipelines or database configurations may be impacted.",
      SRE: "Your monitoring and reliability setup may require updates.",
      "ML Engineer": "Your ML training or inference pipelines may be affected.",
      "Security Engineer": "Immediate security compliance action required.",
      FinOps: "Cost structure changes require immediate review.",
    };
    roleImpact = roleImpacts[role] || `Critical action required for ${role} engineers.`;
  } else if (
    text.includes("security") ||
    text.includes("vulnerability") ||
    text.includes("upgrade") ||
    text.includes("important") ||
    text.includes("performance") ||
    text.includes("breaking")
  ) {
    priority = "high";
    reason = "Important update with significant impact on security or performance.";
    actionRequired = false;

    roleImpact = `${role} engineers should review and plan adoption of this update.`;
  }

  return { priority, reason, roleImpact, actionRequired, aiPowered: false };
}

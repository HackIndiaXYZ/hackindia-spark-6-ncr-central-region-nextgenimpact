import { NextRequest, NextResponse } from "next/server";

// Role → keywords mapping for filtering RSS feed
const ROLE_KEYWORDS: Record<string, string[]> = {
  DevOps:             ["ECS", "EKS", "EC2", "CodePipeline", "CodeCommit", "CloudFormation", "CloudWatch", "Fargate", "CodeDeploy", "ECR", "Systems Manager", "CI/CD", "Kubernetes", "container"],
  Developer:          ["Lambda", "API Gateway", "SDK", "DynamoDB", "S3", "AppSync", "Cognito", "Amplify", "Boto3", "serverless", "function", "runtime", "Node.js", "Python", "Java"],
  Architect:          ["VPC", "CloudFront", "Route 53", "Well-Architected", "pricing", "CDN", "networking", "Transit Gateway", "Direct Connect", "architecture"],
  "Data Engineer":    ["Redshift", "Glue", "Athena", "Kinesis", "EMR", "Lake Formation", "RDS", "Aurora", "DynamoDB", "analytics", "data", "pipeline", "warehouse"],
  SRE:                ["CloudWatch", "X-Ray", "Auto Scaling", "Incident Manager", "ELB", "Route 53", "reliability", "monitoring", "observability", "alarm"],
  "ML Engineer":      ["SageMaker", "Bedrock", "Rekognition", "Comprehend", "Textract", "Forecast", "Personalize", "machine learning", "AI", "model", "inference"],
  "Security Engineer":["IAM", "GuardDuty", "Security Hub", "WAF", "Shield", "KMS", "Secrets Manager", "Inspector", "security", "compliance", "encryption", "MFA"],
  FinOps:             ["pricing", "cost", "savings", "budget", "billing", "Reserved Instances", "Spot", "discount", "optimization", "Cost Explorer"],
};

interface RSSItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  category: string;
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      || item.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const description = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]
      || item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
    const link = item.match(/<link>(.*?)<\/link>/)?.[1]
      || item.match(/<guid>(.*?)<\/guid>/)?.[1] || "";
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
    const category = item.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/)?.[1]
      || item.match(/<category>(.*?)<\/category>/)?.[1] || "General";

    // Strip HTML from description
    const cleanDesc = description.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#\d+;/g, "").trim().slice(0, 400);

    if (title) {
      items.push({
        id: link.split("/").pop() || Math.random().toString(36).slice(2),
        title: title.trim(),
        summary: cleanDesc,
        link,
        pubDate,
        category: category.trim(),
      });
    }
  }
  return items;
}

function scoreUpdate(item: RSSItem, role: string): number {
  const keywords = ROLE_KEYWORDS[role] || [];
  const text = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

function getPriority(item: RSSItem): "critical" | "high" | "normal" {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  if (text.includes("deprecat") || text.includes("end of support") || text.includes("breaking") || text.includes("mandatory") || text.includes("required") || text.includes("no longer available") || text.includes("will be blocked")) return "critical";
  if (text.includes("security") || text.includes("vulnerability") || text.includes("important") || text.includes("upgrade") || text.includes("performance")) return "high";
  return "normal";
}

interface AIClassification {
  priority: "critical" | "high" | "normal";
  reason: string;
  roleImpact: string;
  actionRequired: boolean;
  aiPowered: boolean;
}

async function getAIPriority(item: RSSItem, role: string, baseUrl: string): Promise<AIClassification | null> {
  try {
    const res = await fetch(`${baseUrl}/api/classify-priority`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title,
        summary: item.summary,
        category: item.category,
        role,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function formatDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return "Recent"; }
}

function timeAgo(pubDate: string): string {
  try {
    const diff = Date.now() - new Date(pubDate).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  } catch { return "Recently"; }
}

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") || "DevOps";
  const showAll = req.nextUrl.searchParams.get("all") === "true";
  const useAI = req.nextUrl.searchParams.get("ai") !== "false"; // AI on by default

  try {
    const res = await fetch("https://aws.amazon.com/about-aws/whats-new/recent/feed/", {
      headers: { "User-Agent": "AWS-Pulse/1.0" },
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

    const xml = await res.text();
    const items = parseRSS(xml);

    // Score items by role relevance
    const scored = items.map((item) => ({
      ...item,
      score: scoreUpdate(item, role),
      priority: getPriority(item), // rule-based as default
      date: formatDate(item.pubDate),
      timeAgo: timeAgo(item.pubDate),
      aiPowered: false,
      roleImpact: "",
      aiReason: "",
    }));

    // Sort by score desc, then by date
    scored.sort((a, b) => b.score - a.score || new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Filter: show all or only relevant (score > 0)
    const filtered = showAll ? scored : scored.filter((i) => i.score > 0 || i.priority === "critical");
    const topItems = filtered.slice(0, 30);

    // AI classification for top 10 most relevant items (to save quota)
    if (useAI && process.env.GEMINI_API_KEY) {
      const baseUrl = req.nextUrl.origin;
      const top10 = topItems.slice(0, 10);

      // Run AI classification in parallel for top items
      const aiResults = await Promise.allSettled(
        top10.map((item) => getAIPriority(item, role, baseUrl))
      );

      aiResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          const ai = result.value;
          top10[index].priority = ai.priority;
          top10[index].aiPowered = ai.aiPowered;
          top10[index].roleImpact = ai.roleImpact;
          top10[index].aiReason = ai.reason;
          // Set actionRequired if AI says so
          if (ai.actionRequired && !top10[index].actionRequired) {
            (top10[index] as Record<string, unknown>).actionRequired = ai.roleImpact;
          }
        }
      });
    }

    // Re-sort after AI classification — critical items bubble up
    topItems.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.score - a.score;
    });

    return NextResponse.json({
      updates: topItems,
      total: items.length,
      role,
      aiClassified: useAI,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("RSS fetch error:", err);
    // Return empty — dashboard will fall back to static data
    return NextResponse.json({ updates: [], total: 0, role, error: "RSS unavailable" }, { status: 200 });
  }
}

import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// =============================================================================
// CONFIGURATION & SETUP
// =============================================================================

const PROJECT_ROOT = process.cwd();
const envLocalPath = path.join(PROJECT_ROOT, ".env.local");
const envPath = path.join(PROJECT_ROOT, ".env");

// Load environment variables
if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}

const ROUTES_FILE = path.join(PROJECT_ROOT, "scripts", "routes.txt");
const CONTENT_DIR = path.join(PROJECT_ROOT, "content");
const EXA_API_KEY = process.env.EXA_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const EXA_API_BASE = "https://api.exa.ai/research/v1";

if (!EXA_API_KEY) {
  console.error("Error: EXA_API_KEY environment variable is not set");
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is not set");
  process.exit(1);
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface ResearchTask {
  researchId: string;
  status: "pending" | "running" | "completed" | "canceled" | "failed";
  model: string;
  instructions: string;
}

interface ResearchResult {
  researchId: string;
  status: string;
  output?: string | any;
  createdAt: number;
  completedAt?: number;
}

// Route extracted from research
const RouteSchema = z.object({
  name: z.string().describe("The route name"),
  grade: z.string().describe("The climbing grade (e.g., 5.10a, V4)"),
  style: z.enum(["Trad", "Sport", "Boulder"]).describe("Climbing style"),
  wall: z.string().describe("The wall or crag name"),
  mpLink: z.string().url().describe("Mountain Project URL"),
});

type Route = z.infer<typeof RouteSchema>;

// Route with validation status
interface ValidatedRoute extends Route {
  isValid: boolean;
}

// Categories for curation
type CategoryName =
  | "beginner"
  | "intermediate"
  | "hard"
  | "classic"
  | "epic"
  | "boulders";

const CuratedRoutesSchema = z.object({
  beginner: z.array(RouteSchema).describe("Beginner routes (5.6-5.9)"),
  intermediate: z
    .array(RouteSchema)
    .describe("Intermediate routes (5.10-5.11)"),
  hard: z.array(RouteSchema).describe("Hard routes (5.12+)"),
  classic: z.array(RouteSchema).describe("Classic/Iconic routes"),
  epic: z.array(RouteSchema).describe("Epic/Long multi-pitch routes"),
  boulders: z.array(RouteSchema).describe("Best boulder problems"),
});

type CuratedRoutes = z.infer<typeof CuratedRoutesSchema>;

// Budget configuration
const CATEGORY_BUDGETS = {
  beginner: { min: 6, max: 10 },
  intermediate: { min: 8, max: 12 },
  hard: { min: 6, max: 10 },
  classic: { min: 8, max: 12 }, // Must be highest or tied
  epic: { min: 0, max: 8 }, // Optional
  boulders: { min: 0, max: 8 }, // Optional
};

const TOTAL_ROUTE_TARGET = { min: 30, max: 45, absoluteMax: 50 };

// =============================================================================
// FILE OPERATIONS
// =============================================================================

function getNextArea(): string | null {
  try {
    const content = fs.readFileSync(ROUTES_FILE, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("x ")) {
        return trimmed;
      }
    }
    return null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`Error: ${ROUTES_FILE} not found`);
    }
    throw error;
  }
}

function markAreaAsDone(areaName: string): void {
  try {
    const content = fs.readFileSync(ROUTES_FILE, "utf-8");
    const lines = content.split("\n");
    let found = false;

    const updatedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed === areaName && !trimmed.startsWith("x ")) {
        found = true;
        return `x ${trimmed}`;
      }
      return line;
    });

    if (!found) {
      console.warn(`⚠ Warning: Could not find "${areaName}" to mark as done`);
      return;
    }

    fs.writeFileSync(ROUTES_FILE, updatedLines.join("\n"), "utf-8");
    console.log(`✓ Marked "${areaName}" as done`);
  } catch (error) {
    console.error(`Error marking area as done:`, error);
    throw error;
  }
}

function areaNameToFilename(areaName: string): string {
  return areaName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

function generateFrontmatter(areaName: string): string {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const areaNameLower = areaName.toLowerCase();
  const tags = ["area", areaNameLower, "trad", "sport", "bouldering"];

  return `---
title: "${areaName} Climbing Guide"
description: "A curated route guide to ${areaName}."
date: "${dateStr}"
tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]
published: true
---`;
}

function writeMDXFile(areaName: string, articleContent: string): void {
  const filename = `${areaNameToFilename(areaName)}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);
  const frontmatter = generateFrontmatter(areaName);
  const content = `${frontmatter}\n\n${articleContent}`;

  fs.writeFileSync(filepath, content, "utf-8");
  console.log(`✓ Created MDX file: ${filename}`);
}

// =============================================================================
// EXA RESEARCH API
// =============================================================================

async function createResearchTask(areaName: string): Promise<string> {
  // Add Utah context if not present
  const searchName = areaName.toLowerCase().includes("utah")
    ? areaName
    : `${areaName}, Utah`;

  const instructions = `Research the climbing area "${searchName}" in Utah, USA. I need at least 50-60 climbing routes with their complete details from Mountain Project.

CRITICAL INSTRUCTIONS:
1. Search specifically on mountainproject.com for "${searchName}"
2. Only include routes that have REAL, VERIFIED Mountain Project URLs
3. Do NOT make up or guess URLs - only use URLs you find on Mountain Project
4. Every URL must follow the format: https://www.mountainproject.com/route/[number]/[route-name]

For each route, provide:
- Route name (EXACT name as listed on Mountain Project - do not paraphrase)
- Grade (YDS for ropes: 5.8, 5.10a, 5.12b; V-scale for boulders: V0, V4, V8)
- Style (Trad, Sport, or Boulder)
- Wall/Crag name where the route is located
- Direct Mountain Project URL (copy the exact URL from the route page)

Coverage requirements - find routes in ALL categories:
- Beginner routes (5.6-5.9 or V0-V2): at least 10 routes
- Intermediate routes (5.10-5.11 or V3-V6): at least 15 routes  
- Hard routes (5.12+ or V7+): at least 10 routes
- Classic/iconic routes of any grade: at least 10 routes
- Multi-pitch/epic routes if they exist
- Boulder problems if bouldering exists in the area

IMPORTANT: This is a Utah climbing area. Search for:
- "mountainproject.com ${searchName}"
- Browse the Utah > [specific area] section on Mountain Project
- Look for popular/classic routes with high star ratings

Only include routes with URLs you have actually verified exist on Mountain Project.
I need 50+ routes total with real, working Mountain Project links.`;

  const response = await fetch(EXA_API_BASE, {
    method: "POST",
    headers: {
      "x-api-key": EXA_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instructions,
      model: "exa-research",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create research task: ${response.status} ${errorText}`
    );
  }

  const task: ResearchTask = await response.json();
  console.log(`✓ Created research task: ${task.researchId}`);
  return task.researchId;
}

async function pollResearchTask(researchId: string): Promise<ResearchResult> {
  const maxAttempts = 120;
  const pollInterval = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${EXA_API_BASE}/${researchId}`, {
      method: "GET",
      headers: { "x-api-key": EXA_API_KEY! },
    });

    if (!response.ok) {
      throw new Error(`Failed to get research task: ${response.status}`);
    }

    const result: ResearchResult = await response.json();

    if (result.status === "completed") {
      console.log(`✓ Research completed after ${(attempt + 1) * 5} seconds`);
      return result;
    } else if (result.status === "failed" || result.status === "canceled") {
      throw new Error(`Research task ${result.status}`);
    }

    process.stdout.write(
      `\r⏳ Research in progress... (${attempt + 1}/${maxAttempts})`
    );
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error("Research task timed out");
}

async function getResearchContent(researchId: string): Promise<string> {
  const result = await pollResearchTask(researchId);

  if (!result.output) {
    throw new Error("Research completed but no output found");
  }

  if (typeof result.output === "string") {
    return result.output;
  } else if (typeof result.output === "object") {
    const obj = result.output as any;
    return (
      obj.markdown || obj.text || obj.content || JSON.stringify(obj, null, 2)
    );
  }
  return String(result.output);
}

// =============================================================================
// PASS 1: ROUTE EXTRACTION
// =============================================================================

async function extractRoutesFromResearch(
  areaName: string,
  researchContent: string
): Promise<Route[]> {
  console.log("\n🔍 Pass 1: Extracting routes from research...");

  const prompt = `You are extracting climbing route information from research about "${areaName}".

Research content:
${researchContent}

Extract ALL climbing routes mentioned in this research. Be thorough and extract as many routes as possible - aim for at least 50-60 routes if available.

For each route, provide:
- name: The exact route name
- grade: The climbing grade (e.g., "5.10a", "5.12c", "V4")
- style: Either "Trad", "Sport", or "Boulder"
- wall: The wall, crag, or area name where the route is located
- mpLink: The Mountain Project URL (must be https://www.mountainproject.com/route/...)

IMPORTANT:
- Extract EVERY route mentioned in the research, even if it seems less important
- Only include routes with valid Mountain Project URLs that appear in the research
- Do not invent or guess URLs - only use URLs that appear in the research
- If a route doesn't have a valid MP link, skip it
- Include routes of ALL grades from beginner to expert
- Include both roped climbs and boulders if present
- Be comprehensive - extract routes from all sections, all categories, all mentions

Return a JSON object with this exact structure:
{
  "routes": [
    {
      "name": "Route Name",
      "grade": "5.10a",
      "style": "Sport",
      "wall": "Wall Name",
      "mpLink": "https://www.mountainproject.com/route/..."
    }
  ]
}

Return ONLY valid JSON, no markdown, no explanations.`;

  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt,
      maxTokens: 4000,
    });

    // Parse JSON from response (may have markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```")) {
      // Extract JSON from markdown code block
      const match = jsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match) {
        jsonText = match[1];
      }
    }

    const parsed = JSON.parse(jsonText);
    const ExtractedRoutesSchema = z.object({
      routes: z.array(RouteSchema),
    });

    const validated = ExtractedRoutesSchema.parse(parsed);
    console.log(
      `  ✓ Extracted ${validated.routes.length} routes from research`
    );
    return validated.routes;
  } catch (error) {
    console.error("  ✗ Failed to extract routes:", error);
    if (error instanceof Error) {
      console.error(`    Error details: ${error.message}`);
    }
    return [];
  }
}

// =============================================================================
// LINK VALIDATION
// =============================================================================

async function validateRouteLinks(routes: Route[]): Promise<ValidatedRoute[]> {
  console.log("\n🔗 Validating Mountain Project links...");
  console.log(`  Checking ${routes.length} routes (content-based validation)...`);

  const validatedRoutes: ValidatedRoute[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (const route of routes) {
    try {
      // Use GET request and check page content for validity
      const response = await fetch(route.mpLink, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        validatedRoutes.push({ ...route, isValid: false });
        invalidCount++;
        continue;
      }

      const html = await response.text();

      // Check for indicators that the route doesn't exist
      // Mountain Project shows these messages for invalid routes
      const isInvalid =
        html.includes("Route not found") ||
        html.includes("Page Not Found") ||
        html.includes("This page doesn't exist") ||
        html.includes("404") ||
        html.includes("We couldn't find") ||
        !html.includes("mountainproject.com");

      // Also check for positive indicators that it IS a valid route page
      const hasRouteContent =
        html.includes("route-type") ||
        html.includes("route-stats") ||
        html.includes("YDS") ||
        html.includes("fa-star") ||
        html.includes("Rating:");

      const isValid = !isInvalid && hasRouteContent;
      validatedRoutes.push({ ...route, isValid });

      if (isValid) {
        validCount++;
        process.stdout.write(".");
      } else {
        invalidCount++;
        process.stdout.write("x");
      }
    } catch {
      validatedRoutes.push({ ...route, isValid: false });
      invalidCount++;
      process.stdout.write("x");
    }

    // Slightly longer delay for GET requests
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(""); // New line after dots
  console.log(`  ✓ ${validCount} valid, ${invalidCount} invalid`);

  // Return only valid routes
  const validRoutes = validatedRoutes.filter((r) => r.isValid);
  console.log(`  ✓ ${validRoutes.length} routes passed validation`);

  return validRoutes;
}

// =============================================================================
// PASS 2: CURATION & BUDGETING
// =============================================================================

async function curateAndBudgetRoutes(
  areaName: string,
  validatedRoutes: ValidatedRoute[]
): Promise<CuratedRoutes> {
  console.log("\n📊 Pass 2: Curating and budgeting routes...");

  const routesJson = JSON.stringify(
    validatedRoutes.map(({ isValid, ...r }) => r),
    null,
    2
  );

  const prompt = `You are curating climbing routes for "${areaName}" for the RockClimbUtah website.

Available validated routes:
${routesJson}

TASK: Assign these routes to categories following these STRICT rules:

DETERMINE AREA TYPE FIRST:
- If most routes are V-scale (bouldering), use boulder categories
- If most routes are YDS (5.x), use roped climbing categories
- Mixed areas should use both as appropriate

CATEGORY BUDGETS - ROPED CLIMBING (if area has YDS grades):
- beginner (5.6-5.9): MINIMUM 6 routes, target 8-10 routes
- intermediate (5.10-5.11): MINIMUM 8 routes, target 10-12 routes  
- hard (5.12+): MINIMUM 6 routes, target 8-10 routes
- classic (must-do routes of any grade): MINIMUM 8 routes, target 10-12 routes (MUST be highest or tied for highest)
- epic (multi-pitch/long routes): 0-8 routes (only if area has them)

CATEGORY BUDGETS - BOULDERING (if area has V-scale grades):
- beginner (V0-V2): MINIMUM 6 routes, target 8-10 routes
- intermediate (V3-V6): MINIMUM 8 routes, target 10-12 routes
- hard (V7+): MINIMUM 6 routes, target 8-10 routes
- classic (must-do problems of any grade): MINIMUM 8 routes, target 10-12 routes (MUST be highest or tied for highest)
- boulders: Use this category name instead of "beginner/intermediate/hard" if the area is primarily bouldering

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. TOTAL routes: MUST be between 30-45 routes (target 35-40). If you have fewer than 30 routes, you MUST include more routes from the available list to reach at least 30.
2. Each route appears in EXACTLY ONE category - NO DUPLICATES
3. The "classic" category MUST have the most routes (or tie for most) - minimum 8 routes
4. Fill budgets aggressively - aim for the HIGH end of each range
5. Spread routes across different walls/crags - avoid clustering
6. Include variety of styles (slab, steep, crack, face, etc.)
7. Only include categories relevant to this area

DECISION FRAMEWORK:
- If a route is both classic AND beginner, put it in "classic"
- If a route is both classic AND hard, put it in "classic"
- Prioritize: classic > grade-based categories > discipline-specific
- If you have fewer than 30 routes total, you MUST select more routes from the available list, even if they're slightly less ideal

IMPORTANT: You have ${validatedRoutes.length} validated routes available. You MUST select at least 30 routes total, ideally 35-40. Do not be conservative - fill the budgets! If you have ${validatedRoutes.length} or more routes available, use them!

Return routes organized by category. Empty categories should have empty arrays.

Return a JSON object with this exact structure:
{
  "beginner": [...],
  "intermediate": [...],
  "hard": [...],
  "classic": [...],
  "epic": [...],
  "boulders": [...]
}

Each route object should have: name, grade, style, wall, mpLink.
Return ONLY valid JSON, no markdown, no explanations.`;

  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt,
      maxTokens: 4000,
    });

    // Parse JSON from response (may have markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```")) {
      // Extract JSON from markdown code block
      const match = jsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match) {
        jsonText = match[1];
      }
    }

    const parsed = JSON.parse(jsonText);
    const curated = CuratedRoutesSchema.parse(parsed);

    // Log category counts
    const counts = {
      beginner: curated.beginner.length,
      intermediate: curated.intermediate.length,
      hard: curated.hard.length,
      classic: curated.classic.length,
      epic: curated.epic.length,
      boulders: curated.boulders.length,
    };
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    console.log(`  ✓ Curated ${total} routes across categories:`);
    console.log(`    Beginner: ${counts.beginner}`);
    console.log(`    Intermediate: ${counts.intermediate}`);
    console.log(`    Hard: ${counts.hard}`);
    console.log(`    Classic: ${counts.classic}`);
    console.log(`    Epic: ${counts.epic}`);
    console.log(`    Boulders: ${counts.boulders}`);

    // Validate route count
    if (total < 30 && validatedRoutes.length >= 30) {
      // Only retry if we have enough routes available but didn't select enough
      console.warn(
        `  ⚠ Warning: Only ${total} routes selected, but target is 30-45.`
      );
      console.warn(
        `    Available routes: ${validatedRoutes.length}. Retrying with stricter enforcement...`
      );

      try {
        // Retry with more aggressive prompt
        const retryPrompt = `You are curating climbing routes for "${areaName}" for the RockClimbUtah website.

Available validated routes (${validatedRoutes.length} total):
${routesJson}

CRITICAL: You MUST select at least 30 routes, ideally 35-40 routes. You previously selected only ${total} routes, which is insufficient.

TASK: Assign routes to categories with these MINIMUM counts:
- beginner: MINIMUM 6 routes (target 8-10)
- intermediate: MINIMUM 8 routes (target 10-12)
- hard: MINIMUM 6 routes (target 8-10)
- classic: MINIMUM 8 routes (target 10-12) - MUST be highest or tied
- epic: 0-8 routes (if applicable)
- boulders: 0-8 routes (if applicable)

You MUST select at least 30 routes total. Be more aggressive in selecting routes - include routes even if they're slightly less ideal. Fill the budgets!

Return a JSON object with this exact structure (NO explanations, NO text, ONLY JSON):
{
  "beginner": [...],
  "intermediate": [...],
  "hard": [...],
  "classic": [...],
  "epic": [...],
  "boulders": [...]
}

Each route object must have: name, grade, style, wall, mpLink.
Return ONLY valid JSON, nothing else.`;

        const retryResult = await generateText({
          model: anthropic("claude-sonnet-4-20250514"),
          prompt: retryPrompt,
          maxTokens: 4000,
        });

        let retryJsonText = retryResult.text.trim();
        if (retryJsonText.startsWith("```")) {
          const match = retryJsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
          if (match) {
            retryJsonText = match[1];
          }
        }

        const retryParsed = JSON.parse(retryJsonText);
        const retryCurated = CuratedRoutesSchema.parse(retryParsed);

        const retryCounts = {
          beginner: retryCurated.beginner.length,
          intermediate: retryCurated.intermediate.length,
          hard: retryCurated.hard.length,
          classic: retryCurated.classic.length,
          epic: retryCurated.epic.length,
          boulders: retryCurated.boulders.length,
        };
        const retryTotal = Object.values(retryCounts).reduce(
          (a, b) => a + b,
          0
        );

        console.log(`  ✓ Retry curated ${retryTotal} routes:`);
        console.log(`    Beginner: ${retryCounts.beginner}`);
        console.log(`    Intermediate: ${retryCounts.intermediate}`);
        console.log(`    Hard: ${retryCounts.hard}`);
        console.log(`    Classic: ${retryCounts.classic}`);
        console.log(`    Epic: ${retryCounts.epic}`);
        console.log(`    Boulders: ${retryCounts.boulders}`);

        if (retryTotal >= 30) {
          return retryCurated;
        } else {
          console.warn(
            `  ⚠ Retry still only produced ${retryTotal} routes. Proceeding with original selection.`
          );
        }
      } catch (retryError) {
        console.warn(
          `  ⚠ Retry failed: ${
            retryError instanceof Error ? retryError.message : retryError
          }`
        );
        console.warn(`    Proceeding with original ${total} routes.`);
      }
    } else if (total < 30) {
      // Not enough routes available from research
      console.warn(
        `  ⚠ Warning: Only ${total} routes available (${validatedRoutes.length} validated).`
      );
      console.warn(
        `    This is fewer than the 30-45 target, but proceeding with available routes.`
      );
      console.warn(
        `    The Exa research did not return enough routes for this area.`
      );
    }

    return curated;
  } catch (error) {
    console.error("  ✗ Failed to curate routes:", error);
    throw error;
  }
}

// =============================================================================
// PASS 3: ARTICLE WRITING
// =============================================================================

async function writeArticle(
  areaName: string,
  curatedRoutes: CuratedRoutes
): Promise<string> {
  console.log("\n✍️ Pass 3: Writing article...");

  const routesJson = JSON.stringify(curatedRoutes, null, 2);

  const prompt = `You are writing a climbing guide for "${areaName}" for the RockClimbUtah website.

Curated routes by category:
${routesJson}

Write the article following this EXACT structure and voice:

STRUCTURE:
1. H1: "${areaName} Climbing Guide"
2. Area intro (2-3 sentences): What kind of climbing, why people go there, any critical access notes. Climber-to-climber tone.
3. Route categories (only include categories that have routes):
   - Each starts with H2 heading (e.g., "## Beginner Routes (5.6–5.9)")
   - A short intro paragraph for each category (what kind of session it supports)
   - "### Routes" subheading
   - Bulleted list of routes

ROUTE FORMAT (EXACT - no variations):
- **Route Name** (Grade, Style, Wall/Crag)
  [View on Mountain Project →](link)

VOICE & TONE:
- Sounds like a climber talking to another climber
- Confident, practical, lightly "send it" but still responsible
- Beginner-to-intermediate perspective
- Clear > clever, useful > impressive
- NO per-route descriptions, NO beta, NO disclaimers

FORMATTING:
- Use "---" horizontal rules between major sections
- H2 for category names
- H3 for "### Routes" subheadings
- Bullet points for routes
- Two spaces after route name line, then MP link on next line

DO NOT:
- Include frontmatter
- Add route descriptions or beta
- Copy Mountain Project descriptions
- Include routes not in the provided data

Return ONLY the markdown content starting with the H1 heading.`;

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    prompt,
    maxTokens: 6000,
  });

  console.log("  ✓ Article draft complete");
  return text;
}

// =============================================================================
// PASS 4: REVIEW & FIX
// =============================================================================

async function reviewAndFixArticle(
  areaName: string,
  article: string,
  curatedRoutes: CuratedRoutes
): Promise<string> {
  console.log("\n🔍 Pass 4: Reviewing article against spec...");

  const routesJson = JSON.stringify(curatedRoutes, null, 2);

  const prompt = `You are reviewing a climbing guide article for "${areaName}" against the RockClimbUtah Content Creation Spec.

ARTICLE TO REVIEW:
${article}

CURATED ROUTES DATA:
${routesJson}

CHECK FOR THESE VIOLATIONS AND FIX THEM:

1. ROUTE COUNT: Total MUST be between 30-45 routes (target 35-40). 
   - If under 30: This is CRITICAL - you MUST add more routes from the curatedRoutes data to reach at least 30 routes
   - If over 50: Remove the least essential routes to get under 50
   - Count all routes in all categories and ensure the total is 30-45

2. CLASSIC RULE: The "Classic" category must have the most routes (or tie for most), with minimum 8 routes. If not, move routes to classic or add more classic routes.

3. NO DUPLICATES: Each route should appear exactly once. Remove any duplicates.

4. FORMAT CHECK: Each route must follow EXACTLY:
   - **Route Name** (Grade, Style, Wall/Crag)
     [View on Mountain Project →](link)
   
   Fix any that have descriptions, beta, or wrong format.

5. NO BETA/DESCRIPTIONS: Remove any per-route descriptions or beta.

6. TONE CHECK: Should sound like a climber talking to another climber. Fix any overly formal or marketing-speak language.

7. STRUCTURE CHECK:
   - H1 with area name
   - Area intro (2-3 sentences)
   - Categories with H2 headings
   - "### Routes" subheading in each category
   - Horizontal rules between sections

8. LINK FORMAT: All links should be "[View on Mountain Project →](url)"

If the article passes all checks, return it unchanged.
If violations are found, fix them and return the corrected article.

Return ONLY the final article markdown (no explanations, no frontmatter).`;

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    prompt,
    maxTokens: 6000,
  });

  console.log("  ✓ Review complete");
  return text;
}

// =============================================================================
// PROCESS SINGLE AREA
// =============================================================================

async function processArea(areaName: string): Promise<boolean> {
  try {
    console.log(`📍 Processing: ${areaName}\n`);

    // Step 1: Exa Research
    console.log("📡 Starting Exa research...");
    const researchId = await createResearchTask(areaName);
    const researchContent = await getResearchContent(researchId);
    console.log("");

    // Step 2: Pass 1 - Extract routes
    const extractedRoutes = await extractRoutesFromResearch(
      areaName,
      researchContent
    );

    if (extractedRoutes.length === 0) {
      throw new Error("No routes extracted from research");
    }

    // Step 3: Validate links
    const validatedRoutes = await validateRouteLinks(extractedRoutes);

    if (validatedRoutes.length < 10) {
      console.warn(
        `⚠ Warning: Only ${validatedRoutes.length} valid routes found`
      );
    }

    // Step 4: Pass 2 - Curate and budget
    const curatedRoutes = await curateAndBudgetRoutes(
      areaName,
      validatedRoutes
    );

    // Step 5: Pass 3 - Write article
    const articleDraft = await writeArticle(areaName, curatedRoutes);

    // Step 6: Pass 4 - Review and fix
    const finalArticle = await reviewAndFixArticle(
      areaName,
      articleDraft,
      curatedRoutes
    );

    // Step 7: Write MDX file
    console.log("\n📝 Writing MDX file...");
    writeMDXFile(areaName, finalArticle);

    // Step 8: Mark as done
    markAreaAsDone(areaName);

    console.log(`✅ Successfully processed "${areaName}"!`);
    return true;
  } catch (error) {
    console.error(
      `\n❌ Error processing "${areaName}":`,
      error instanceof Error ? error.message : error
    );
    // Mark as done anyway to avoid infinite loop on problematic areas
    // Prefix with "x FAILED: " so it's clear it failed
    try {
      const content = fs.readFileSync(ROUTES_FILE, "utf-8");
      const lines = content.split("\n");
      const updatedLines = lines.map((line) => {
        const trimmed = line.trim();
        if (trimmed === areaName && !trimmed.startsWith("x ")) {
          return `x FAILED: ${trimmed}`;
        }
        return line;
      });
      fs.writeFileSync(ROUTES_FILE, updatedLines.join("\n"), "utf-8");
      console.log(`  Marked "${areaName}" as FAILED in routes.txt`);
    } catch {
      // Ignore errors marking as failed
    }
    return false;
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log("🧗 RockClimbUtah Content Generator\n");
  console.log("=".repeat(50));
  console.log("Processing all unprocessed areas in routes.txt...\n");

  let processed = 0;
  let failed = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Get next unprocessed area
    const areaName = getNextArea();

    if (!areaName) {
      console.log("\n" + "=".repeat(50));
      if (processed === 0 && failed === 0) {
        console.log("✓ No unprocessed areas found in routes.txt");
      } else {
        console.log("🏁 All areas processed!");
        console.log(`   ✅ Success: ${processed}`);
        if (failed > 0) {
          console.log(`   ❌ Failed: ${failed}`);
        }
      }
      break;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`[${processed + failed + 1}] Starting next area...\n`);

    const success = await processArea(areaName);

    if (success) {
      processed++;
    } else {
      failed++;
    }

    // Small delay between areas to be respectful of API rate limits
    const nextArea = getNextArea();
    if (nextArea) {
      console.log("\n⏳ Waiting 5 seconds before next area...\n");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

main();

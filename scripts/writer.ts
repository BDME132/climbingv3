import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Load environment variables from .env.local or .env
const PROJECT_ROOT = process.cwd();
const envLocalPath = path.join(PROJECT_ROOT, ".env.local");
const envPath = path.join(PROJECT_ROOT, ".env");

// Try .env.local first (Next.js convention), then fall back to .env
if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  // Still try default dotenv behavior (loads .env from project root)
  config();
}

// Use process.cwd() to get the project root, then build paths relative to it
const ROUTES_FILE = path.join(PROJECT_ROOT, "scripts", "routes.txt");
const CONTENT_DIR = path.join(PROJECT_ROOT, "content");
const EXA_API_KEY = process.env.EXA_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const EXA_API_BASE = "https://api.exa.ai/research/v1";

if (!EXA_API_KEY) {
  console.error("Error: EXA_API_KEY environment variable is not set");
  console.error("Please set EXA_API_KEY in .env.local or .env file");
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is not set");
  console.error("Please set ANTHROPIC_API_KEY in .env.local or .env file");
  process.exit(1);
}

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
  outputSchema?: any;
  createdAt: number;
  completedAt?: number;
}

/**
 * Reads routes.txt and finds the first unprocessed area (line not starting with "x ")
 */
function getNextArea(): string | null {
  try {
    const content = fs.readFileSync(ROUTES_FILE, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and lines starting with "x " (already processed)
      if (trimmed && !trimmed.startsWith("x ")) {
        return trimmed;
      }
    }

    return null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`Error: ${ROUTES_FILE} not found`);
    } else {
      console.error(`Error reading routes.txt:`, error);
    }
    throw error;
  }
}

/**
 * Marks an area as done by prefixing it with "x " in routes.txt
 */
function markAreaAsDone(areaName: string): void {
  try {
    const content = fs.readFileSync(ROUTES_FILE, "utf-8");
    const lines = content.split("\n");
    let found = false;

    const updatedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed === areaName && !trimmed.startsWith("x ")) {
        found = true;
        // Preserve original indentation/formatting, just prefix with "x "
        return line.replace(/^(\s*)(.+)$/, (match, indent, text) => {
          return text.trim() === areaName ? `${indent}x ${text.trim()}` : match;
        });
      }
      return line;
    });

    if (!found) {
      console.warn(
        `⚠ Warning: Could not find "${areaName}" in routes.txt to mark as done`
      );
      return;
    }

    fs.writeFileSync(ROUTES_FILE, updatedLines.join("\n"), "utf-8");
    console.log(`✓ Marked "${areaName}" as done in routes.txt`);
  } catch (error) {
    console.error(`Error marking area as done:`, error);
    throw error;
  }
}

/**
 * Converts area name to kebab-case filename (lowercase, no spaces)
 */
function areaNameToFilename(areaName: string): string {
  return areaName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Creates a research task using Exa Research API
 */
async function createResearchTask(areaName: string): Promise<string> {
  const instructions = `Research the climbing area "${areaName}". Provide a comprehensive climbing guide including:

1. Brief area description and location
2. Route listings organized by these categories:
   - Beginner Routes (5.6-5.9): Include route name, grade, style (trad/sport/boulder), and Mountain Project link
   - Intermediate Routes (5.10-5.11): Include route name, grade, style, and Mountain Project link
   - Expert Routes (5.12+): Include route name, grade, style, and Mountain Project link
   - Classic/Iconic Routes: Must-do routes regardless of grade, with name, grade, style, and Mountain Project link
   - Epic/Long Routes: Multi-pitch or notably long routes, with name, grade, style, and Mountain Project link
   - Best Boulders: If bouldering exists in the area, include problem name, grade (V-scale), and Mountain Project link

3. Format the output as markdown with:
   - Area name as H1 heading
   - Brief introduction paragraph (2-3 sentences)
   - Category sections with H2 headings
   - Route entries formatted as:
     - **Route Name** (Grade, Style, Location/Area)
     - [View on Mountain Project →](link)

Ensure all Mountain Project links are included. Only include categories that are relevant to this area.`;

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

/**
 * Polls the research task until completion
 */
async function pollResearchTask(researchId: string): Promise<ResearchResult> {
  const maxAttempts = 120; // 10 minutes max (120 * 5 seconds)
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${EXA_API_BASE}/${researchId}`, {
      method: "GET",
      headers: {
        "x-api-key": EXA_API_KEY!,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get research task: ${response.status} ${errorText}`
      );
    }

    const result: ResearchResult = await response.json();

    if (result.status === "completed") {
      console.log(`✓ Research completed after ${(attempt + 1) * 5} seconds`);
      return result;
    } else if (result.status === "failed" || result.status === "canceled") {
      throw new Error(`Research task ${result.status}: ${researchId}`);
    }

    // Still running or pending, wait and poll again
    if (attempt < maxAttempts - 1) {
      process.stdout.write(
        `\r⏳ Research in progress... (${attempt + 1}/${maxAttempts})`
      );
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error(
    `Research task timed out after ${
      (maxAttempts * pollInterval) / 1000
    } seconds`
  );
}

/**
 * Gets the research results (markdown output)
 */
async function getResearchResults(researchId: string): Promise<string> {
  const result = await pollResearchTask(researchId);

  if (!result.output) {
    throw new Error("Research completed but no output found");
  }

  // Handle different output formats
  let markdownContent: string;

  if (typeof result.output === "string") {
    // If output is already a string, use it directly
    markdownContent = result.output;
  } else if (typeof result.output === "object" && result.output !== null) {
    // If output is an object, try to extract markdown content
    // Check common property names for markdown content
    const outputObj = result.output as any;

    if (outputObj.markdown && typeof outputObj.markdown === "string") {
      markdownContent = outputObj.markdown;
    } else if (outputObj.text && typeof outputObj.text === "string") {
      markdownContent = outputObj.text;
    } else if (outputObj.content && typeof outputObj.content === "string") {
      markdownContent = outputObj.content;
    } else if (outputObj.result) {
      markdownContent =
        typeof outputObj.result === "string"
          ? outputObj.result
          : JSON.stringify(outputObj.result, null, 2);
    } else {
      // Debug: log the structure to help understand what we're getting
      console.log("Debug: Output object structure:", Object.keys(outputObj));
      // If no known property, try to find the first string property
      const stringProps = Object.entries(outputObj).find(
        ([_, value]) => typeof value === "string"
      );
      if (stringProps) {
        markdownContent = stringProps[1] as string;
      } else {
        // Last resort: stringify the object (shouldn't happen with Exa API)
        markdownContent = JSON.stringify(outputObj, null, 2);
        console.warn("⚠ Warning: Output is an object with unknown structure");
      }
    }
  } else {
    // Fallback: convert to string
    markdownContent = String(result.output);
  }

  return markdownContent;
}

/**
 * Generates MDX frontmatter from area name
 */
function generateFrontmatter(areaName: string): string {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const areaNameLower = areaName.toLowerCase();

  // Generate tags - include area name and common climbing types
  const tags = ["area", areaNameLower, "trad", "sport", "bouldering"];

  return `---
title: "${areaName} Climbing Guide"
description: "A curated route guide to ${areaName}."
date: "${dateStr}"
tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]
published: true
---`;
}

/**
 * Generates an article from research content using AI SDK
 */
async function generateArticleFromResearch(
  areaName: string,
  researchContent: string
): Promise<string> {
  const prompt = `Using the following research about the climbing area "${areaName}", write a comprehensive climbing guide article in markdown format.

Research content:
${researchContent}

Write a well-structured climbing guide article that includes:

1. An H1 heading with the area name and "Climbing Guide"
2. A brief introduction paragraph (2-3 sentences) describing the area's character, location, and what makes it special
3. Route listings organized by categories:
   - Beginner Routes (5.6-5.9): Include route name, grade, style (trad/sport/boulder), area/location, and Mountain Project link
   - Intermediate Routes (5.10-5.11): Include route name, grade, style, area/location, and Mountain Project link
   - Expert Routes (5.12+): Include route name, grade, style, area/location, and Mountain Project link
   - Classic/Iconic Routes: Must-do routes regardless of grade, with name, grade, style, area/location, and Mountain Project link
   - Epic/Long Routes: Multi-pitch or notably long routes, with name, grade, style, area/location, and Mountain Project link
   - Best Boulders: If bouldering exists, include problem name, grade (V-scale), and Mountain Project link

Format requirements:
- Use H2 headings for each category (e.g., "## Beginner Routes (5.6–5.9)")
- Add a brief introductory sentence or two for each category explaining what to expect
- Format routes as:
  - **Route Name** (Grade, Style, Area/Location)
  - [View on Mountain Project →](link)
- Use horizontal rules (---) to separate sections
- Only include categories that are relevant to this area
- Write in a casual, engaging tone that matches the style of climbing guides
- Ensure all Mountain Project links are included and properly formatted

Return ONLY the markdown content (no frontmatter, no explanations). Start directly with the H1 heading.`;

  console.log("🤖 Generating article with Claude Sonnet 4.5...");

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    prompt,
    maxTokens: 4000,
  });

  return text;
}

/**
 * Validates Mountain Project links and replaces invalid ones with search links
 */
async function validateMountainProjectLinks(
  content: string,
  areaName: string
): Promise<string> {
  console.log("🔗 Validating Mountain Project links...");

  // Match Mountain Project route links
  const linkRegex =
    /\[View on Mountain Project →\]\((https:\/\/www\.mountainproject\.com\/route\/[^\)]+)\)/g;
  const matches = [...content.matchAll(linkRegex)];

  if (matches.length === 0) {
    console.log("  No Mountain Project links found to validate");
    return content;
  }

  console.log(`  Found ${matches.length} links to validate...`);

  let validatedContent = content;
  let validCount = 0;
  let invalidCount = 0;

  // Process links in batches to avoid rate limiting
  for (const match of matches) {
    const fullMatch = match[0];
    const url = match[1];

    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; LinkValidator/1.0; +https://example.com)",
        },
      });

      if (response.ok) {
        validCount++;
      } else {
        // Extract route name from the link text context if possible
        const searchUrl = `https://www.mountainproject.com/search?q=${encodeURIComponent(
          areaName
        )}`;
        validatedContent = validatedContent.replace(
          fullMatch,
          `[Search on Mountain Project →](${searchUrl})`
        );
        invalidCount++;
      }
    } catch (error) {
      // Network error, replace with search link
      const searchUrl = `https://www.mountainproject.com/search?q=${encodeURIComponent(
        areaName
      )}`;
      validatedContent = validatedContent.replace(
        fullMatch,
        `[Search on Mountain Project →](${searchUrl})`
      );
      invalidCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `  ✓ ${validCount} valid, ${invalidCount} replaced with search links`
  );

  return validatedContent;
}

/**
 * Writes the MDX file to the content directory
 */
function writeMDXFile(areaName: string, articleContent: string): void {
  const filename = `${areaNameToFilename(areaName)}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);

  const frontmatter = generateFrontmatter(areaName);
  const content = `${frontmatter}\n\n${articleContent}`;

  fs.writeFileSync(filepath, content, "utf-8");
  console.log(`✓ Created MDX file: ${filename}`);
}

/**
 * Main script execution
 */
async function main() {
  try {
    console.log("🔍 Looking for next area to process...\n");

    // Step 1: Get next unprocessed area
    const areaName = getNextArea();
    if (!areaName) {
      console.log("✓ No unprocessed areas found in routes.txt");
      return;
    }

    console.log(`📍 Processing area: ${areaName}\n`);

    // Step 2: Create research task
    console.log("📡 Creating research task with Exa API...");
    const researchId = await createResearchTask(areaName);

    // Step 3: Poll for completion and get results
    console.log("⏳ Waiting for research to complete...");
    const researchContent = await getResearchResults(researchId);
    console.log(""); // New line after polling progress

    // Step 4: Generate article using AI SDK
    const articleContent = await generateArticleFromResearch(
      areaName,
      researchContent
    );

    // Step 5: Validate Mountain Project links
    const validatedContent = await validateMountainProjectLinks(
      articleContent,
      areaName
    );

    // Step 6: Write MDX file
    console.log("📝 Writing MDX file...");
    writeMDXFile(areaName, validatedContent);

    // Step 7: Mark area as done
    markAreaAsDone(areaName);

    console.log(`\n✅ Successfully processed "${areaName}"!`);
  } catch (error) {
    console.error(
      "\n❌ Error:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

// Run the script
main();

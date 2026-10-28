// robots.txt evaluation per RFC 9309 (https://www.rfc-editor.org/rfc/rfc9309.html), for the
// AI Crawler Checker. Pure: give it the file's text, a crawler's product token and a path.

export type RobotsRule = { allow: boolean; path: string };
export type RobotsGroup = { agents: string[]; rules: RobotsRule[] };

/** Groups in file order. Consecutive user-agent lines share a group; other lines are ignored. */
export function parseRobots(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;
  for (const raw of text.replace(/^﻿/, "").split(/\r\n|\r|\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      if (!lastWasAgent || !current) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (key === "allow" || key === "disallow") {
      lastWasAgent = false;
      // An empty Disallow allows everything (no rule); an empty Allow means nothing either.
      if (current && value) current.rules.push({ allow: key === "allow", path: value });
    }
    // Other records (sitemap, crawl-delay…) are not group members in RFC 9309: skipped.
  }
  return groups;
}

function ruleRegex(path: string): RegExp {
  const anchored = path.endsWith("$");
  const body = (anchored ? path.slice(0, -1) : path)
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

/**
 * Whether `token` may fetch `path`. The crawler obeys every group naming its token (merged);
 * with none, the "*" groups; with none of those either, everything is allowed. Of the matching
 * rules the longest path wins, and Allow wins a tie.
 */
export function evaluateRobots(
  text: string,
  token: string,
  path = "/"
): { allowed: boolean; group: string | null; rule: string | null } {
  const groups = parseRobots(text);
  const t = token.toLowerCase();
  let chosen = groups.filter((g) => g.agents.includes(t));
  let group: string | null = chosen.length ? t : null;
  if (!chosen.length) {
    chosen = groups.filter((g) => g.agents.includes("*"));
    group = chosen.length ? "*" : null;
  }
  let best: RobotsRule | null = null;
  for (const rule of chosen.flatMap((g) => g.rules)) {
    if (!ruleRegex(rule.path).test(path)) continue;
    if (!best || rule.path.length > best.path.length || (rule.path.length === best.path.length && rule.allow && !best.allow)) {
      best = rule;
    }
  }
  return {
    allowed: best ? best.allow : true,
    group,
    rule: best ? `${best.allow ? "Allow" : "Disallow"}: ${best.path}` : null,
  };
}

/** What a fetch status means for the whole file (RFC 9309 §2.3.1.3 and §2.3.1.4). */
export function robotsFetchVerdict(status: number): "use-body" | "allow-all" | "disallow-all" {
  if (status >= 200 && status < 300) return "use-body";
  if (status >= 400 && status < 500) return "allow-all";
  return "disallow-all";
}

import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

/** Resolved application configuration loaded from `config/application.yml`. */
export type AppConfig = {
  application: {
    name: string;
    version: string;
    description: string;
    author: string;
  };
  features: {
    showStatus: boolean;
    statusText: string;
  };
  urls: {
    resume: string;
    github: string;
  };
};

/** Matches `${VAR}` or `${VAR:-default}` placeholders inside YAML scalar strings. */
const ENV_PATTERN = /\$\{([A-Z0-9_]+)(?::-([^}]*))?\}/g;

function expandEnv(value: string): string {
  return value.replace(ENV_PATTERN, (_match, key: string, fallback?: string) => {
    const raw = process.env[key];
    if (raw !== undefined && raw !== "") return raw;
    if (fallback !== undefined) return fallback;
    throw new Error(
      `config/application.yml: environment variable "${key}" is required but not set. Add it to .env.local.`,
    );
  });
}

/** Coerce env-expanded strings into boolean / number when they unambiguously look like one. */
function coerceScalar(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const expanded = expandEnv(value);
  if (expanded === "true") return true;
  if (expanded === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(expanded)) return Number(expanded);
  return expanded;
}

function walkResolve(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((v) => walkResolve(v));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = walkResolve(v);
    }
    return out;
  }
  return coerceScalar(value);
}

function assertString(v: unknown, dotted: string): asserts v is string {
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`config/application.yml: ${dotted} must be a non-empty string`);
  }
}

function assertBoolean(v: unknown, dotted: string): asserts v is boolean {
  if (typeof v !== "boolean") {
    throw new Error(`config/application.yml: ${dotted} must be a boolean (true | false)`);
  }
}

function assertAppConfig(c: unknown): asserts c is AppConfig {
  if (!c || typeof c !== "object") {
    throw new Error("config/application.yml: root must be an object");
  }
  const root = c as Record<string, unknown>;

  const app = root.application as Record<string, unknown> | undefined;
  if (!app) throw new Error("config/application.yml: `application` block is required");
  assertString(app.name, "application.name");
  assertString(app.version, "application.version");
  assertString(app.description, "application.description");
  assertString(app.author, "application.author");

  const features = root.features as Record<string, unknown> | undefined;
  if (!features) throw new Error("config/application.yml: `features` block is required");
  assertBoolean(features.showStatus, "features.showStatus");
  assertString(features.statusText, "features.statusText");

  const urls = root.urls as Record<string, unknown> | undefined;
  if (!urls) throw new Error("config/application.yml: `urls` block is required");
  assertString(urls.resume, "urls.resume");
  assertString(urls.github, "urls.github");
}

let cached: AppConfig | null = null;

/**
 * Reads `config/application.yml`, expands `${ENV_VAR}` placeholders against
 * `process.env`, coerces booleans/numbers, and validates the shape. Throws at
 * build time on missing required env vars or shape mismatches so problems
 * surface immediately rather than as undefined values at render time.
 *
 * Server-only: relies on `node:fs`. Read in server components / layouts and
 * pass resolved values to client components as props.
 */
export function getAppConfig(): AppConfig {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "config", "application.yml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = parseYaml(raw);
  const resolved = walkResolve(parsed);
  assertAppConfig(resolved);
  cached = resolved;
  return cached;
}

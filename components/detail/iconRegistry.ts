import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Box,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  FileSearch,
  FileText,
  Filter,
  GitBranch,
  Hash,
  Layers,
  ListChecks,
  Lock,
  Network,
  Quote,
  Ruler,
  Scale,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Allowlist of icons that `content/**.json` may reference by name.
 *
 * JSON cannot hold a component, so every `icon` field in a detail block is a
 * string resolved through this map. `validate.ts` rejects any name absent
 * here at import time, which turns a typo into a build failure rather than a
 * silently empty box. Adding an icon is a one-line change.
 */
export const detailIcons = {
  activity: Activity,
  alertTriangle: AlertTriangle,
  arrowLeftRight: ArrowLeftRight,
  box: Box,
  checkCircle: CheckCircle2,
  clock: Clock,
  cpu: Cpu,
  database: Database,
  fileSearch: FileSearch,
  fileText: FileText,
  filter: Filter,
  gitBranch: GitBranch,
  hash: Hash,
  layers: Layers,
  listChecks: ListChecks,
  lock: Lock,
  network: Network,
  quote: Quote,
  ruler: Ruler,
  scale: Scale,
  send: Send,
  shield: Shield,
  shieldCheck: ShieldCheck,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  user: User,
  userCheck: UserCheck,
  users: Users,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export type DetailIconName = keyof typeof detailIcons;

export function isDetailIconName(value: unknown): value is DetailIconName {
  return typeof value === "string" && value in detailIcons;
}

/** Accent keys usable from JSON. Values live as CSS custom properties in `globals.css`. */
export const accentNames = ["mint", "lilac", "sky", "peach", "rose", "neutral"] as const;

export type AccentName = (typeof accentNames)[number];

export function isAccentName(value: unknown): value is AccentName {
  return typeof value === "string" && (accentNames as readonly string[]).includes(value);
}

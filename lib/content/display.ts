import type { DetailBlock } from "@/lib/content/types";

export function hasUsableHref(href?: string) {
  const trimmed = href?.trim();
  return Boolean(trimmed && trimmed !== "#");
}

export function isInternalEyebrow(value?: string) {
  return /^P\.?\s*\d+$/i.test(value?.trim() ?? "");
}

export function getPublicEyebrow(...values: Array<string | undefined>) {
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && !isInternalEyebrow(value)))
    .join(" · ");
}

export function getFirstDetailCta(blocks?: DetailBlock[]) {
  return blocks?.find(
    (block): block is Extract<DetailBlock, { kind: "cta" }> =>
      block.kind === "cta" && hasUsableHref(block.href),
  );
}

export function normalizeCtaLabel(label: string) {
  return label
    .trim()
    .replace(/^Try the workflow$/i, "Try workflow")
    .replace(/^Visit the site$/i, "Visit site")
    .replace(/^View the deck$/i, "View Deck");
}

export function getPrimaryCtaLabel(
  blocks: DetailBlock[] | undefined,
  fallback: string,
) {
  return normalizeCtaLabel(getFirstDetailCta(blocks)?.label ?? fallback);
}

export function getCompactPrototypeTitle(title: string) {
  return title
    .replace(/^AI\s+/i, "")
    .replace(/\s+Risk Assessment$/i, "")
    .replace(/\s+Platform$/i, "")
    .replace(/\s+Workflow$/i, "")
    .replace(/\s+System$/i, "");
}

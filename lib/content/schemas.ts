import { z } from "zod";

const imagePath = z.string().regex(/^\/images\//, "must start with /images/");

export const applicationSectionSchema = z.object({
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  diagramSrc: imagePath.optional(),
});

export const applicationSchema = z.object({
  slug: z.string().min(1),
  id: z.string().min(1),
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  descriptor: z.string().min(1),
  tag: z.string().min(1),
  category: z.string().min(1).optional(),
  highlight: z.string().min(1).optional(),
  coverSrc: imagePath,
  tryItUrl: z.string().min(1),
  iconPath: z.string().min(1),
  sections: z.array(applicationSectionSchema).min(1),
  architectureDiagram: imagePath.optional(),
  sequenceDiagram: imagePath.optional(),
});

export const applicationsSchema = z.array(applicationSchema);

export const portfolioSectionSchema = z.object({
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const portfolioProjectSchema = z.object({
  id: z.string().min(1),
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  desc: z.string().min(1),
  metric1: z.string().min(1),
  metric1Label: z.string().min(1),
  metric2: z.string().min(1),
  metric2Label: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  deckUrl: z.string().min(1),
  sections: z.array(portfolioSectionSchema).optional(),
  imageSrc: imagePath.optional(),
});

export const portfolioProjectsSchema = z.array(portfolioProjectSchema);

export const demoSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  buildNote: z.string().min(1),
  href: z.string().min(1),
  coverSrc: imagePath,
  tag: z.string().min(1).optional(),
});

export const demosSchema = z.array(demoSchema);

export type ApplicationContent = z.infer<typeof applicationSchema>;
export type PortfolioProjectContent = z.infer<typeof portfolioProjectSchema>;
export type DemoContent = z.infer<typeof demoSchema>;

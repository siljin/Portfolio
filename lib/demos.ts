import type { DemoContent } from "./content/schemas";
import { loadDemos } from "./content/loaders";

export type Demo = DemoContent;

export const demos: Demo[] = loadDemos();

import type { DetailBlock } from "@/lib/content/types";
import { CtaBlock } from "./blocks/CtaBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { LedeBlock } from "./blocks/LedeBlock";
import { MetaStripBlock } from "./blocks/MetaStripBlock";
import { PreviewPaneBlock } from "./blocks/PreviewPaneBlock";
import { TagRowBlock } from "./blocks/TagRowBlock";

/**
 * Block dispatcher: maps each `DetailBlock.kind` to its component. Switch is
 * exhaustive — when a new kind is added to the union in `types.ts`, TypeScript
 * forces a matching case here (the `never` assignment fails to compile).
 */
export function renderBlock(block: DetailBlock, key: number) {
  switch (block.kind) {
    case "lede":
      return <LedeBlock key={key} text={block.text} />;
    case "heading":
      return <HeadingBlock key={key} text={block.text} />;
    case "tagRow":
      return <TagRowBlock key={key} tags={block.tags} />;
    case "previewPane":
      return (
        <PreviewPaneBlock
          key={key}
          image={block.image}
          url={block.url}
          caption={block.caption}
          chrome={block.chrome}
        />
      );
    case "metaStrip":
      return <MetaStripBlock key={key} cells={block.cells} />;
    case "cta":
      return <CtaBlock key={key} label={block.label} href={block.href} note={block.note} />;
    default: {
      const _exhaustive: never = block;
      throw new Error(`Unknown block kind: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

export function renderBlocks(blocks: DetailBlock[]) {
  return blocks.map((b, i) => renderBlock(b, i));
}

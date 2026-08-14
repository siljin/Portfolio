import type { DetailBlock } from "@/lib/content/types";
import { ColumnsBlock } from "./blocks/ColumnsBlock";
import { CtaBlock } from "./blocks/CtaBlock";
import { FeaturePanelBlock } from "./blocks/FeaturePanelBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { LedeBlock } from "./blocks/LedeBlock";
import { MetaStripBlock } from "./blocks/MetaStripBlock";
import { PageHeroBlock } from "./blocks/PageHeroBlock";
import { PreviewPaneBlock } from "./blocks/PreviewPaneBlock";
import { StatStripBlock } from "./blocks/StatStripBlock";
import { TagRowBlock } from "./blocks/TagRowBlock";
import { WorkflowDiagramBlock } from "./blocks/WorkflowDiagramBlock";

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
    case "columns":
      return (
        <ColumnsBlock key={key} ratio={block.ratio} items={block.items} render={renderBlock} />
      );
    case "pageHero":
      return (
        <PageHeroBlock
          key={key}
          badge={block.badge}
          title={block.title}
          body={block.body}
          cta={block.cta}
        />
      );
    case "statStrip":
      return <StatStripBlock key={key} cells={block.cells} />;
    case "featurePanel":
      return (
        <FeaturePanelBlock
          key={key}
          title={block.title}
          columns={block.columns}
          items={block.items}
        />
      );
    case "workflowDiagram":
      return (
        <WorkflowDiagramBlock
          key={key}
          title={block.title}
          fullscreen={block.fullscreen}
          inputs={block.inputs}
          nodes={block.nodes}
          outputs={block.outputs}
          branches={block.branches}
          legend={block.legend}
        />
      );
    default: {
      const _exhaustive: never = block;
      throw new Error(`Unknown block kind: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

export function renderBlocks(blocks: DetailBlock[]) {
  return blocks.map((b, i) => renderBlock(b, i));
}

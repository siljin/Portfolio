"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { DiagramModal } from "@/components/DiagramModal";
import { detailIcons } from "@/components/detail/iconRegistry";
import type { DetailBlock, WorkflowDiagramNode } from "@/lib/content/types";

type WorkflowDiagramProps = Omit<Extract<DetailBlock, { kind: "workflowDiagram" }>, "kind">;

const CAP_TRACK = "132px";
const CONN_TRACK = "30px";
const GATE_TRACK = "54px";
const STAGE_TRACK = "minmax(112px,1fr)";

/**
 * Builds the rail's grid track list from the data.
 *
 * The rail is a single CSS grid so gate labels, branch connectors and exit
 * cards can be positioned by grid placement rather than by measuring the DOM.
 * A connector track sits between adjacent elements unless one of them is a
 * gate — a gate visually replaces the arrow it interrupts.
 *
 * Also returns the 1-based column of each node, of the inputs cap, and of the
 * spine output, so callers place items without recomputing the walk.
 */
function buildTracks(nodes: WorkflowDiagramNode[], hasInputs: boolean) {
  const tracks: string[] = [];
  const nodeColumns: number[] = [];
  let inputsColumn: number | null = null;

  type Slot = { kind: "cap" } | { kind: "node"; index: number };
  const slots: Slot[] = [
    ...(hasInputs ? [{ kind: "cap" } as Slot] : []),
    ...nodes.map((_, index) => ({ kind: "node", index }) as Slot),
    { kind: "cap" } as Slot,
  ];

  const isGate = (slot: Slot) => slot.kind === "node" && nodes[slot.index].role === "gate";

  slots.forEach((slot, i) => {
    if (i > 0 && !isGate(slot) && !isGate(slots[i - 1])) {
      tracks.push(CONN_TRACK);
    }
    if (slot.kind === "cap") {
      tracks.push(CAP_TRACK);
      if (i === 0 && hasInputs) inputsColumn = tracks.length;
    } else {
      tracks.push(isGate(slot) ? GATE_TRACK : STAGE_TRACK);
      nodeColumns[slot.index] = tracks.length;
    }
  });

  return { tracks, nodeColumns, inputsColumn, outputColumn: tracks.length, totalColumns: tracks.length };
}

export function WorkflowDiagramBlock({
  title,
  fullscreen,
  inputs,
  nodes,
  outputs,
  branches = [],
  legend,
}: WorkflowDiagramProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { tracks, nodeColumns, inputsColumn, outputColumn, totalColumns } = buildTracks(
    nodes,
    Boolean(inputs)
  );

  // The one output no branch points at is where the pipeline itself ends.
  // `validate.ts` guarantees there is exactly one.
  const branchedOutputIndexes = new Set(branches.map((b) => b.to));
  const spineOutput = outputs.find((_, i) => !branchedOutputIndexes.has(i));
  const exitBranches = branches.map((branch) => ({ branch, output: outputs[branch.to] }));

  // Exit cards split the rail's width evenly in source order. A card's centre
  // need not sit under its gate — the horizontal bus is what joins them.
  const exitSpan = (i: number) => {
    const width = totalColumns / exitBranches.length;
    return { start: Math.round(i * width) + 1, end: Math.round((i + 1) * width) + 1 };
  };

  // One bus per gate, spanning every exit card that gate feeds.
  const buses = [...new Set(branches.map((b) => b.from))].map((gateIndex) => {
    const spans = exitBranches
      .map((entry, i) => (entry.branch.from === gateIndex ? exitSpan(i) : null))
      .filter((s): s is { start: number; end: number } => s !== null);
    return {
      gateIndex,
      start: Math.min(...spans.map((s) => s.start)),
      end: Math.max(...spans.map((s) => s.end)),
    };
  });

  const stageNumbers = new Map<number, number>();
  let stageCounter = 0;
  nodes.forEach((node, i) => {
    if (node.role !== "gate") {
      stageCounter += 1;
      stageNumbers.set(i, stageCounter);
    }
  });

  const rail = (
    <div
      className="wf__rail"
      style={{ gridTemplateColumns: tracks.join(" ") }}
      role="img"
      aria-label={`${title}: ${nodes
        .filter((n) => n.role !== "gate")
        .map((n) => n.title)
        .join(", then ")}`}
    >
      {inputs && inputsColumn ? (
        <div className="wf__cap" style={{ gridColumn: inputsColumn }}>
          <div className="wf__capLabel">{inputs.label}</div>
          <div className="wf__capList">
            {inputs.items.map((item) => {
              const Icon = detailIcons[item.icon];
              return (
                <div className="wf__capItem" key={item.label}>
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {nodes.map((node, i) => {
        const Icon = detailIcons[node.icon];
        const column = nodeColumns[i];
        if (node.role === "gate") {
          return (
            <div key={`gate-${node.title}`} style={{ display: "contents" }}>
              <div className="wf__gateCell" style={{ gridColumn: column }} title={node.body ?? node.title}>
                <div className="wf__gate">
                  <Icon size={14} aria-hidden="true" />
                </div>
              </div>
              <span className="wf__gateLabel" style={{ gridColumn: column }}>
                {node.title}
              </span>
            </div>
          );
        }
        return (
          <div className={`wf__node wf__node--${node.accent}`} style={{ gridColumn: column }} key={node.title}>
            <span className="wf__icon">
              <Icon size={19} aria-hidden="true" />
            </span>
            <span className="wf__step">{String(stageNumbers.get(i)).padStart(2, "0")}</span>
            <div className="wf__name">{node.title}</div>
            {node.body ? <div className="wf__desc">{node.body}</div> : null}
          </div>
        );
      })}

      {/* an arrow in every gap not occupied by a gate */}
      {tracks.map((track, i) =>
        track === CONN_TRACK ? (
          <div className="wf__conn" style={{ gridColumn: i + 1 }} key={`conn-${i}`}>
            <svg className="wf__arrow" viewBox="0 0 26 10" fill="none" strokeWidth="1.5" aria-hidden="true">
              <path d="M0 5h22" />
              <path d="m18 1.5 4 3.5-4 3.5" />
            </svg>
          </div>
        ) : null
      )}

      {spineOutput
        ? (() => {
            const Icon = detailIcons[spineOutput.icon];
            return (
              <div
                className={`wf__cap wf__cap--out wf__cap--${spineOutput.tone ?? "neutral"}`}
                style={{ gridColumn: outputColumn }}
              >
                <div className="wf__capLabel">Output</div>
                <span className="wf__icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div className="wf__name">{spineOutput.title}</div>
                {spineOutput.caption ? <div className="wf__capCaption">{spineOutput.caption}</div> : null}
              </div>
            );
          })()
        : null}

      {/* branch connectors: a stem down from each gate, a horizontal bus across
          the cards that gate feeds, and a riser up from each card to the bus */}
      {buses.map((bus) => (
        <span
          key={`stem-${bus.gateIndex}`}
          className="wf__stem"
          style={{ gridColumn: nodeColumns[bus.gateIndex] }}
        />
      ))}
      {buses.map((bus) => (
        <span key={`bus-${bus.gateIndex}`} className="wf__bus" style={{ gridColumn: `${bus.start} / ${bus.end}` }} />
      ))}

      {exitBranches.map(({ branch, output }, i) => {
        const Icon = detailIcons[output.icon];
        const span = exitSpan(i);
        return (
          <div
            className={`wf__exit wf__exit--${output.tone ?? "neutral"}`}
            style={{ gridColumn: `${span.start} / ${span.end}` }}
            key={`exit-${output.title}`}
          >
            <span className="wf__icon">
              <Icon size={16} aria-hidden="true" />
            </span>
            <div className="wf__exitBody">
              <span className="wf__exitTag">{branch.label}</span>
              <div className="wf__exitTitle">{output.title}</div>
              {output.caption ? <div className="wf__exitCaption">{output.caption}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );

  const list = (
    <div className="wf__list">
      {inputs ? (
        <div className="wf__listGroup">
          <div className="wf__listLabel">{inputs.label}</div>
          <div className="wf__listChips">
            {inputs.items.map((item) => {
              const Icon = detailIcons[item.icon];
              return (
                <span className="wf__chip" key={item.label}>
                  <Icon size={13} aria-hidden="true" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="wf__listGroup">
        <div className="wf__listLabel">Pipeline</div>
        {nodes.map((node, i) => {
          const Icon = detailIcons[node.icon];
          const gate = node.role === "gate";
          return (
            <div className={`wf__listRow wf__listRow--${gate ? "gate" : node.accent}`} key={`list-${node.title}`}>
              <span className="wf__icon">
                <Icon size={17} aria-hidden="true" />
              </span>
              <div>
                {gate ? null : <span className="wf__step">{String(stageNumbers.get(i)).padStart(2, "0")}</span>}
                <div className="wf__name">{node.title}</div>
                {node.body ? <div className="wf__desc">{node.body}</div> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="wf__listGroup">
        <div className="wf__listLabel">Outcomes</div>
        {outputs.map((output) => {
          const Icon = detailIcons[output.icon];
          return (
            <div
              className={`wf__listRow wf__listRow--out wf__listRow--out-${output.tone ?? "neutral"}`}
              key={`out-${output.title}`}
            >
              <span className="wf__icon">
                <Icon size={17} aria-hidden="true" />
              </span>
              <div>
                <div className="wf__name">{output.title}</div>
                {output.caption ? <div className="wf__desc">{output.caption}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="detail-card">
      <div className="detail-card__head">
        <h2 className="detail-card__title">{title}</h2>
        {fullscreen ? (
          <button type="button" className="iconBtn" onClick={() => setIsOpen(true)}>
            <Maximize2 size={13} aria-hidden="true" />
            Fullscreen
          </button>
        ) : null}
      </div>
      <div className="wf">
        <div className="wf__scroll">{rail}</div>
        {list}
        {legend?.length ? (
          <div className="wf__legend">
            {legend.map((entry) => (
              <div className="wf__legendItem" key={entry.label}>
                <span className={`wf__legend-${entry.style}`} />
                {entry.label}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {isOpen ? (
        <DiagramModal title={title} projectTitle="" onClose={() => setIsOpen(false)}>
          <div className="wf wf--modal">
            <div className="wf__scroll">{rail}</div>
          </div>
        </DiagramModal>
      ) : null}
    </div>
  );
}

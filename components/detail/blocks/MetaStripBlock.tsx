type MetaStripCell = { label: string; value: string };
type MetaStripBlockProps = { cells: MetaStripCell[] };

export function MetaStripBlock({ cells }: MetaStripBlockProps) {
  return (
    <div className="detail-block detail-meta-strip">
      {cells.map((cell) => (
        <div key={cell.label} className="detail-meta-strip__cell">
          <div className="detail-meta-strip__label">{cell.label}</div>
          <div className="detail-meta-strip__value">{cell.value}</div>
        </div>
      ))}
    </div>
  );
}

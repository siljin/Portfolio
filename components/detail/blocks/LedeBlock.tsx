type LedeBlockProps = { text: string };

export function LedeBlock({ text }: LedeBlockProps) {
  return <p className="detail-block detail-lede">{text}</p>;
}

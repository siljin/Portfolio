type HeadingBlockProps = { text: string };

export function HeadingBlock({ text }: HeadingBlockProps) {
  return <h3 className="detail-block detail-heading">{text}</h3>;
}

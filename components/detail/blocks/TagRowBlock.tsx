type TagRowBlockProps = { tags: string[] };

export function TagRowBlock({ tags }: TagRowBlockProps) {
  return (
    <div className="detail-block detail-tag-row">
      {tags.map((tag) => (
        <span key={tag} className="detail-tag">
          {tag}
        </span>
      ))}
    </div>
  );
}

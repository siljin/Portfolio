import Image from "next/image";

type PreviewPaneBlockProps = {
  image: string;
  url?: string;
  caption?: string;
  chrome?: "browser" | "none" | "bleed";
};

export function PreviewPaneBlock({ image, url, caption, chrome = "browser" }: PreviewPaneBlockProps) {
  const bleed = chrome === "bleed";
  // Both non-browser variants skip the fake window chrome; only `bleed` also
  // drops the frame, so the image alone fills its column.
  const bare = chrome === "none" || bleed;
  const variant = bleed ? " detail-preview--bleed" : bare ? " detail-preview--bare" : "";
  return (
    <figure className={`detail-block detail-preview${variant}`}>
      {!bare && (
        <div className="detail-preview__chrome">
          <span className="detail-preview__dot" />
          <span className="detail-preview__dot" />
          <span className="detail-preview__dot" />
          {url && <span className="detail-preview__url">{url}</span>}
        </div>
      )}
      <div className="detail-preview__body">
        <Image
          src={image}
          alt={caption ?? ""}
          width={1600}
          height={900}
          sizes={
            bleed
              ? "(max-width: 900px) 100vw, 640px"
              : bare
                ? "(max-width: 900px) 100vw, 520px"
                : "(max-width: 900px) 100vw, 720px"
          }
          className="detail-preview__img"
        />
      </div>
      {caption && <figcaption className="detail-preview__caption">{caption}</figcaption>}
    </figure>
  );
}

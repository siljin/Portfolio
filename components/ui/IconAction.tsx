import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

type IconComponent = ComponentType<LucideProps>;

type CommonProps = {
  children: ReactNode;
  icon: IconComponent;
  variant?: "primary" | "secondary";
  className?: string;
  ariaLabel?: string;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: never;
};

type ButtonProps = CommonProps & {
  href?: never;
  external?: never;
  onClick: () => void;
};

export type IconActionProps = LinkProps | ButtonProps;

export function IconAction(props: IconActionProps) {
  const {
    children,
    icon: Icon,
    variant = "primary",
    className,
    ariaLabel,
  } = props;
  const actionClassName = [
    "icon-action",
    `icon-action--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconNode = <Icon size={16} strokeWidth={2.4} aria-hidden={true} />;

  if ("href" in props && typeof props.href === "string") {
    const external = props.external ?? /^https?:\/\//i.test(props.href);

    return (
      <a
        href={props.href}
        className={actionClassName}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {iconNode}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={actionClassName}
      aria-label={ariaLabel}
    >
      {iconNode}
      <span>{children}</span>
    </button>
  );
}

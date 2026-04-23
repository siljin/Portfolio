export type Demo = {
  slug: string;
  title: string;
  buildNote: string;
  href: string;
  coverSrc: string;
  tag?: string;
};

export const demos: Demo[] = [
  {
    slug: "prototype-one",
    title: "Prototype Name One",
    buildNote: "Built with Vercel + Claude API. Solves X for Y users.",
    href: "#",
    coverSrc: "/images/applications/placeholder.svg",
    tag: "Product · Demo",
  },
  {
    slug: "prototype-two",
    title: "Prototype Name Two",
    buildNote: "Built with Lovable + n8n. Automates Z workflow.",
    href: "#",
    coverSrc: "/images/applications/placeholder.svg",
    tag: "Product · Demo",
  },
  {
    slug: "prototype-three",
    title: "Prototype Name Three",
    buildNote: "Built with Bolt + OpenAI. Reduces friction in X.",
    href: "#",
    coverSrc: "/images/applications/placeholder.svg",
    tag: "Product · Demo",
  },
  {
    slug: "prototype-four",
    title: "Prototype Name Four",
    buildNote: "Built with Cursor + Python. Surfaces insights from Y.",
    href: "#",
    coverSrc: "/images/applications/placeholder.svg",
    tag: "Product · Demo",
  },
  {
    slug: "prototype-five",
    title: "Prototype Name Five",
    buildNote: "Built with Emergent. End-to-end AI agent for Z.",
    href: "#",
    coverSrc: "/images/applications/placeholder.svg",
    tag: "Product · Demo",
  },
  {
    slug: "prototype-six",
    title: "Prototype Name Six",
    buildNote: "Built with Google AI Studio. Tests hypothesis about X.",
    href: "#",
    coverSrc: "/images/applications/placeholder.svg",
    tag: "Product · Demo",
  },
];

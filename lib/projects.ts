export type Project = {
  id: string;
  eyebrow: string;
  title: string;
  category: string;
  desc: string;
  metric1: string;
  metric1Label: string;
  metric2: string;
  metric2Label: string;
  tags: string[];
};

const projects: Project[] = [
  {
    id: "onboarding",
    eyebrow: "P. 01",
    title: "Onboarding Redesign",
    category: "B2B SaaS Growth",
    desc: "Led a full rebuild of the first-run experience for a B2B SaaS product. Mapped dropoff, ran 3 experiments, shipped in 6 weeks.",
    metric1: "+23%",
    metric1Label: "activation rate",
    metric2: "6 weeks",
    metric2Label: "to ship",
    tags: ["B2B SaaS", "Growth", "Onboarding"],
  },
  {
    id: "retention",
    eyebrow: "P. 02",
    title: "Habit-Loop Retention Feature",
    category: "Retention & Data",
    desc: "Worked with the DS team to identify 30-day churn signals. Built a daily digest feature to reinforce habit formation and keep users engaged.",
    metric1: "−15%",
    metric1Label: "30-day churn",
    metric2: "+34%",
    metric2Label: "feature adoption",
    tags: ["Retention", "Data Analytics", "Email"],
  },
  {
    id: "search",
    eyebrow: "P. 03",
    title: "Search Overhaul",
    category: "0 → 1 Search",
    desc: "Rebuilt search from the ground up — semantic ranking, filter redesign, and a new results layout. Shipped in 8 weeks with 4 concurrent experiments.",
    metric1: "+40%",
    metric1Label: "search success rate",
    metric2: "−28%",
    metric2Label: "avg search time",
    tags: ["0 → 1", "Search", "Ranking"],
  },
  {
    id: "pricing",
    eyebrow: "P. 04",
    title: "Self-Serve Pricing Page",
    category: "Pricing & Monetization",
    desc: "Restructured tiers and copy based on usage data and qualitative interviews. A/B tested against the incumbent with 3 variants.",
    metric1: "+18%",
    metric1Label: "conversion rate",
    metric2: "+12%",
    metric2Label: "average contract value",
    tags: ["Pricing", "Monetization", "Billing"],
  },
  {
    id: "notifications",
    eyebrow: "P. 05",
    title: "Mobile Notifications v2",
    category: "Mobile & Engagement",
    desc: "Rebuilt the notification system around user intent and moment-of-value. Cut spam, raised signal. New delivery algorithm based on user behavior.",
    metric1: "+34%",
    metric1Label: "open rate",
    metric2: "−45%",
    metric2Label: "unsubscribe rate",
    tags: ["Mobile", "Engagement", "Push"],
  },
  {
    id: "admin",
    eyebrow: "P. 06",
    title: "Admin Console Overhaul",
    category: "Enterprise & Admin",
    desc: "Reorganized permissions, roles, and audit logs to match how enterprise customers actually work. Reduced onboarding friction significantly.",
    metric1: "−42%",
    metric1Label: "support tickets",
    metric2: "+67%",
    metric2Label: "admin satisfaction",
    tags: ["Enterprise", "Admin", "UX"],
  },
];

export function getProjects(): Project[] {
  return projects;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

import { waystarDeckUrl, costcoDeckUrl, calibrDeckUrl } from "./global-variables";

export type ProjectSection = {
  title: string;
  paragraphs: string[];
};

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
  deckUrl: string;
  sections?: ProjectSection[];
  imageSrc?: string;
};

const projects: Project[] = [
  {
    id: "waystar",
    eyebrow: "P. 01",
    title: "RCM Market Strategy",
    category: "Healthcare Technology · Strategy",
    desc: "Delivered a market-level strategic assessment of the $23B U.S. Revenue Cycle Management landscape for Waystar. Mapped value chain dynamics across eight stages, identified structural moats, and produced ranked recommendations with a defined 2026–2028 action window.",
    metric1: "$23B",
    metric1Label: "TAM analyzed",
    metric2: "5",
    metric2Label: "ranked strategic moves",
    tags: ["Healthcare", "Strategy", "AI", "Market Analysis"],
    deckUrl: waystarDeckUrl,
    imageSrc: "/images/projects/Waystar-Logo.png",
    sections: [
      {
        title: "Context",
        paragraphs: [
          "Conducted a market-level strategic assessment of Waystar's position within the U.S. healthcare Revenue Cycle Management (RCM) market — a $23B space undergoing rapid structural disruption from AI, interoperability mandates, and payer consolidation.",
        ],
      },
      {
        title: "Approach",
        paragraphs: [
          "Analyzed the revenue integrity value chain across eight integrated stages — from patient access and prior authorization through CDI, autonomous coding, and denials management. Applied Porter's Five Forces at both market and stage level, built a strategic group map across eight competitors (including Epic, Optum, R1, and AKASA), and evaluated Waystar's right-to-win at each stage of the chain.",
        ],
      },
      {
        title: "Key Findings",
        paragraphs: [
          "Front-end stages (eligibility, prior auth) are commoditizing under AI automation pressure",
          "Mid-cycle stages (CDI, prebill review) represent the highest-value expansion opportunity for players with clinical data access",
          "Waystar's structurally inimitable position lies in a cross-organizational payer intelligence feedback loop — spanning CDI, prebill, denials, and prior auth — that no competitor can replicate at scale",
        ],
      },
      {
        title: "Deliverables",
        paragraphs: [
          "Produced an executive-style strategy deck including a full value chain map, Porter's Five Forces analysis, competitive capability map, Build/Buy/Partner evaluation matrix, and five ranked strategic recommendations scored against defensibility, addressability, achievability, time-to-value, and risk.",
        ],
      },
      {
        title: "Top Recommendation",
        paragraphs: [
          "Ship Denial Insights into PreBill in 1H 2026 and scale payer-calibrated prebill scoring as the primary moat mechanism — before Epic Payer Platform scales past 25 national payers, the window the analysis identifies as 2026–2028.",
        ],
      },
    ],
  },
  {
    id: "costco",
    eyebrow: "P. 02",
    title: "Costco Growth Strategy",
    category: "Retail · Strategic Management",
    desc: "Conducted a full strategic analysis of Costco's business model and long-term growth potential. Applied Porter's Five Forces, PESTEL, value chain analysis, and competitive positioning to identify four strategic growth vectors for a $249B retailer.",
    metric1: "$249B",
    metric1Label: "revenue analyzed",
    metric2: "4",
    metric2Label: "growth initiatives",
    tags: ["Retail", "Strategy", "Competitive Analysis", "Growth"],
    deckUrl: costcoDeckUrl,
    imageSrc: "/images/projects/costco-logo.png",
    sections: [
      {
        title: "Context",
        paragraphs: [
          "Analyzed Costco's strategy at a critical inflection point: a company with 181% stock appreciation over five years, yet facing structural questions about digital competitiveness, geographic concentration, and format rigidity. With membership fees generating 51% of all operating profit, sustaining the membership flywheel — not merchandise margin — is the central strategic challenge.",
        ],
      },
      {
        title: "Approach",
        paragraphs: [
          "Applied a full strategy framework stack: Porter's Five Forces and PESTEL analysis across multiple business units, value chain evaluation across sourcing, distribution, private label, and ancillary services, VRIO resource and capability assessment, and a strategic group map benchmarking Costco against Walmart, Sam's Club, Amazon, Target, and BJ's. Complemented with a bottom-up financial breakdown across Costco's FY2025 10-K.",
        ],
      },
      {
        title: "Key Findings",
        paragraphs: [
          "Costco's 3.8% operating margin — the lowest among major retailers — is structurally intentional; the real profit engine is Kirkland Signature and membership fees, not merchandise",
          "E-commerce penetration sits at ~7% of revenue vs. 15–18% at Walmart, representing both a vulnerability and an addressable gap",
          "Sam's Club holds a meaningful digital advantage via Scan & Go and internal delivery infrastructure that Costco has not matched",
          "International operations span 14 countries but 83% of warehouses remain concentrated in North America, limiting diversification and growth runway",
        ],
      },
      {
        title: "Recommendations",
        paragraphs: [
          "Identified four prioritized growth vectors: (1) accelerating digital capability and member engagement through app investment and automation; (2) selective international expansion into underpenetrated Asia-Pacific markets; (3) piloting smaller-footprint urban formats (~40K sq. ft., ~1,500 SKUs) for dense metro markets where traditional warehouses are not viable; and (4) building in-house omnichannel infrastructure — curbside pickup and last-mile delivery — to reduce Instacart dependency and capture greater share of wallet.",
        ],
      },
    ],
  },
  {
    id: "calibr",
    eyebrow: "P. 03",
    title: "Calibr Health",
    category: "Healthcare AI · Venture",
    desc: "Pitched a fictional AI-powered behavioral health startup to real venture capitalists. Designed the product, business model, and go-to-market strategy for an AI triage platform targeting the $1.2B virtual behavioral clinic market.",
    metric1: "$3.5M",
    metric1Label: "seed round pitched",
    metric2: "$1.2B",
    metric2Label: "SAM targeted",
    tags: ["Healthcare AI", "Venture", "Product", "Pitch"],
    deckUrl: calibrDeckUrl,
    sections: [
      {
        title: "Context",
        paragraphs: [
          "Calibr Health is a fictional company built around a real and well-documented problem: 57 million Americans live with mental illness, 40% go entirely untreated, and patients spend 335 of every 337 weekly hours completely unmonitored between sessions. Simultaneously, virtual behavioral clinics face a 30% no-show rate, manual inbox triage with no acuity scoring, and clinician burnout exceeding 50%. We designed a company to fix the system — and pitched it to two practicing venture capitalists in a live classroom setting.",
        ],
      },
      {
        title: "The Product",
        paragraphs: [
          "Calibr Health is an AI-powered triage and care management platform sitting inside the clinical workflow — not alongside it. The platform operates across two layers: a Predictive AI engine that generates a 0–100 daily risk score per patient (updated every 6 hours, flagging deterioration 5–7 days before crisis) and a Generative AI layer providing 24/7 crisis chatbot support, real-time session summaries, and clinician-facing care recommendation drafts. Every score surfaces the top three behavioral drivers with full explainability — no black box, clinician retains final authority.",
        ],
      },
      {
        title: "Technical Architecture",
        paragraphs: [
          "Designed a three-phase model evolution roadmap: a rules-based scoring system deployable immediately with zero training data (Phase 1), graduating to gradient-boosted XGBoost/LightGBM models targeting AUROC ≥ 0.80 at month six (Phase 2), and multi-modal audio fusion via Whisper and OpenSMILE for session-level behavioral signal at month twelve (Phase 3). All infrastructure built on HIPAA-compliant AWS GovCloud, with infrastructure costs staying below $1 per member per month at scale.",
        ],
      },
      {
        title: "Business Model & Market",
        paragraphs: [
          "Targeted a $9B+ U.S. behavioral health software market with a SAM of $1.2B focused on 50–200 provider virtual clinics — companies like Modern Health, Talkiatry, Brightside, and Cerebral. Priced at $200 per provider per month, yielding $240K–$400K ARR per clinic. Modeled unit economics of $25K CAC against $1.2M LTV — a 48x LTV/CAC ratio — with a land-and-expand go-to-market anchored on free design-partner pilots converting to paid contracts after no-show reduction was validated.",
        ],
      },
      {
        title: "The Pitch",
        paragraphs: [
          "Presented a $3.5M seed raise at a $12M pre-money valuation to two real venture capitalists, targeting 18 months of runway to $5M ARR across 15 paying clinics. The ask included a deployment plan across product (60%), sales (25%), and clinical validation and compliance (15%).",
        ],
      },
      {
        title: "Competitive Position",
        paragraphs: [
          "No existing competitor — Spring Health, Lyra, Woebot, Netsmart, or Osmind — occupies the clinical AI workflow layer Calibr targets. Calibr is the only solution combining EHR integration via HL7 FHIR, continuous 0–100 risk scoring, between-session LLM support, and a risk-tiered clinician worklist in a single platform. The structural moat: a behavioral data flywheel where more clinics generate smarter predictions, compounding defensibility over time.",
        ],
      },
    ],
  },
];

export function getProjects(): Project[] {
  return projects;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

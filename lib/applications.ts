import { priorAuthUrl, diabetesRiskUrl, mbaTechClubUrl } from "./global-variables";

export type ProjectSection = {
  title: string;
  paragraphs: string[];
};

export type Project = {
  slug: string;
  id: string;
  eyebrow: string;
  title: string;
  descriptor: string;
  tag: string;
  category?: string;
  highlight?: string;
  coverSrc: string;
  tryItUrl: string;
  iconPath: string;
  sections: ProjectSection[];
};

const projects: Project[] = [
  {
    slug: "diabetes-diagnosis-workflow",
    id: "diabetes-risk",
    eyebrow: "P. 01",
    title: "Type 2 Diabetes Risk Assessment",
    descriptor: "Clinical decision support AI that synthesizes patient data and medical evidence to assess Type 2 Diabetes risk with physician-grade confidence scoring.",
    tag: "AI Agent · Clinical · Diagnostics",
    category: "AI Agent · Clinical",
    // highlight: "94% accuracy on test cohort; currently in clinical validation.",
    coverSrc: "/images/applications/diabetes-diagnosis.svg",
    tryItUrl: diabetesRiskUrl,
    iconPath: "M3 12h4l2-5 3 10 2-6 2 4h4",
    sections: [
      {
        title: "Context",
        paragraphs: [
          "Type 2 Diabetes diagnosis relies on multiple data sources—lab values, patient history, social factors, and clinical guidelines—that are typically fragmented across systems. Physicians need rapid, evidence-backed risk assessment to triage patients and decide on next-step testing.",
        ],
      },
      {
        title: "What I built",
        paragraphs: [
          "Created a diagnostic workflow in Dify that combines rule-based risk scoring with multi-agent clinical reasoning. The system accepts patient inputs (age, gender, symptoms, medical history, social determinants), applies ADA diagnostic criteria via a Python-based risk calculator, retrieves relevant clinical guidelines through knowledge retrieval, and orchestrates a clinical evidence agent that gathers supporting medical research. A clinical reasoning engine synthesizes all inputs into a structured JSON diagnostic output with confidence scoring. The workflow then branches: high-confidence cases generate a patient-facing report, while low-confidence cases prompt the physician with specific additional tests needed to reach diagnostic clarity.",
        ],
      },
      // {
      //   title: "Outcome",
      //   paragraphs: [
      //     "Delivered a reusable diagnostic architecture that standardizes risk assessment and ensures guideline-compliant recommendations. Reduced time from patient interview to preliminary risk report from 30 minutes to under 2 minutes. Enabled physicians to identify missing critical labs upfront and focus on the most clinically relevant next steps rather than defaulting to full workup.",
      //   ],
      // },
    ],
  },
  {
    slug: "mba-tech-club",
    id: "mba-tech-club",
    eyebrow: "P. 02",
    title: "MBA Tech Club Platform",
    descriptor: "Led organizational expansion and digital presence as Chief of Staff at McCombs MBA Tech Club, positioning it as a premier resource for MBA students pursuing careers in technology.",
    tag: "Web Development · AI · Community",
    category: "Organizational Leadership",
    highlight: "Grew club to 50+ engaged MBA students across 20+ events per year.",
    coverSrc: "/images/applications/mccombs_mba_tech_club_logo.jpeg",
    tryItUrl: mbaTechClubUrl,
    iconPath: "/images/applications/mccombs_mba_tech_club_logo.jpeg",
    sections: [
      {
        title: "Online Presence & Website Development",
        paragraphs: [
          "Designed and developed the club's official website (mbatechclub.netlify.app) from the ground up, creating a centralized digital home for the club's identity, initiatives, and team. The site communicates the club's mission across four core pillars — Product Management, Go-to-Market Strategy, Tech Operations, and Business Development — and serves as a recruiting and engagement tool for prospective and current members.",
        ],
      },
      {
        title: "Executive Team Operations",
        paragraphs: [
          "Managed day-to-day operations of the executive team, coordinating across functions to ensure alignment on club priorities, event execution, and member programming. Served as a connective layer between leadership and the broader membership, maintaining organizational momentum throughout the academic year.",
        ],
      },
      {
        title: "New Initiatives",
        paragraphs: [
          "Spearheaded the development and launch of new club initiatives designed to deepen member engagement and strengthen career outcomes. These included structured programming around industry exposure — such as company visits and guest speaker series — as well as curriculum focused on the skills and frameworks most relevant to tech roles.",
        ],
      },
      {
        title: "Impact",
        paragraphs: [
          "Through these efforts, the MBA Tech Club expanded its reach, formalized its operations, and established a stronger institutional foundation for future cohorts — contributing to a community of over 60+ engaged MBA students participating in 20+ events per year.",
        ],
      },
    ],
  },
  {
    slug: "prior-auth-workflow",
    id: "prior-auth",
    eyebrow: "P. 03",
    title: "Prior Authorization Workflow",
    descriptor: "Agentic AI system to automate insurance prior authorization requests—reducing manual effort and improving approval turnaround.",
    tag: "AI Agent · Healthcare",
    category: "AI Agent · Healthcare",
    // highlight: "Deployed at 3 health systems, processing 2k+ requests/month.",
    coverSrc: "/images/applications/prior-auth.svg",
    tryItUrl: priorAuthUrl,
    iconPath: "M3 12h4l2-5 3 10 2-6 2 4h4",
    sections: [
      {
        title: "Context",
        paragraphs: [
          "Prior authorization is a bottleneck in healthcare workflows—clinicians spend hours manually compiling patient data, insurance requirements, and medical evidence to submit authorization requests. The process is error-prone, delays patient care, and creates friction for providers.",
        ],
      },
      {
        title: "What I built",
        paragraphs: [
          "Designed and implemented an agentic AI workflow using Dify that orchestrates multiple specialized agents: a data extraction agent that parses patient records, a requirements agent that maps insurance policies to needed documentation, a clinical evidence agent that summarizes relevant medical research, and a submission agent that compiles and formats the final request. The system validates completeness at each step and routes exceptions back to the clinician for review.",
        ],
      },
      {
        title: "Outcome",
        paragraphs: [
          "Reduced prior auth submission time from 2–3 hours to 15–20 minutes per request. Improved first-pass approval rates by ensuring complete documentation. Created a reusable agent architecture that can be adapted for other insurance workflows.",
        ],
      },
    ],
  },
];

export function getProjects(): Project[] {
  return projects;
}

export function getProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

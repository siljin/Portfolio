export type ProjectSection = {
  title: string;
  paragraphs: string[];
};

export type Project = {
  slug: string;
  title: string;
  descriptor: string;
  tag: string;
  coverSrc: string;
  sections: ProjectSection[];
};

const projects: Project[] = [
  {
    slug: "prior-auth-workflow",
    title: "Prior Authorization Workflow",
    descriptor: "Agentic AI system to automate insurance prior authorization requests—reducing manual effort and improving approval turnaround.",
    tag: "AI Agent · Healthcare",
    coverSrc: "/images/projects/prior-auth.svg",
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
  {
    slug: "diabetes-diagnosis-workflow",
    title: "Type 2 Diabetes Risk Assessment",
    descriptor: "Clinical decision support AI that synthesizes patient data and medical evidence to assess Type 2 Diabetes risk with physician-grade confidence scoring.",
    tag: "AI Agent · Clinical · Diagnostics",
    coverSrc: "/images/projects/diabetes-diagnosis.svg",
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
      {
        title: "Outcome",
        paragraphs: [
          "Delivered a reusable diagnostic architecture that standardizes risk assessment and ensures guideline-compliant recommendations. Reduced time from patient interview to preliminary risk report from 30 minutes to under 2 minutes. Enabled physicians to identify missing critical labs upfront and focus on the most clinically relevant next steps rather than defaulting to full workup.",
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

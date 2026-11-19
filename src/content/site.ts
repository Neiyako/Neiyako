export type ProjectVisual = 'research-data-hub' | 'hydro-weave' | 'hydro-weave-dbas' | 'mcmtools';

export interface Project {
  number: string;
  name: string;
  description: string;
  classification: string;
  evidence: readonly string[];
  repositoryUrl: string;
  repositoryLabel: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  scopeNote?: string;
  visual: ProjectVisual;
}

export type PracticeState = 'applied' | 'developing';

export interface PracticeArea {
  number: string;
  name: string;
  state: PracticeState;
  detail: string;
}

export interface Principle {
  number: string;
  name: string;
  statement: string;
}

export const contactLinks = {
  github: 'https://github.com/Neiyako',
  contact: 'https://github.com/Neiyako',
  repositories: 'https://github.com/Neiyako?tab=repositories',
} as const;

export const projects: readonly Project[] = [
  {
    number: '01',
    name: 'ResearchDataHub',
    description:
      'A multi-source research data acquisition and synchronization framework for climate and Earth science.',
    classification: 'Research data infrastructure / acquisition + verification',
    evidence: [
      'Multi-source acquisition and routing',
      'Resumable tasks',
      'Integrity verification',
      'Auditable delivery',
    ],
    repositoryUrl: 'https://github.com/Neiyako/ResearchDataHub',
    repositoryLabel: 'ResearchDataHub',
    visual: 'research-data-hub',
  },
  {
    number: '02',
    name: 'HydroWeave',
    description:
      'A scientific computing ecosystem for Tibetan Plateau cloud-water experiments, built around explicit models and reproducible analysis.',
    classification: 'Scientific computing / cloud-water experiments',
    evidence: [
      'Tibetan Plateau cloud-water proxy indicators',
      'Water-budget and GCWR model',
      'Three-layer error analysis',
      'Reproducible runs',
    ],
    repositoryUrl: 'https://github.com/Neiyako/HydroWeave',
    repositoryLabel: 'HydroWeave',
    visual: 'hydro-weave',
  },
  {
    number: '03',
    name: 'HydroWeave-DBAS',
    description:
      'A scientific data management and analysis system for ERA5 and NetCDF workflows, from cataloging through query-ready delivery.',
    classification: 'Data infrastructure / scientific workflows',
    evidence: [
      'ERA5 / NetCDF cataloging',
      'Checksums and verification',
      'Backup and task queue',
      'Query-aware Zarr layer',
    ],
    repositoryUrl: 'https://github.com/Neiyako/HydroWeave-DBAS',
    repositoryLabel: 'HydroWeave-DBAS',
    visual: 'hydro-weave-dbas',
  },
  {
    number: '04',
    name: 'MCMtools',
    description:
      'A Python mathematical-modeling toolchain for regression and statistics workflows, with a modular roadmap kept distinct from implemented scope.',
    classification: 'Mathematical modeling / Python tooling',
    evidence: [
      'Python regression and statistics workflow',
      'Tables and figures',
      'Modular planned roadmap',
      'Current implemented scope stated explicitly',
    ],
    repositoryUrl: 'https://github.com/Neiyako/models-response',
    repositoryLabel: 'models-response',
    secondaryUrl: 'https://github.com/Neiyako/MCMtools',
    secondaryLabel: 'MCMtools on GitHub',
    scopeNote: 'The roadmap is planned in modules; only the current repository scope is presented as implemented.',
    visual: 'mcmtools',
  },
] as const;

export const practiceAreas: readonly PracticeArea[] = [
  {
    number: '01',
    name: 'AI Engineering',
    state: 'developing',
    detail:
      'Developing practice through autonomous agents, multi-agent systems, orchestration patterns, and tool-using workflows.',
  },
  {
    number: '02',
    name: 'Automation',
    state: 'applied',
    detail:
      'Project evidence in multi-source acquisition, resumable tasks, integrity checks, and task queues across data workflows.',
  },
  {
    number: '03',
    name: 'Scientific Computing',
    state: 'applied',
    detail:
      'Project evidence in cloud-water proxy indicators, GCWR water-budget modeling, ERA5/NetCDF cataloging, and reproducible runs.',
  },
  {
    number: '04',
    name: 'Embedded Systems',
    state: 'developing',
    detail:
      'Developing practice focused on edge intelligence and embedded AI; exploratory work rather than production experience.',
  },
  {
    number: '05',
    name: 'Software Engineering',
    state: 'applied',
    detail:
      'Project evidence in modular system boundaries, verification, backup, auditable delivery, and reproducible workflow design.',
  },
] as const;

export const principles: readonly Principle[] = [
  {
    number: '01',
    name: 'Reproducibility',
    statement: 'A result should be traceable, repeatable, and independently verifiable.',
  },
  {
    number: '02',
    name: 'System Thinking',
    statement: 'Solve problems through well-defined components and reliable workflows.',
  },
  {
    number: '03',
    name: 'Evidence over Assumptions',
    statement: 'Test the actual system. Measure performance. Analyze failures.',
  },
  {
    number: '04',
    name: 'Simplicity over Complexity',
    statement: 'Build only what is necessary, but build it properly.',
  },
] as const;

export const interests: readonly string[] = [
  'Autonomous AI agents and multi-agent systems.',
  'Scientific data infrastructure.',
  'Edge intelligence and embedded AI.',
  'Mathematical modeling and optimization.',
  'Reproducible engineering experiments.',
] as const;

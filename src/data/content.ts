// Research provenance stays in build-time data; never serialize this object to the browser.
export type Evidence = { source: 'brief' | 'cv-dossier' | 'cv-latex' | '2607.27179v2' | '2607.12180v1' | '2610.41057v1'; locator: string; quote: string };
export type Direction = 'higher' | 'lower' | 'uncertain-lower' | 'no-clear-difference' | 'no-differing-trajectory' | 'similar-participation';
export type Finding = { measureLabel: string; direction: Direction; resultLabel: string; evidence: Evidence[] };
export type Author = { display: string; family: string; isPedro?: boolean };
export type PaperId = 'social-cost' | 'trail' | 'out-of-sync';
export type Publication =
 | { id: 'social-cost'; status: 'HICSS-60 · Accepted · 2027'; year: 2027 }
 | { id: 'trail' | 'out-of-sync'; status: 'Preprint (arXiv)'; year: 2026 };
export type Paper = Publication & { title: string; authors: Author[]; href: string; blurb: string; visualTitle: string; caption: string };
const author = (display: string): Author => ({ display, family: display.split(',')[0]!, isPedro: display.startsWith('Martins') });
const authors = (names: string[]) => names.map(author);
const evidence = (source: Evidence['source'], locator: string, quote: string): Evidence[] => [{ source, locator, quote }];
const finding = (measureLabel: string, direction: Direction, resultLabel: string, locator: string, quote: string): Finding => ({ measureLabel, direction, resultLabel, evidence: evidence('2607.27179v2', locator, quote) });
export const socialComparisons = [
 { id: 'students', label: 'Students: AI-inclusive vs. all-human teams', findings: [
  ...['Participation', 'Responding to teammates’ ideas', 'Others taking up their ideas'].map(m => finding(m, 'lower', 'Lower', '§4.2.1', 'Treatment students had lower participation … overall responsivity … and social impact')),
  ...['Belonging', 'Status', 'Felt connection'].map(m => finding(m, 'lower', 'Lower', '§4.2.2', 'treatment students reported lower belonging … status … and felt connection')),
  ...['Continuity with their own earlier ideas', 'New information', 'Information per turn'].map(m => finding(m, 'no-clear-difference', 'No clear difference after adjustment', '§4.2.1', 'Internal cohesion, newness, and communication density did not differ after FDR adjustment.')),
  finding('Feeling valued', 'uncertain-lower', 'Lower estimate; uncertain after adjustment', '§4.2.2', 'Felt value was also lower, but the estimate was imprecise and did not survive FDR adjustment'),
 ]},
 { id: 'ai', label: 'AI vs. students on the same teams', findings: [
  ...['Participation', 'Continuity with its own earlier ideas'].map(m => finding(m, 'higher', 'Higher', '§4.1', 'AI had higher participation … and internal cohesion')),
  ...['New information', 'Information per turn'].map(m => finding(m, 'lower', 'Lower', '§4.1', 'lower newness … and communication density')),
  ...['Responding to teammates’ ideas', 'Others taking up its ideas'].map(m => finding(m, 'no-clear-difference', 'No clear difference', '§4.1', 'Differences in overall responsivity … and social impact … were small and imprecise.')),
 ]},
 { id: 'time', label: 'Change during the discussion', findings: ['Socioemotional language', 'Student–student language-style matching'].map(m => finding(m, 'no-differing-trajectory', 'No differing trajectory detected', '§4.3', 'The time-by-condition interaction was not detected for either LIWC socioemotional content … or student–student LSM')) },
];
const personaRows = [
 ['AI message length', 'Longer', 'Shorter', 'wrote about twice as long (34.7 vs. 17.5 words)'],
 ['Topic similarity to students', 'Higher', 'Lower', 'cosine 0.885 vs. 0.770'],
 ['Language-style matching', 'Higher', 'Lower', 'LSM 0.861 vs. 0.779'],
 ['Rated contribution to thinking', 'Higher', 'Lower', 'contributing more to the group’s thinking (4.15 vs. 2.84)'],
 ['Building on the AI’s ideas', 'Higher', 'Lower', 'built on its ideas more (4.33 vs. 2.89)'],
 ['Feeling included', 'Lower', 'Higher', 'felt included 6.05 vs. 5.72'],
 ['Reported over-reliance', 'Higher', 'Lower', 'lower over-reliance (1.98 vs. 2.64)'],
 ['AI share of messages', 'Similar participation rates', 'Similar participation rates', 'AI share of messages 29.6% 30.1%'],
] as const;
export const personas = [
 { id: 'cognitive', label: 'Cognitive-scaffolding agent', description: 'A thoughtful peer that questions easy consensus.' },
 { id: 'supportive', label: 'Socially-supportive agent', description: 'A warm peer that encourages participation and inclusion.' },
] as const;
export const trailFindings = personaRows.map(([measureLabel, cognitive, supportive, quote]) => ({ measureLabel, cognitive, supportive, evidence: evidence('2607.12180v1', '§5.4, Table 4', quote) }));
export const flowSteps = [
 { label: 'Configure persona', detail: 'Researchers store a graded Big Five profile, backstory, communication style, expertise, education, model, and triggers.', locator: '§4.1', quote: 'the full specification is stored with the experiment' },
 { label: 'Selective participation', detail: 'The message pipeline batches messages, integrates memory, decides whether to speak, and generates a persona-aligned reply.', locator: '§4.2', quote: 'four sequential stages (batching, dual-memory integration, participation decision, and persona-aligned generation)' },
 { label: 'Dual memory', detail: 'Recent conversation context is paired with periodic reflective summaries of the team’s progress and dynamics.', locator: '§4.2', quote: 'short-term conversational context plus periodic reflective long-term summaries' },
 { label: 'Chained sessions', detail: 'Researchers link sessions into ordered sequences for studying teams over time.', locator: '§4.3', quote: 'links sessions into ordered sequences' },
 { label: 'Export & analytics', detail: 'Condition-labeled exports connect chat logs, persona specifications, decision traces, and survey responses for analysis.', locator: '§4.4', quote: 'exports timestamped chat logs, participant identifiers, condition labels, persona specifications, and pre-/post-survey responses' },
];
export const syncPanels = [
 { label: 'Perceived collaboration process', switches: true, evidence: evidence('2610.41057v1', 'Results, Figure 4', 'they began below Cognitive-Agent teams and climbed past them by the final analyzed session') },
 { label: 'Positive-affect words in spoken reflections', switches: true, evidence: evidence('2610.41057v1', 'Results, Figure 4', 'positive-affect word use rose for Supportive-Agent teams and crossed above that of Cognitive-Agent teams') },
 { label: 'Perceived AI helpfulness', switches: false, evidence: evidence('2610.41057v1', 'Results', 'Students rated the Supportive Agent as less helpful than the Cognitive Agent in every session') },
];
export const content = {
 meta: { title: 'Pedro Martins de Bastos | Human–AI Teaming', description: 'Pedro Martins de Bastos is a Ph.D. student at UC Irvine studying how AI teammates shape group communication, connection, and learning.' },
 person: { name: 'Pedro Martins de Bastos', identity: 'Ph.D. Student · Language and Learning Analytics Lab · UC Irvine', email: 'pedrom4@uci.edu' },
 navigation: [{ id: 'about', label: 'About' }, { id: 'research', label: 'Research' }, { id: 'experience', label: 'Experience' }, { id: 'contact', label: 'Contact' }],
 hero: { statement: 'I study how AI teammates change the way people talk, think, and connect in small groups.', values: 'I want AI teammates to support people’s ideas and their relationships with one another.', researchLink: 'Explore my research', contactLink: 'Get in touch' },
 about: { heading: 'About', paragraphs: ['I’m a Ph.D. student in Education at the University of California, Irvine, specializing in Teaching, Learning, and Educational Improvement. I work with Nia Nixon in the Language and Learning Analytics Lab.', 'My research brings together learning analytics, language analysis, and computer-supported collaborative learning. I study what happens to the people in a group when an AI joins the conversation. I’m also one of two principal developers of TRAIL, a platform for studying human–AI teams.'] },
 researchIntro: { heading: 'Research & featured work', text: 'What changes when an AI becomes part of a team? My work examines the conversation, the experience of belonging, and the tools we use to study both.' },
 papers: [
 { id: 'social-cost', status: 'HICSS-60 · Accepted · 2027', year: 2027, title: 'The Social Cost of an AI Teammate: How an Artificial Teammate Reshapes Human-Human Communication in Small-Team Decision-Making', authors: authors(['Nixon, N.', 'Choi, J.', 'Martins de Bastos, P.', 'Samadi, M. A.', 'Park, S.', 'JaQuay, S.']), href: 'https://arxiv.org/abs/2607.27179', blurb: 'An AI can take part in a conversation while the people around it feel less connected. In a text-chat rescue task, students on AI-inclusive teams participated less and reported lower belonging, status, and connection than students on all-human teams.', visualTitle: 'Who participates, and who feels connected?', caption: 'In this text-chat rescue task, students on AI-inclusive teams participated less and reported lower belonging, status, and connection than students on all-human teams. Communication scores describe the whole team conversation, so they do not isolate human-to-human exchanges.' },
 { id: 'trail', status: 'Preprint (arXiv)', year: 2026, title: 'TRAIL: A Platform for Configurable Human–AI Teaming Experiments', authors: authors(['Samadi, M. A.', 'Martins de Bastos, P.', 'Choi, J.', 'JaQuay, S.', 'Park, S.', 'Nixon, N.']), href: 'https://arxiv.org/abs/2607.12180', blurb: 'TRAIL lets researchers configure an AI teammate, run group conversations, and connect the discussion with survey responses. Its classroom demonstration showed different patterns for a persona that challenged ideas and one that encouraged inclusion.', visualTitle: 'Two AI roles, different patterns', caption: 'TRAIL lets researchers configure an AI teammate and study the conversation around it. In this classroom demonstration, the cognitive-scaffolding persona received higher contribution ratings, while the socially-supportive persona coincided with greater inclusion and lower reported over-reliance.' },
 { id: 'out-of-sync', status: 'Preprint (arXiv)', year: 2026, title: 'Out of sync: Accommodation, evaluation, and emergence in five weeks with an agentic AI teammate', authors: authors(['Nixon, N.', 'Choi, J.', 'Martins de Bastos, P.', 'Samadi, M. A.']), href: 'https://arxiv.org/abs/2610.41057', blurb: 'A teammate can be rated less helpful while the team’s view of its collaboration improves. Across repeated sessions, language, helpfulness ratings, and perceptions of collaboration followed different patterns.', visualTitle: 'Helpfulness and collaboration can diverge', caption: 'Supportive-Agent teams began below Cognitive-Agent teams and ended above them on perceived collaboration process and positive-affect words in reflections. Students still rated the Supportive Agent less helpful throughout; the study does not establish why team perceptions changed.' },
 ] satisfies Paper[],
 workshop: { category: 'Service · AIED 2026', title: 'Human-AI Teaming: From Tools to Teammates II', subtitle: 'Designing AI That Belongs', role: 'Co-organizer · June 28, 2026 · Seoul', summary: 'I co-organized the second annual workshop on human–AI teaming, a half-day workshop at AIED 2026.', link: 'Read the workshop summary', href: 'https://doi.org/10.1007/978-3-032-29794-5_21' },
 experienceHeading: 'Experience & education',
 experience: [
 { date: 'Aug 2025–present', iso: '2025-08', title: 'Ph.D. in Education · UC Irvine', description: 'Research in the Language and Learning Analytics Lab, with a specialization in Teaching, Learning, and Educational Improvement.' },
 { date: 'Oct 2024–Jun 2025', iso: '2024-10', title: 'Data Engineer · Atypical AI', description: 'Developed systems that retrieved relevant material for AI tutoring and personalized learning support.' },
 { date: 'Aug 2021–Aug 2024', iso: '2021-08', title: 'Data Science Associate · Adtalem Global Education', description: 'Built models to identify students who might need academic support, along with data pipelines and dashboards for academic teams.' },
 { date: '2021', iso: '2021', title: 'B.S. in Data Science and Statistics · Minerva University', description: 'Minor in Brain and Behavior.' },
 ],
 contact: { heading: 'Get in touch', text: 'Interested in human–AI teams, group communication, or learning analytics? You can reach me by email.', emailLabel: 'Email Pedro' },
 profiles: [ { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=_rBcP6AAAAAJ' }, { label: 'ORCID', href: 'https://orcid.org/0009-0009-8686-7871' }, { label: 'GitHub', href: 'https://github.com/pedro-de-bastos' }, { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pedro-martins-de-bastos-31925115b/' } ],
 ui: {
  skip: 'Skip to main content', nav: 'Main navigation', pause: 'Pause background motion', resume: 'Resume background motion', motionOff: 'Background motion is off',
  disclaimer: 'Descriptive summary of reported findings', paperLink: 'Read the paper on arXiv', allComparisons: 'All reported comparisons', measure: 'Measure', result: 'Reported result', comparison: 'Comparison', higher: 'Higher', lower: 'Lower', noClear: 'No clear difference', uncertain: 'Uncertain estimate', trajectory: 'Trajectory comparison',
  direction: 'Direction only — spacing does not show effect size.', teamTitle: 'Illustrative team', addAI: 'Add an AI teammate', removeAI: 'All-human team', student: 'Student', ai: 'AI', halo: 'Soft halos represent student belonging.',
  teamEncoding: 'AI participation is compared with students on the same teams. Student participation and belonging are compared with all-human teams.',
  teamDisclaimer: 'Illustrative — sizes show reported direction only, not effect size; not fitted to study data.', seats: 'Configured team seats; some student records were missing.', wholeTeam: 'Communication measures describe each participant within the whole team conversation.', temporal: 'The study cannot establish when the difference emerged.',
  teamHuman: 'Illustrative all-human team: three student seats. Sizes and belonging halos provide a reference, not measured values.', teamAI: 'Illustrative AI-inclusive team: two student seats and one AI seat. The AI participates more than its student teammates; students participate less and report lower belonging than students on all-human teams. Sizes and halos show direction only.',
  summarySuffix: 'This display shows direction, not effect size.',
  personaLegend: 'Explore an observed persona', personaCompare: 'Compared with the other persona', personaNote: 'Observed persona comparisons; no significance tests were reported.', personaScope: 'Directions compare these two configured personas, not all possible AI teammates.', personaSuffix: 'These are descriptive comparisons without significance tests.',
  flowTitle: 'Explore the experiment flow', flowNote: 'Platform components, not a timeline of measured outcomes. Dual memory is integrated within the message pipeline.',
  rangeLabel: 'Compare the first and last analyzed sessions', first: 'Session 1', last: 'Session 5', firstValue: 'Session 1 — first analyzed session', lastValue: 'Session 5 — last analyzed session',
  higherLane: 'Higher in this comparison', lowerLane: 'Lower in this comparison', cognitiveAgent: 'Cognitive Agent', supportiveAgent: 'Supportive Agent',
  syncNotes: ['Relative ordering only — positions do not show scores or effect sizes.', 'Primary analyses used sessions 1, 2, 4, and 5.', 'Session 3 was excluded after a technical issue; session 6 used a substantially longer task prompt.', 'Both agent configurations changed after session 1.', 'Positive-affect words describe reflections on the collaboration; they do not measure liking of the AI.', 'This small exploratory study leaves the reason for the crossover unresolved.'],
  firstSummary: 'Session 1: Cognitive-Agent teams were higher on perceived collaboration process and positive-affect words in reflections. The Cognitive Agent was also rated more helpful.',
  lastSummary: 'Session 5: Supportive-Agent teams were higher on perceived collaboration process and positive-affect words in reflections. The Cognitive Agent was still rated more helpful.',
 },
};

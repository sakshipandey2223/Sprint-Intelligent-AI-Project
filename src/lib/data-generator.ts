export interface Sprint {
  id: number;
  name: string;
  status: 'completed' | 'active' | 'future';
  startDate: string;
  endDate: string;
  targetPoints: number;
  completedPoints: number;
  velocity: number;
  completionRate: number;
  healthScore: number;
}

export interface Developer {
  id: string;
  name: string;
  role: 'Developer' | 'QA' | 'Product Owner' | 'Scrum Master';
  avatar: string;
  capacityPoints: number;
  assignedPoints: number;
  utilization: number;
  defectDensity: number; // Bugs opened per story points completed
  completedIssuesCount: number;
  activeIssuesCount: number;
  skills: string[];
}

export interface Epic {
  id: string;
  name: string;
  color: string;
  progress: number; // 0 to 100
  totalPoints: number;
  completedPoints: number;
}

export interface Issue {
  id: string;
  title: string;
  type: 'Story' | 'Bug' | 'Task' | 'Blocker';
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  storyPoints: number;
  assigneeId: string;
  sprintId: number | null;
  epicId: string;
  createdDate: string;
  resolvedDate?: string;
  isBlocked: boolean;
  blockedReason?: string;
  riskScore: number; // 0 to 100
  riskFactors?: string[];
}

export interface BurndownDataPoint {
  day: number;
  date: string;
  idealRemaining: number;
  actualRemaining: number | null;
}

export interface VelocityHistoryPoint {
  sprintName: string;
  targetPoints: number;
  completedPoints: number;
}

export interface AnalyticsSummary {
  leadTimeAvg: number; // Days from created to resolved
  cycleTimeAvg: number; // Days from in-progress to resolved
  deploymentFrequency: number; // deploys/week
  defectDensity: number; // bugs/completed-story-points
  riskScore: number; // Overall team risk score
  completionProbability: number; // % chance active sprint completes on time
}

// Simple seed-based random generator to ensure stable realistic data
class SeededRandom {
  private seed: number;
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  next() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  nextRange(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  nextElement<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export function generateDashboardData() {
  const rng = new SeededRandom(1337);

  // 1. Team Setup
  const developers: Developer[] = [
    { id: 'dev-1', name: 'Alice Chen', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', capacityPoints: 12, assignedPoints: 0, utilization: 0, defectDensity: 0.08, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['Next.js', 'TypeScript', 'TailwindCSS'] },
    { id: 'dev-2', name: 'Bob Smith', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', capacityPoints: 14, assignedPoints: 0, utilization: 0, defectDensity: 0.12, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['Node.js', 'Express', 'SQL'] },
    { id: 'dev-3', name: 'Charlie Kim', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', capacityPoints: 12, assignedPoints: 0, utilization: 0, defectDensity: 0.05, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['React', 'Framer Motion', 'UI/UX'] },
    { id: 'dev-4', name: 'Dave Patel', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', capacityPoints: 12, assignedPoints: 0, utilization: 0, defectDensity: 0.15, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['React', 'Recharts', 'TypeScript'] },
    { id: 'dev-5', name: 'Eve Martinez', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', capacityPoints: 10, assignedPoints: 0, utilization: 0, defectDensity: 0.10, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['Node.js', 'Docker', 'SQLite'] },
    { id: 'dev-6', name: 'Frank Jackson', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', capacityPoints: 15, assignedPoints: 0, utilization: 0, defectDensity: 0.07, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['React Native', 'TypeScript', 'CSS'] },
    { id: 'qa-1', name: 'Grace Hopper', role: 'QA', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', capacityPoints: 10, assignedPoints: 0, utilization: 0, defectDensity: 0, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['Playwright', 'Jest', 'CI/CD'] },
    { id: 'qa-2', name: 'Heidi Klum', role: 'QA', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', capacityPoints: 10, assignedPoints: 0, utilization: 0, defectDensity: 0, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['Cypress', 'API Testing', 'Security'] },
    { id: 'po-1', name: 'Ivy League', role: 'Product Owner', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', capacityPoints: 0, assignedPoints: 0, utilization: 0, defectDensity: 0, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['Product Strategy', 'Backlog Grooming'] },
    { id: 'sm-1', name: 'Jack Scrum', role: 'Scrum Master', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', capacityPoints: 0, assignedPoints: 0, utilization: 0, defectDensity: 0, completedIssuesCount: 0, activeIssuesCount: 0, skills: ['Agile Coaching', 'Metrics', 'Blocker Removal'] }
  ];

  // 2. Epics Setup
  const epics: Epic[] = [
    { id: 'epic-1', name: 'Core Engine Orchestration', color: '#8b5cf6', progress: 0, totalPoints: 0, completedPoints: 0 },
    { id: 'epic-2', name: 'Next-Gen UI/UX Refactor', color: '#06b6d4', progress: 0, totalPoints: 0, completedPoints: 0 },
    { id: 'epic-3', name: 'AI Copilot Integration Layer', color: '#ec4899', progress: 0, totalPoints: 0, completedPoints: 0 },
    { id: 'epic-4', name: 'Sprint Analytics & KPI Visualizations', color: '#10b981', progress: 0, totalPoints: 0, completedPoints: 0 },
    { id: 'epic-5', name: 'Enterprise Authentication & Security', color: '#f59e0b', progress: 0, totalPoints: 0, completedPoints: 0 }
  ];

  // 3. Sprints Setup (July 2026 anchors)
  // Sprint 10 is active, starts July 13, 2026, ends July 24, 2026
  // Sprint duration: 14 calendar days (10 working days)
  const sprints: Sprint[] = [];
  const msInDay = 24 * 60 * 60 * 1000;
  const baseDate = new Date('2026-07-13T09:00:00Z').getTime(); // Start of active sprint

  for (let i = 1; i <= 10; i++) {
    const diffDays = (i - 10) * 14;
    const start = new Date(baseDate + diffDays * msInDay);
    const end = new Date(start.getTime() + 11 * msInDay); // 12 days later (ends on Friday of next week)

    const isCompleted = i < 10;
    const isActive = i === 10;

    let targetPoints = 40 + (i % 3) * 5; // 40, 45, 50, etc.
    let completedPoints = 0;

    if (isCompleted) {
      // Completed sprints hit 85% to 105% of targets
      const variance = rng.nextRange(-5, 4);
      completedPoints = targetPoints + variance;
    } else {
      // Active sprint targets 52 points, but current completed is lower
      targetPoints = 52;
      completedPoints = 22; // Progress so far (mid-sprint)
    }

    const velocity = isCompleted ? completedPoints : 0;
    const completionRate = Math.round((completedPoints / targetPoints) * 100);
    
    // Sprint health score (1-100)
    let healthScore = 0;
    if (isCompleted) {
      healthScore = completionRate > 95 ? rng.nextRange(92, 98) : rng.nextRange(80, 91);
    } else {
      healthScore = 84; // Sprint 10 is active and doing okay, but has some risks
    }

    sprints.push({
      id: i,
      name: `Sprint ${i}`,
      status: isActive ? 'active' : (isCompleted ? 'completed' : 'future'),
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      targetPoints,
      completedPoints: isActive ? 22 : completedPoints,
      velocity,
      completionRate,
      healthScore
    });
  }

  // 4. Generate 250 Issues
  const issues: Issue[] = [];
  const types: ('Story' | 'Bug' | 'Task' | 'Blocker')[] = ['Story', 'Story', 'Story', 'Bug', 'Bug', 'Task', 'Blocker'];
  const priorities: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'Medium', 'High', 'High', 'Critical'];
  const fibonacci = [1, 2, 3, 5, 8, 13];

  const issueTitles: Record<string, string[]> = {
    'epic-1': [
      'Optimize database queries for transaction log lookup',
      'Refactor API cache eviction strategy',
      'Design background worker architecture for reports',
      'Implement multi-tenant database connection pooling',
      'Add system metrics exporter for Datadog integration',
      'Write database migration for SQLite schema',
      'Benchmark memory footprint of JSON serialization',
      'Build webhook retry worker with exponential backoff',
      'Integrate Redis cache driver for session storage',
      'Optimize Express router handler loading mechanism',
      'Design telemetry tracing bridge for OpenTelemetry',
      'Refactor websocket heartbeats and reconnect routine'
    ],
    'epic-2': [
      'Implement React 19 compiler compatibility checks',
      'Refactor main layout using modern CSS Grid & variables',
      'Optimize page transitions with Framer Motion LayoutId',
      'Convert dashboard layout into responsive sidebar',
      'Build accessible combobox component using Radix',
      'Create reusable glassmorphic card backdrop utility',
      'Implement keyboard navigation for Scrum Board view',
      'Fix alignment of grid items on developer details page',
      'Refactor color tokens to HSL variables for dark mode',
      'Implement custom scrollbar styles across layouts',
      'Add layout transitions for switching dashboard themes',
      'Fix mobile navigation overlay clicking issues'
    ],
    'epic-3': [
      'Implement local NLP regex router for assistant queries',
      'Write API route handlers for chatbot responses',
      'Build markdown renderer for AI reports panel',
      'Integrate LLM API handler with local fallback engine',
      'Implement typing animation wrapper for Copilot chat',
      'Optimize token window limits for historical logs',
      'Create system prompt template context compiler',
      'Integrate feedback loop triggers for AI predictions',
      'Develop contextual data extractors for SQL queries',
      'Add quick-suggestion pills to AI floating panel',
      'Benchmark response latency of LLM API requests',
      'Design Chat log persistent state hook with Zustand'
    ],
    'epic-4': [
      'Create custom Gauge component using SVG strokeDasharray',
      'Draw interactive Velocity Recharts bar chart',
      'Plot daily Sprint Burndown with ideal guide line',
      'Design radar chart for developer skill utilization',
      'Implement hover states on Defect Density line chart',
      'Build drag-and-drop widget configurator layout',
      'Plot cycle-time distribution scatter graph',
      'Develop team workload stacked column visualization',
      'Implement animated progress ring for KPI panels',
      'Plot sprint comparison multi-series area chart',
      'Integrate interactive filters with Chart components',
      'Fix tooltip overlay clipping on charts boundaries'
    ],
    'epic-5': [
      'Configure mock JWT token validation middleware',
      'Implement route protection for analytics backend',
      'Design login card with subtle glowing ambient lights',
      'Audit package dependencies for critical CVE alerts',
      'Implement AES encryption helper for user settings',
      'Configure CORS headers for REST API endpoints',
      'Implement brute-force request rate limiter middleware',
      'Add audit log trace table for admin configuration',
      'Design permissions gate check for report downloads',
      'Integrate OAuth login mock callbacks for testing',
      'Verify CSRF token validation on config update',
      'Write security checklist assessment validator'
    ]
  };

  const genericTitles = [
    'Write unit tests for authentication utilities',
    'Document API design specification in Swagger/OpenAPI',
    'Debug memory leak in websocket message parsing',
    'Review pull request for developer workspace update',
    'Fix layout shifts during skeleton loader displays',
    'Add error boundary wrapper to visual panels',
    'Optimize asset image sizes for fast page loading',
    'Implement dark theme variables globally'
  ];

  // Helper to get creation date relative to sprints
  const getCreatedDate = (sprintId: number | null, rng: SeededRandom) => {
    if (!sprintId) {
      // Backlog tickets created recently
      const dayOffset = rng.nextRange(-30, -1);
      const d = new Date(baseDate + dayOffset * msInDay);
      return d.toISOString().split('T')[0];
    }
    // Sprints are 14 days apart. Create tickets 5-20 days before sprint starts.
    const sprintStart = new Date(sprints[sprintId - 1].startDate).getTime();
    const dayOffset = rng.nextRange(-15, -2);
    const d = new Date(sprintStart + dayOffset * msInDay);
    return d.toISOString().split('T')[0];
  };

  const getResolvedDate = (createdDate: string, sprintId: number, rng: SeededRandom, status: string) => {
    if (status !== 'Done') return undefined;
    const start = new Date(sprints[sprintId - 1].startDate).getTime();
    const end = new Date(sprints[sprintId - 1].endDate).getTime();
    // Resolve sometime during the sprint
    const resolveTime = rng.nextRange(start, end);
    return new Date(resolveTime).toISOString().split('T')[0];
  };

  let issueCounter = 1;

  // Sprints 1 to 9 (Completed)
  for (let s = 1; s <= 9; s++) {
    const sprintIssuesCount = 22;
    for (let k = 0; k < sprintIssuesCount; k++) {
      const epic = rng.nextElement(epics);
      const epicId = epic.id;
      const type = rng.nextElement(types);
      const priority = rng.nextElement(priorities);
      const points = rng.nextElement(fibonacci);
      const assignee = rng.nextElement(developers.filter(d => d.role === 'Developer' || d.role === 'QA'));
      
      const created = getCreatedDate(s, rng);
      const resolved = getResolvedDate(created, s, rng, 'Done');
      
      const issueId = `AG-${String(issueCounter++).padStart(4, '0')}`;
      const titleList = issueTitles[epicId] || genericTitles;
      const baseTitle = titleList[k % titleList.length];
      const title = `${baseTitle} (Part ${Math.floor(k / titleList.length) + 1})`;

      issues.push({
        id: issueId,
        title,
        type,
        status: 'Done',
        priority,
        storyPoints: points,
        assigneeId: assignee.id,
        sprintId: s,
        epicId,
        createdDate: created,
        resolvedDate: resolved,
        isBlocked: false,
        riskScore: 0,
        riskFactors: []
      });
    }
  }

  // Active Sprint 10 (35 issues)
  const sprint10IssuesCount = 35;
  const sprint10Statuses: ('To Do' | 'In Progress' | 'In Review' | 'Done')[] = [
    'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done', 'Done',
    'In Progress', 'In Progress', 'In Progress', 'In Progress', 'In Progress', 'In Progress',
    'In Review', 'In Review', 'In Review', 'In Review', 'In Review',
    'To Do', 'To Do', 'To Do', 'To Do', 'To Do', 'To Do', 'To Do', 'To Do', 'To Do', 'To Do', 'To Do', 'To Do', 'To Do'
  ];

  for (let k = 0; k < sprint10IssuesCount; k++) {
    const epic = rng.nextElement(epics);
    const epicId = epic.id;
    const type = rng.nextElement(types);
    const priority = rng.nextElement(priorities);
    const points = rng.nextElement(fibonacci);
    const devsAndQa = developers.filter(d => d.role === 'Developer' || d.role === 'QA');
    const assignee = devsAndQa[k % devsAndQa.length];

    const status = sprint10Statuses[k % sprint10Statuses.length];
    const created = getCreatedDate(10, rng);
    const resolved = status === 'Done' ? getResolvedDate(created, 10, rng, 'Done') : undefined;

    // Blockers Setup (create 3 blocked tickets)
    let isBlocked = false;
    let blockedReason: string | undefined;
    if (status === 'In Progress' && k % 5 === 1) {
      isBlocked = true;
      blockedReason = rng.nextElement([
        'Waiting on API specifications from platform team',
        'Framer Motion layout shifts blocking UX review',
        'Database connection pool limits causing local sandbox timeouts'
      ]);
    }

    const issueId = `AG-${String(issueCounter++).padStart(4, '0')}`;
    const titleList = issueTitles[epicId] || genericTitles;
    const baseTitle = titleList[k % titleList.length];
    const title = `${baseTitle} - Current`;

    // Compute dynamic risk score (0-100)
    let riskScore = 10;
    const riskFactors: string[] = [];

    if (isBlocked) {
      riskScore += 35;
      riskFactors.push('Ticket is currently Blocked');
    }
    if (priority === 'Critical') {
      riskScore += 25;
      riskFactors.push('Critical priority ticket');
    } else if (priority === 'High') {
      riskScore += 15;
      riskFactors.push('High priority ticket');
    }
    if (points >= 8) {
      riskScore += 15;
      riskFactors.push('High story points complexity (>= 8 SP)');
    }
    if (status === 'In Progress' && type === 'Bug') {
      riskScore += 15;
      riskFactors.push('Active bug ticket');
    }

    issues.push({
      id: issueId,
      title,
      type,
      status,
      priority,
      storyPoints: points,
      assigneeId: assignee.id,
      sprintId: 10,
      epicId,
      createdDate: created,
      resolvedDate: resolved,
      isBlocked,
      blockedReason,
      riskScore: Math.min(riskScore, 100),
      riskFactors
    });
  }

  // Backlog issues (17 issues)
  const backlogIssuesCount = 17;
  for (let k = 0; k < backlogIssuesCount; k++) {
    const epic = rng.nextElement(epics);
    const epicId = epic.id;
    const type = rng.nextElement(types);
    const priority = rng.nextElement(priorities);
    const points = rng.nextElement(fibonacci);

    const created = getCreatedDate(null, rng);

    const issueId = `AG-${String(issueCounter++).padStart(4, '0')}`;
    const titleList = issueTitles[epicId] || genericTitles;
    const baseTitle = titleList[k % titleList.length];
    const title = `${baseTitle} - Backlog`;

    issues.push({
      id: issueId,
      title,
      type: type === 'Blocker' ? 'Story' : type,
      status: 'To Do',
      priority,
      storyPoints: points,
      assigneeId: 'po-1',
      sprintId: null,
      epicId,
      createdDate: created,
      isBlocked: false,
      riskScore: 5,
      riskFactors: []
    });
  }

  // Calculate Epic Progressions
  epics.forEach(epic => {
    const epicIssues = issues.filter(i => i.epicId === epic.id);
    const totalPts = epicIssues.reduce((sum, i) => sum + i.storyPoints, 0);
    const completedPts = epicIssues.filter(i => i.status === 'Done').reduce((sum, i) => sum + i.storyPoints, 0);
    epic.totalPoints = totalPts;
    epic.completedPoints = completedPts;
    epic.progress = totalPts > 0 ? Math.round((completedPts / totalPts) * 100) : 0;
  });

  // Calculate Developer Assignments and metrics for Sprint 10
  developers.forEach(dev => {
    const devS10Issues = issues.filter(i => i.sprintId === 10 && i.assigneeId === dev.id);
    const devAllIssues = issues.filter(i => i.assigneeId === dev.id);

    dev.assignedPoints = devS10Issues.reduce((sum, i) => sum + i.storyPoints, 0);
    dev.utilization = dev.capacityPoints > 0 ? Math.round((dev.assignedPoints / dev.capacityPoints) * 100) : 0;
    dev.completedIssuesCount = devAllIssues.filter(i => i.status === 'Done').length;
    dev.activeIssuesCount = devS10Issues.filter(i => i.status !== 'Done').length;

    if (dev.assignedPoints > dev.capacityPoints) {
      issues.forEach(i => {
        if (i.sprintId === 10 && i.assigneeId === dev.id) {
          if (!i.riskFactors) i.riskFactors = [];
          if (!i.riskFactors.includes('Developer overloaded')) {
            i.riskFactors.push(`Developer overloaded (${dev.assignedPoints}/${dev.capacityPoints} SP)`);
            i.riskScore = Math.min(i.riskScore + 20, 100);
          }
        }
      });
    }
  });

  // Re-aggregate active Sprint 10 stats based on real issues
  const s10 = sprints[9];
  const s10Issues = issues.filter(i => i.sprintId === 10);
  s10.targetPoints = s10Issues.reduce((sum, i) => sum + i.storyPoints, 0);
  s10.completedPoints = s10Issues.filter(i => i.status === 'Done').reduce((sum, i) => sum + i.storyPoints, 0);
  s10.completionRate = Math.round((s10.completedPoints / s10.targetPoints) * 100);

  // Burndown Data for Sprint 10
  const burndown: BurndownDataPoint[] = [];
  const s10Target = s10.targetPoints;
  
  const workDays = [
    { day: 0, date: '2026-07-13' },
    { day: 1, date: '2026-07-14' },
    { day: 2, date: '2026-07-15' },
    { day: 3, date: '2026-07-16' },
    { day: 4, date: '2026-07-17' },
    { day: 5, date: '2026-07-20' },
    { day: 6, date: '2026-07-21' },
    { day: 7, date: '2026-07-22' },
    { day: 8, date: '2026-07-23' },
    { day: 9, date: '2026-07-24' }
  ];

  workDays.forEach(wd => {
    const ideal = Math.max(0, Math.round(s10Target - (wd.day * (s10Target / 9))));
    let actual: number | null = null;
    
    if (wd.day === 0) actual = s10Target;
    else if (wd.day === 1) actual = s10Target - 12;
    else if (wd.day === 2) actual = s10Target - 25;
    else if (wd.day === 3) actual = s10Target - 43;
    else if (wd.day === 4) actual = s10Target - 54;
    
    burndown.push({
      day: wd.day + 1,
      date: wd.date,
      idealRemaining: ideal,
      actualRemaining: actual
    });
  });

  const velocityHistory: VelocityHistoryPoint[] = sprints
    .filter(s => s.status === 'completed')
    .map(s => ({
      sprintName: s.name,
      targetPoints: s.targetPoints,
      completedPoints: s.completedPoints
    }));
  
  velocityHistory.push({
    sprintName: s10.name,
    targetPoints: s10.targetPoints,
    completedPoints: s10.completedPoints
  });

  const completedIssues = issues.filter(i => i.status === 'Done' && i.sprintId !== null);
  const totalLeadTime = completedIssues.reduce((sum, i) => {
    const created = new Date(i.createdDate).getTime();
    const resolved = new Date(i.resolvedDate!).getTime();
    return sum + (resolved - created) / msInDay;
  }, 0);

  const totalCycleTime = completedIssues.reduce((sum, i) => {
    const created = new Date(i.createdDate).getTime();
    const resolved = new Date(i.resolvedDate!).getTime();
    const lead = (resolved - created) / msInDay;
    const cycle = lead * (rng.nextRange(40, 70) / 100);
    return sum + cycle;
  }, 0);

  const leadTimeAvg = Math.round((totalLeadTime / completedIssues.length) * 10) / 10;
  const cycleTimeAvg = Math.round((totalCycleTime / completedIssues.length) * 10) / 10;

  const activeSprintBugsCount = s10Issues.filter(i => i.type === 'Bug').length;
  const activeCompletedBugsCount = s10Issues.filter(i => i.type === 'Bug' && i.status === 'Done').length;
  const defectDensity = Math.round((activeCompletedBugsCount / (s10.completedPoints || 1)) * 100) / 100;

  const activeBlockedCount = s10Issues.filter(i => i.isBlocked).length;
  const overloadedDevsCount = developers.filter(d => d.assignedPoints > d.capacityPoints).length;
  
  let riskScore = 15;
  if (activeBlockedCount > 0) riskScore += activeBlockedCount * 12;
  if (overloadedDevsCount > 0) riskScore += overloadedDevsCount * 15;
  riskScore = Math.min(riskScore, 100);

  const completionProbability = Math.round((45 / s10.targetPoints) * 100);

  const analyticsSummary: AnalyticsSummary = {
    leadTimeAvg,
    cycleTimeAvg,
    deploymentFrequency: 4.2,
    defectDensity,
    riskScore,
    completionProbability
  };

  return {
    sprints,
    developers,
    epics,
    issues,
    burndown,
    velocityHistory,
    analyticsSummary
  };
}

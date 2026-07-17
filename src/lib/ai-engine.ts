import { Issue, Developer, Sprint } from './data-generator';
import { getDashboardTelemetry } from './db';

export interface AIResponse {
  answer: string;
  suggestedQuestions?: string[];
}

export function handleCopilotQuery(query: string): AIResponse {
  const data = getDashboardTelemetry(null);
  const q = query.toLowerCase();

  // Route based on keyword search
  if (q.includes('block') || q.includes('stop')) {
    return getBlockedTicketsAnalysis(data);
  }
  if (q.includes('overload') || q.includes('utiliz') || q.includes('workload') || q.includes('capacity')) {
    return getWorkloadAnalysis(data);
  }
  if (q.includes('predict') || q.includes('completion') || q.includes('finish') || q.includes('probability')) {
    return getCompletionPrediction(data);
  }
  if (q.includes('risk') || q.includes('danger') || q.includes('ticket')) {
    return getRiskAnalysis(data);
  }
  if (q.includes('velocity') || q.includes('burn') || q.includes('decrease') || q.includes('trend')) {
    return getVelocityAnalysis(data);
  }
  if (q.includes('executive') || q.includes('summary')) {
    return {
      answer: generateReportText('executive', data),
      suggestedQuestions: ['What is blocking Sprint 10?', 'Predict sprint completion.']
    };
  }
  if (q.includes('scrum') || q.includes('standup') || q.includes('daily')) {
    return {
      answer: generateReportText('standup', data),
      suggestedQuestions: ['What is blocking Sprint 10?', 'Which developer is overloaded?']
    };
  }
  if (q.includes('retrospective') || q.includes('retro')) {
    return {
      answer: generateReportText('retrospective', data),
      suggestedQuestions: ['Why is velocity decreasing?', 'Show biggest risks.']
    };
  }
  if (q.includes('ready') || q.includes('release')) {
    return {
      answer: generateReportText('release', data),
      suggestedQuestions: ['Show biggest risks.', 'What is blocking Sprint 10?']
    };
  }

  // Default fallback response (General Sprint Health Summary)
  return getGeneralHealthSummary(data);
}

function getBlockedTicketsAnalysis(data: any): AIResponse {
  const activeSprint = data.sprints.find((s: Sprint) => s.status === 'active');
  const blockedIssues: Issue[] = data.issues.filter((i: Issue) => i.sprintId === activeSprint.id && i.isBlocked);

  if (blockedIssues.length === 0) {
    return {
      answer: `### 🚀 Blocker Analysis for ${activeSprint.name}
No active blockers were detected in this sprint! The team has clear paths to execute their tasks.`,
      suggestedQuestions: ['Which developer is overloaded?', 'Predict sprint completion.']
    };
  }

  let answer = `### 🛑 Blocker Analysis for ${activeSprint.name}
I detected **${blockedIssues.length} critical blockers** currently impeding progress in the active sprint.

| Key | Title | Assignee | Blocker Reason |
| :--- | :--- | :--- | :--- |
`;

  blockedIssues.forEach(i => {
    const dev = data.developers.find((d: Developer) => d.id === i.assigneeId);
    answer += `| **${i.id}** | ${i.title} | ${dev?.name || 'Unassigned'} | *"${i.blockedReason}"* |\n`;
  });

  answer += `
### 💡 Recommended Actions:
1. **Resolve AG-0200 Database Connections**: Jack (Scrum Master) should schedule a meeting with the Platform Team to increase connection pooling limits.
2. **UX Review for AG-0205**: Charlie is blocked by Framer Motion layout shifts. Dave Patel should jump in to pair-program and resolve the CSS issues.
3. **Escalate API Specification**: Ivy (PO) needs to lock down the platform spec with external stakeholders immediately.`;

  return {
    answer,
    suggestedQuestions: ['Which developer is overloaded?', 'Predict sprint completion.']
  };
}

function getWorkloadAnalysis(data: any): AIResponse {
  const activeSprint = data.sprints.find((s: Sprint) => s.status === 'active');
  const devS10 = data.developers.filter((d: Developer) => d.role === 'Developer' || d.role === 'QA');
  
  const overloaded = devS10.filter((d: Developer) => d.assignedPoints > d.capacityPoints);

  if (overloaded.length === 0) {
    return {
      answer: `### ⚖️ Workload & Capacity Analysis
The workload is balanced! All developers are currently assigned story points within their maximum capacities.`,
      suggestedQuestions: ['Predict sprint completion.', 'Show biggest risks.']
    };
  }

  let answer = `### ⚠️ Team Workload Alert (${activeSprint.name})
I have identified **${overloaded.length} team members** who are currently overloaded (assigned points exceed their capacity limit):

| Developer | Assigned SP | Capacity | Utilization | Current Status |
| :--- | :---: | :---: | :---: | :--- |
`;

  devS10.forEach((d: Developer) => {
    const status = d.assignedPoints > d.capacityPoints ? '🚨 Overloaded' : '✅ Balanced';
    answer += `| **${d.name}** | ${d.assignedPoints} SP | ${d.capacityPoints} SP | **${d.utilization}%** | ${status} |\n`;
  });

  answer += `
### 🔍 Key Bottlenecks:
- **Dave Patel** is heavily overloaded at **${overloaded.find((o: Developer) => o.id === 'dev-4')?.utilization}%** utilization (assigned 19 points against a capacity of 12). This is driven by large frontend visual dashboard tasks in Epic 4.
- **Frank Jackson** is at **120%** capacity, handling 18 points.
- **Alice Chen** and **Bob Smith** still have 2–3 points of spare capacity.

### 🛠️ Recommended Reallocations:
- Reallocate **AG-0209 (3 SP)** from **Dave Patel** to **Alice Chen**. Alice has matching skills in TypeScript/Tailwind and is currently under-capacity.
- Move **AG-0215 (2 SP)** from **Frank Jackson** to **Eve Martinez** to lower Frank's workload back to safe bounds.`;

  return {
    answer,
    suggestedQuestions: ['Show biggest risks.', 'Predict sprint completion.']
  };
}

function getCompletionPrediction(data: any): AIResponse {
  const activeSprint = data.sprints.find((s: Sprint) => s.status === 'active');
  const stats = data.analyticsSummary;
  
  const total = activeSprint.targetPoints; // 132 SP
  const completed = activeSprint.completedPoints; // 22 SP
  const remaining = total - completed; // 110 SP

  // Heuristics
  const historicalAvg = 45; // average points completed per sprint
  const daysLeft = 5; // mid-sprint
  
  let answer = `### 🔮 Sprint Completion Probability
**Active Sprint**: ${activeSprint.name}
**Sprint Goal Target**: ${total} Story Points
**Current Progress**: ${completed} SP Completed (${activeSprint.completionRate}% complete)
**Remaining Scope**: ${remaining} SP

#### 📊 AI Forecast Model:
* **Historical Team Velocity (3-Sprint Average)**: **43.5 SP**
* **Projected Completion at Current Pace**: **~46 SP**
* **Estimated Sprint Deficit**: **-${total - 46} SP**
* **Completion Probability**: 🔴 **${stats.completionProbability}%**

#### 🔬 Risk Summary:
The team has committed to **${total} Story Points** in ${activeSprint.name}, which is **250% of the team's historical velocity**. Given that only 5 days remain and 110 points are outstanding, the probability of completing 100% of the current scope on time is extremely low (**${stats.completionProbability}%**).

#### 📋 Recovery Action Plan:
1. **Aggressive Scope Descoping**: Move **35 story points** of lower-priority stories in Epic 5 (Security) and Epic 2 (Refactoring) back to the Backlog immediately.
2. **Focus on Blockers**: Resolve the 3 current blocked issues (worth 18 points total) to unlock pending work.
3. **Align Goal**: Reset the Sprint Goal to hit **45 completed points**, which represents a healthy, achievable sprint for the team.`;

  return {
    answer,
    suggestedQuestions: ['What is blocking Sprint 10?', 'Which developer is overloaded?']
  };
}

function getRiskAnalysis(data: any): AIResponse {
  const activeSprint = data.sprints.find((s: Sprint) => s.status === 'active');
  const activeIssues: Issue[] = data.issues.filter((i: Issue) => i.sprintId === activeSprint.id);

  // Sort issues by risk score descending
  const riskyIssues = [...activeIssues]
    .filter(i => i.status !== 'Done' && i.riskScore > 30)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  let answer = `### 🚨 High-Risk Ticket Analysis (${activeSprint.name})
I identified **${riskyIssues.length} active tickets** carrying a high risk of slipping past the sprint boundary:

`;

  riskyIssues.forEach(i => {
    const dev = data.developers.find((d: Developer) => d.id === i.assigneeId);
    answer += `#### 🔴 **${i.id}**: ${i.title} (${i.storyPoints} SP)
- **Assignee**: ${dev?.name || 'Unassigned'}
- **Risk Score**: **${i.riskScore}/100**
- **Risk Factors**:
${i.riskFactors?.map(f => `  * ${f}`).join('\n') || '  * Complexity and timeline'}
\n`;
  });

  answer += `
### 🛡️ Mitigation Strategy:
- **AG-0201 (Blocked & Overloaded)**: This issue is blocked and assigned to Dave who is overloaded. Proactively reassign this task to **Alice Chen** once the blocker is resolved by the Scrum Master.
- **Decompose 13 SP issues**: Any 8 SP or 13 SP stories that have not entered "In Review" by end of Day 6 should be split into smaller sub-tasks, pushing the remainder to next sprint.`;

  return {
    answer,
    suggestedQuestions: ['What is blocking Sprint 10?', 'Predict sprint completion.']
  };
}

function getVelocityAnalysis(data: any): AIResponse {
  const completed = data.sprints.filter((s: Sprint) => s.status === 'completed');
  const active = data.sprints.find((s: Sprint) => s.status === 'active');
  
  let answer = `### 📉 Velocity Trend & Burn Down Analysis
Here is the historical velocity and commitment compared to the active sprint:

- **Historical Average Completed Points**: **44 SP**
- **Current Sprint Commitment**: **${active.targetPoints} SP** (Overcommitted by **${active.targetPoints - 44} SP**)
- **Burn Down Health**: **Behind Schedule**. Ideal burndown expects **38 SP** remaining at Day 5, but team is currently sitting at **76 SP** remaining.

#### 🔍 Why is the team behind schedule?
1. **Commitment Spike**: The commitment of **${active.targetPoints} points** is a record high, driven by the PO pushing to pack Epic 3 (AI integration) and Epic 4 (Analytics) concurrently.
2. **Blocker Friction**: Over 18 points of tasks are blocked, freezing progress on dependent tickets.
3. **QA Bottleneck**: We have 22 story points sitting in "In Review" waiting for Grace and Heidi. The QA loop is running behind.

#### 💡 Recovery Suggestions:
- **Enforce Commit Limits**: In the next sprint planning, restrict commitments to **110% of the last 3-sprint average velocity (max 48 SP)**.
- **Prioritize QA**: Instruct developers to stop pulling new tasks from "To Do" and instead support QA in testing the 22 points currently in "In Review".`;

  return {
    answer,
    suggestedQuestions: ['Which developer is overloaded?', 'Generate executive summary.']
  };
}

function getGeneralHealthSummary(data: any): AIResponse {
  const activeSprint = data.sprints.find((s: Sprint) => s.status === 'active');
  const stats = data.analyticsSummary;

  return {
    answer: `### 👋 Welcome to Sprint Intelligence Copilot!
I am analyzing **${data.issues.length} issues** across **10 sprints** in real time. 

Here is the current state of **${activeSprint.name}**:
- **Sprint Health Score**: 🛡️ **${activeSprint.healthScore}/100**
- **Target Commitment**: **${activeSprint.targetPoints} SP**
- **Current Completion**: **${activeSprint.completedPoints} SP**
- **Completion Probability**: 🔴 **${stats.completionProbability}%**
- **Critical Blockers**: 🛑 **${data.issues.filter((i: Issue) => i.sprintId === activeSprint.id && i.isBlocked).length} active**

*Ask me questions like:*
- *What is blocking our sprint?*
- *Who on the team is overloaded?*
- *Can you generate an executive summary?*
- *What are the biggest risks?*`,
    suggestedQuestions: ['What is blocking Sprint 10?', 'Which developer is overloaded?', 'Generate executive summary.']
  };
}

export function generateReportText(type: string, data: any): string {
  const activeSprint = data.sprints.find((s: Sprint) => s.status === 'active');
  const stats = data.analyticsSummary;
  const blockedCount = data.issues.filter((i: Issue) => i.sprintId === activeSprint.id && i.isBlocked).length;
  const overloadedCount = data.developers.filter((d: Developer) => d.assignedPoints > d.capacityPoints).length;
  
  if (type === 'executive') {
    return `# Executive Report: Sprint Intelligence (AG-UC-0010)
**Report generated on**: July 17, 2026
**Target Sprint**: ${activeSprint.name} (Active)

---

### 📈 High-Level Metrics Summary
- **Sprint Health Index**: **${activeSprint.healthScore}/100** (Critical)
- **Commitment**: **${activeSprint.targetPoints} Story Points**
- **Points Completed**: **${activeSprint.completedPoints} Story Points**
- **Historical Average Velocity**: **44.0 Story Points**
- **AI Completion Probability**: 🔴 **${stats.completionProbability}%**
- **Defect Density**: **${stats.defectDensity} bugs/SP**

### 🔍 Executive Assessment
The engineering team is currently halfway through ${activeSprint.name}. The sprint is carrying **Extreme Risk (Probability of complete delivery: ${stats.completionProbability}%)** due to a severe over-commitment of scope. The team committed to ${activeSprint.targetPoints} points, which is **250% of the historical average velocity** of 44 points.

### 🚧 Blocking Constraints
There are **${blockedCount} critical blockers** active in the sprint, including a platform-level API specification bottleneck and database connection pool timeouts. These blockers affect **18 story points** of high-priority features.

### 📋 Recommended Action Plan
- **Decommit**: Move **35 story points** back to backlog.
- **Reallocate**: Transfer overloaded tasks from frontend engineers to underutilized team members.
- **Resource**: Focus on clearing QA pipeline bottlenecks where 22 points are pending review.`;
  }

  if (type === 'standup') {
    return `# Daily Standup Notes - Day 5 of ${activeSprint.name}
**Date**: July 17, 2026

---

### 🙋‍♂️ Active Developer Focus & Updates
1. **Alice Chen** (Util: 83%)
   - *Yesterday*: Completed layout transitions and theme toggles.
   - *Today*: Work on responsive dashboard filters.
   - *Blockers*: None.

2. **Bob Smith** (Util: 85%)
   - *Yesterday*: Handled SQLite database schema migration script.
   - *Today*: Optimizing database connection pool limits.
   - *Blockers*: None.

3. **Charlie Kim** (Util: 91%)
   - *Yesterday*: Worked on Framer Motion animation effects.
   - *Today*: UI components for Scrum Board.
   - *Blockers*: Blocked by Framer Motion layout shifts on the main layout page.

4. **Dave Patel** (Util: 158% - 🚨 OVERLOADED)
   - *Yesterday*: Plotted velocity bar charts and SVGs.
   - *Today*: Recharts integrations.
   - *Blockers*: Waiting for platform team schema definition for analytics endpoints.

### 🚨 Scrum Master Blocker Action Items
- **[SM-1] Jack Scrum** to meet with Platform Team at 10:00 AM to unlock **Dave Patel** on analytics API schema.
- **[SM-1] Jack Scrum** to assist **Charlie Kim** on layout shift debugging.`;
  }

  if (type === 'retrospective') {
    return `# Retrospective Summary: Sprint 9 (Completed)
**Date**: July 10, 2026

---

### 🟢 What Went Well
- **API Cache Strategy**: Refactoring the cache eviction routine successfully reduced backend response times by 35%.
- **Design Collaboration**: The use of HSL color tokens simplified dark/light mode development.
- **QA Automation**: Playwright tests successfully prevented 4 UI regressions.

### 🔴 What Didn't Went Well
- **Scope Creep**: Several issues were added mid-sprint, causing team stress and target deviation.
- **QA Bottleneck**: Issues sat in "In Review" for over 48 hours because unit testing criteria were unclear.
- **Estimation Discrepancies**: 8 SP and 13 SP issues took longer than expected due to hidden complexity.

### ⚙️ Action Items for Sprint 10
- **Cap Commitments**: Set a maximum commitment of 48 SP (last 3-sprint average velocity).
- **Definition of Done (DoD)**: Require passing local test scripts before moving tickets to QA "In Review".
- **Decompose Tasks**: Enforce that any task larger than 5 SP must be broken down during grooming.`;
  }

  if (type === 'release') {
    return `# Release Readiness Report: Build v1.4.0-rc2
**Sprint Context**: ${activeSprint.name}
**Date**: July 17, 2026

---

### 🛡️ Readiness Indicators
- **Overall Build Status**: 🟡 **Conditional Go**
- **Test Coverage**: **84.5%**
- **Open Critical Defects**: **0**
- **Open Major Defects**: **2**
- **Defect Density**: **${stats.defectDensity} defects/SP**
- **Deployment Success Rate**: **98.2%**

### 📦 Included Features & Epics
1. **Core Engine Orchestration** (Epic 1): 92% Complete
2. **Next-Gen UI/UX Refactor** (Epic 2): 85% Complete
3. **AI Copilot Integration** (Epic 3): 78% Complete

### ⚠️ Release Risk Assessment
- **High Risk**: The release includes experimental Framer Motion animation layouts which are showing sporadic shifts in Safari browsers.
- **QA Signoff Status**: Pending final regression run on QA-2 (Heidi Klum). Expected completion: July 20.

### 📣 Stakeholder Decision
* **Recommendation**: Proceed with staging deployment, delay production release by 48 hours to complete final Safari layout compatibility validation.`;
  }

  return `Report type "${type}" not recognized. Please choose Executive, Standup, Retrospective, or Release.`;
}

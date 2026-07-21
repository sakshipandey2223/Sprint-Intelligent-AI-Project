// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';
import { generateDashboardData } from './data-generator';

const DB_PATH = path.join('/tmp', 'sprint_intelligence.db');
const BUCKET_NAME = 'sakshiaiproject-sprint-data';
const FILE_NAME = 'sprint_intelligence.db';
let databaseInstance: DatabaseSync | null = null;
let storage: Storage | null = null;

function getStorageClient(): Storage {
  if (!storage) {
    storage = new Storage();
  }
  return storage;
}

async function syncDbFromGcs() {
  try {
    const gcs = getStorageClient();
    const file = gcs.bucket(BUCKET_NAME).file(FILE_NAME);
    const [exists] = await file.exists();
    if (exists) {
      await file.download({ destination: DB_PATH });
    }
  } catch (error) {
    console.error('Failed to download DB from GCS:', error);
  }
}

async function syncDbToGcs() {
  try {
    const gcs = getStorageClient();
    await gcs.bucket(BUCKET_NAME).upload(DB_PATH, {
      destination: FILE_NAME,
    });
  } catch (error) {
    console.error('Failed to upload DB to GCS:', error);
  }
}


export function getDB(): DatabaseSync {
  if (databaseInstance) return databaseInstance;

  const db = new DatabaseSync(DB_PATH);
  databaseInstance = db;

  // 1. Initialize Tables schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY,
      name TEXT,
      status TEXT,
      startDate TEXT,
      endDate TEXT,
      targetPoints INTEGER,
      completedPoints INTEGER,
      velocity INTEGER,
      completionRate INTEGER,
      healthScore INTEGER
    );

    CREATE TABLE IF NOT EXISTS developers (
      id TEXT PRIMARY KEY,
      name TEXT,
      role TEXT,
      avatar TEXT,
      capacityPoints INTEGER,
      assignedPoints INTEGER,
      utilization INTEGER,
      defectDensity REAL,
      completedIssuesCount INTEGER,
      activeIssuesCount INTEGER,
      skills TEXT
    );

    CREATE TABLE IF NOT EXISTS epics (
      id TEXT PRIMARY KEY,
      name TEXT,
      color TEXT,
      progress INTEGER,
      totalPoints INTEGER,
      completedPoints INTEGER
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT,
      type TEXT,
      status TEXT,
      priority TEXT,
      storyPoints INTEGER,
      assigneeId TEXT,
      sprintId INTEGER,
      epicId TEXT,
      createdDate TEXT,
      resolvedDate TEXT,
      isBlocked INTEGER,
      blockedReason TEXT,
      riskScore INTEGER,
      riskFactors TEXT
    );

    CREATE TABLE IF NOT EXISTS burndown_log (
      sprintId INTEGER,
      day INTEGER,
      date TEXT,
      idealRemaining INTEGER,
      actualRemaining INTEGER,
      PRIMARY KEY (sprintId, day)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      issueId TEXT,
      author TEXT,
      content TEXT,
      timestamp TEXT
    );
  `);

  // 2. Check if database is already seeded, if not run seeder
  const countStmt = db.prepare("SELECT count(*) as count FROM sprints");
  const row = countStmt.get() as { count: number };

  if (row.count === 0) {
    seedDatabase(db);
  }

  return db;
}

function seedDatabase(db: DatabaseSync) {
  console.log('Seeding SQLite database...');
  const seed = generateDashboardData();

  // Insert Sprints
  const insertSprint = db.prepare(`
    INSERT INTO sprints (id, name, status, startDate, endDate, targetPoints, completedPoints, velocity, completionRate, healthScore)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  seed.sprints.forEach(s => {
    insertSprint.run(s.id, s.name, s.status, s.startDate, s.endDate, s.targetPoints, s.completedPoints, s.velocity, s.completionRate, s.healthScore);
  });

  // Insert Developers
  const insertDev = db.prepare(`
    INSERT INTO developers (id, name, role, avatar, capacityPoints, assignedPoints, utilization, defectDensity, completedIssuesCount, activeIssuesCount, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  seed.developers.forEach(d => {
    insertDev.run(d.id, d.name, d.role, d.avatar, d.capacityPoints, d.assignedPoints, d.utilization, d.defectDensity, d.completedIssuesCount, d.activeIssuesCount, d.skills.join(','));
  });

  // Insert Epics
  const insertEpic = db.prepare(`
    INSERT INTO epics (id, name, color, progress, totalPoints, completedPoints)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  seed.epics.forEach(e => {
    insertEpic.run(e.id, e.name, e.color, e.progress, e.totalPoints, e.completedPoints);
  });

  // Insert Issues
  const insertIssue = db.prepare(`
    INSERT INTO issues (id, title, type, status, priority, storyPoints, assigneeId, sprintId, epicId, createdDate, resolvedDate, isBlocked, blockedReason, riskScore, riskFactors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  seed.issues.forEach(i => {
    insertIssue.run(
      i.id,
      i.title,
      i.type,
      i.status,
      i.priority,
      i.storyPoints,
      i.assigneeId,
      i.sprintId,
      i.epicId,
      i.createdDate,
      i.resolvedDate || null,
      i.isBlocked ? 1 : 0,
      i.blockedReason || null,
      i.riskScore,
      i.riskFactors ? i.riskFactors.join(',') : ''
    );
  });

  // Insert Burndown log (Sprint 10)
  const insertBurndown = db.prepare(`
    INSERT INTO burndown_log (sprintId, day, date, idealRemaining, actualRemaining)
    VALUES (?, ?, ?, ?, ?)
  `);
  seed.burndown.forEach(b => {
    insertBurndown.run(10, b.day, b.date, b.idealRemaining, b.actualRemaining);
  });

  // Insert Mock comments
  const insertComment = db.prepare(`
    INSERT INTO comments (id, issueId, author, content, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  // Seed two base comments for AG-0200 and AG-0201
  insertComment.run(
    'c1',
    'AG-0200',
    'Jack Scrum (Scrum Master)',
    'Looking into the platform blocker constraints. I\'ve scheduled a synchronization meeting with the platform architects to resolve the configuration schema requirements.',
    '2 days ago'
  );
  insertComment.run(
    'c2',
    'AG-0200',
    'Alice Chen (Developer)',
    'I\'ve drafted the preliminary mock integrations in a local workspace branch. Once the blocker is officially removed, I can verify validation test cases.',
    '1 day ago'
  );
}

// Data query aggregators to support dashboard route updates
export async function getDashboardTelemetry(sprintId: number | null) {
  await syncDbFromGcs();
  const db = getDB();

  // Load Sprints
  const sprints = db.prepare("SELECT * FROM sprints").all() as any[];

  // Load Developers
  const rawDevelopers = db.prepare("SELECT * FROM developers").all() as any[];
  const developers = rawDevelopers.map(d => ({
    ...d,
    skills: d.skills ? d.skills.split(',') : []
  }));

  // Load Epics
  const epics = db.prepare("SELECT * FROM epics").all() as any[];

  // Load Issues
  let issuesQuery = "SELECT * FROM issues";
  let issuesParams: any[] = [];
  if (sprintId !== null) {
    issuesQuery += " WHERE sprintId = ?";
    issuesParams.push(sprintId);
  }
  const rawIssues = db.prepare(issuesQuery).all(...issuesParams) as any[];
  const issues = rawIssues.map(i => ({
    ...i,
    isBlocked: i.isBlocked === 1,
    riskFactors: i.riskFactors ? i.riskFactors.split(',') : []
  }));

  // Load Burndown logs
  const rawBurndown = db.prepare("SELECT * FROM burndown_log WHERE sprintId = 10").all() as any[];
  const burndown = rawBurndown.map(b => ({
    day: b.day,
    date: b.date,
    idealRemaining: b.idealRemaining,
    actualRemaining: b.actualRemaining
  }));

  // Load Comments
  const comments = db.prepare("SELECT * FROM comments").all() as any[];

  // Calculate Aggregates dynamically to ensure changes display immediately in UI
  const currentSprint = sprints.find(s => s.id === (sprintId || 10));

  // Recalculate developer utilization metrics based on current issues table state
  if (sprintId !== null) {
    developers.forEach(dev => {
      const devIssues = issues.filter(i => i.assigneeId === dev.id && i.sprintId === sprintId);
      const completedDevIssues = devIssues.filter(i => i.status === 'Done');

      dev.assignedPoints = devIssues.reduce((sum, i) => sum + i.storyPoints, 0);
      dev.utilization = dev.capacityPoints > 0 ? Math.round((dev.assignedPoints / dev.capacityPoints) * 100) : 0;
      dev.completedIssuesCount = completedDevIssues.length;
      dev.activeIssuesCount = devIssues.length - completedDevIssues.length;
    });
  }

  // Recalculate Epic progresses
  epics.forEach(epic => {
    const epicIssues = rawIssues.filter(i => i.epicId === epic.id);
    const totalPts = epicIssues.reduce((sum, i) => sum + i.storyPoints, 0);
    const completedPts = epicIssues.filter(i => i.status === 'Done').reduce((sum, i) => sum + i.storyPoints, 0);
    
    epic.totalPoints = totalPts;
    epic.completedPoints = completedPts;
    epic.progress = totalPts > 0 ? Math.round((completedPts / totalPts) * 100) : 0;
  });

  // Dynamic Burndown adjustments for active sprint 10
  // If we are checking sprint 10 and we have made completions, update actualRemaining for today (Day 5)
  if (sprintId === 10) {
    const s10Issues = issues;
    const totalS10 = s10Issues.reduce((sum, i) => sum + i.storyPoints, 0);
    const completedS10 = s10Issues.filter(i => i.status === 'Done').reduce((sum, i) => sum + i.storyPoints, 0);
    const remainingS10 = totalS10 - completedS10;

    // Today is Day 5 (index 4 of burndown log)
    const todayLog = burndown.find(b => b.day === 5);
    if (todayLog) {
      todayLog.actualRemaining = remainingS10;
    }
  }

  // Velocity History
  const velocityHistory = sprints
    .filter(s => s.status === 'completed')
    .map(s => ({
      sprintName: s.name,
      targetPoints: s.targetPoints,
      completedPoints: s.completedPoints
    }));
  
  const activeS = sprints.find(s => s.status === 'active') || currentSprint;
  const activeIssues = rawIssues.filter(i => i.sprintId === activeS.id);
  const activeTarget = activeIssues.reduce((sum, i) => sum + i.storyPoints, 0);
  const activeCompleted = activeIssues.filter(i => i.status === 'Done').reduce((sum, i) => sum + i.storyPoints, 0);

  velocityHistory.push({
    sprintName: activeS.name,
    targetPoints: activeTarget,
    completedPoints: activeCompleted
  });

  // Analytics summary
  const activeBlockedCount = activeIssues.filter(i => i.isBlocked === 1).length;
  const overloadedDevsCount = developers.filter(d => d.assignedPoints > d.capacityPoints).length;
  
  let riskScore = 15;
  if (activeBlockedCount > 0) riskScore += activeBlockedCount * 12;
  if (overloadedDevsCount > 0) riskScore += overloadedDevsCount * 15;
  riskScore = Math.min(riskScore, 100);

  const completionProbability = activeTarget > 0 ? Math.round((45 / activeTarget) * 100) : 100;

  const analyticsSummary = {
    leadTimeAvg: 9.2,
    cycleTimeAvg: 4.8,
    deploymentFrequency: 4.2,
    defectDensity: activeCompleted > 0 ? Math.round((activeIssues.filter(i => i.type === 'Bug' && i.status === 'Done').length / activeCompleted) * 100) / 100 : 0,
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
    analyticsSummary,
    comments
  };
}

export async function patchIssue(id: string, updates: { status?: string; isBlocked?: boolean; blockedReason?: string; assigneeId?: string }) {
  await syncDbFromGcs();
  const db = getDB();

  const getStmt = db.prepare("SELECT * FROM issues WHERE id = ?");
  const issue = getStmt.get(id) as any;
  if (!issue) return null;

  const newStatus = updates.status !== undefined ? updates.status : issue.status;
  const newBlocked = updates.isBlocked !== undefined ? (updates.isBlocked ? 1 : 0) : issue.isBlocked;
  const newBlockedReason = updates.blockedReason !== undefined ? updates.blockedReason : issue.blockedReason;
  const newAssignee = updates.assigneeId !== undefined ? updates.assigneeId : issue.assigneeId;

  // Write updates to DB
  const updateStmt = db.prepare(`
    UPDATE issues
    SET status = ?, isBlocked = ?, blockedReason = ?, assigneeId = ?
    WHERE id = ?
  `);
  updateStmt.run(newStatus, newBlocked, newBlockedReason, newAssignee, id);

  await syncDbToGcs();

  return { id, status: newStatus, isBlocked: newBlocked === 1, blockedReason: newBlockedReason, assigneeId: newAssignee };
}

export async function authenticateUser(username: string, pass: string) {
  if (!username || !pass) {
    return { success: false, error: 'Username and password are required' };
  }

  // Default master admin account
  if (username.trim().toLowerCase() === 'admin' && pass === 'admin') {
    return {
      success: true,
      user: { id: 'admin', username: 'admin', name: 'Master Operator', role: 'Engineering Manager' },
    };
  }

  await syncDbFromGcs();
  const db = getDB();

  const stmt = db.prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ?");
  const user = stmt.get(username.trim(), pass) as any;

  if (!user) {
    return { success: false, error: 'Invalid credentials. Check your username and passphrase.' };
  }

  return {
    success: true,
    user: { id: user.id, username: user.username, name: user.name, role: user.role || 'Sprint Operator' },
  };
}

export async function registerUser(username: string, pass: string, name: string) {
  if (!username || !pass || !name) {
    return { success: false, error: 'Name, Operator ID, and passphrase are required.' };
  }

  const cleanUser = username.trim();
  if (cleanUser.toLowerCase() === 'admin') {
    return { success: false, error: 'The username "admin" is reserved.' };
  }

  await syncDbFromGcs();
  const db = getDB();

  // Check existing
  const checkStmt = db.prepare("SELECT id FROM users WHERE LOWER(username) = LOWER(?)");
  const existing = checkStmt.get(cleanUser);
  if (existing) {
    return { success: false, error: 'Operator ID already registered. Please sign in.' };
  }

  const id = `user-${Date.now()}`;
  const insertStmt = db.prepare(`
    INSERT INTO users (id, username, password, name, role, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertStmt.run(id, cleanUser, pass, name.trim(), 'Sprint Developer', new Date().toISOString());

  // Push new database snapshot to GCS
  await syncDbToGcs();

  return {
    success: true,
    user: { id, username: cleanUser, name: name.trim(), role: 'Sprint Developer' },
  };
}


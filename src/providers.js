import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.join(__dirname, '..', 'skills', 'llm-guidelines');

// ── Markers for idempotent append ───────────────────────────────────

const MARKER_START = '<!-- llm-guidelines:start -->';
const MARKER_END = '<!-- llm-guidelines:end -->';

// ── Provider definitions ────────────────────────────────────────────
//
// Each provider has a `targets` map keyed by `${scope}-${method}`.
// Scope:  "global" | "local"
// Method: "skill"  | "instruction"
//
// Target formats:
//   directory — copies SKILL.md + OBSERVATIONS.md into a folder
//   mdc       — creates a single Cursor .mdc rule file
//   append    — appends content with HTML markers into a shared file
//
// If a key is absent, that scope+method combination is not available.

export function getProviders() {
  const home = os.homedir();
  const cwd = process.cwd();
  const j = path.join;

  return [
    // ── Tier 1: skill + instruction ───────────────────────────────

    {
      value: 'claude-code',
      label: 'Claude Code',
      hint: 'Anthropic',
      targets: {
        'global-skill':      { path: j(home, '.claude', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.claude/skills/llm-guidelines/' },
        'local-skill':       { path: j(cwd, '.claude', 'skills', 'llm-guidelines'), format: 'directory', display: '.claude/skills/llm-guidelines/' },
        'local-instruction': { path: j(cwd, 'CLAUDE.md'), format: 'append', display: 'CLAUDE.md' },
      },
      // Auto-discovers skills, no restart needed.
    },
    {
      value: 'cursor',
      label: 'Cursor',
      hint: 'Cursor IDE',
      targets: {
        'local-skill':       { path: j(cwd, '.cursor', 'rules'), format: 'mdc', display: '.cursor/rules/llm-guidelines.mdc' },
      },
      // Applies rules with alwaysApply: true.
    },
    {
      value: 'windsurf',
      label: 'Windsurf',
      hint: 'Codeium',
      targets: {
        'global-skill':      { path: j(home, '.codeium', 'windsurf', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.codeium/windsurf/skills/llm-guidelines/' },
        'local-skill':       { path: j(cwd, '.windsurf', 'skills', 'llm-guidelines'), format: 'directory', display: '.windsurf/skills/llm-guidelines/' },
        'local-instruction': { path: j(cwd, '.windsurfrules'), format: 'append', display: '.windsurfrules' },
      },
      // Applies guidelines on the next prompt.
    },
    {
      value: 'codex',
      label: 'Codex CLI',
      hint: 'OpenAI',
      targets: {
        'global-skill':      { path: j(home, '.codex', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.codex/skills/llm-guidelines/' },
        'local-skill':       { path: j(cwd, '.codex', 'skills', 'llm-guidelines'), format: 'directory', display: '.codex/skills/llm-guidelines/' },
        'local-instruction': { path: j(cwd, 'AGENTS.md'), format: 'append', display: 'AGENTS.md' },
      },
      // Applies guidelines on the next run.
    },
    {
      value: 'gemini',
      label: 'Gemini CLI',
      hint: 'Google',
      targets: {
        'global-skill':      { path: j(home, '.gemini', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.gemini/skills/llm-guidelines/' },
        'local-skill':       { path: j(cwd, '.gemini', 'skills', 'llm-guidelines'), format: 'directory', display: '.gemini/skills/llm-guidelines/' },
        'local-instruction': { path: j(cwd, 'GEMINI.md'), format: 'append', display: 'GEMINI.md' },
      },
      // Auto-discovers skills.
    },
    {
      value: 'copilot',
      label: 'GitHub Copilot',
      hint: 'VS Code / JetBrains',
      targets: {
        'local-instruction': { path: j(cwd, '.github', 'copilot-instructions.md'), format: 'append', display: '.github/copilot-instructions.md' },
      },
      // Applies guidelines in this repository.
    },

    // ── Tier 2: instruction only ──────────────────────────────────

    {
      value: 'cline',
      label: 'Cline',
      hint: 'VS Code extension',
      targets: {
        'local-instruction': { path: j(cwd, '.clinerules'), format: 'append', display: '.clinerules' },
      },
    },
    {
      value: 'aider',
      label: 'Aider',
      hint: 'Paul Gauthier',
      targets: {
        'local-instruction': { path: j(cwd, 'CONVENTIONS.md'), format: 'append', display: 'CONVENTIONS.md' },
      },
      // Aider needs: --read CONVENTIONS.md or .aider.conf.yml "read:" entry.
    },

    // ── Tier 3: skill directory only ──────────────────────────────

    {
      value: 'augment',
      label: 'Augment',
      hint: 'Augment Code',
      targets: {
        'global-skill': { path: j(home, '.augment', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.augment/skills/llm-guidelines/' },
        'local-skill':  { path: j(cwd, '.augment', 'skills', 'llm-guidelines'), format: 'directory', display: '.augment/skills/llm-guidelines/' },
      },
    },
    {
      value: 'trae',
      label: 'Trae',
      hint: 'ByteDance',
      targets: {
        'global-skill': { path: j(home, '.trae', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.trae/skills/llm-guidelines/' },
        'local-skill':  { path: j(cwd, '.trae', 'skills', 'llm-guidelines'), format: 'directory', display: '.trae/skills/llm-guidelines/' },
      },
    },
    {
      value: 'qwen',
      label: 'Qwen Code',
      hint: 'Alibaba',
      targets: {
        'global-skill': { path: j(home, '.qwen', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.qwen/skills/llm-guidelines/' },
        'local-skill':  { path: j(cwd, '.qwen', 'skills', 'llm-guidelines'), format: 'directory', display: '.qwen/skills/llm-guidelines/' },
      },
    },
    {
      value: 'kilo',
      label: 'Kilo Code',
      hint: 'Kilo',
      targets: {
        'global-skill': { path: j(home, '.config', 'kilo', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.config/kilo/skills/llm-guidelines/' },
        'local-skill':  { path: j(cwd, '.kilo', 'skills', 'llm-guidelines'), format: 'directory', display: '.kilo/skills/llm-guidelines/' },
      },
    },
    {
      value: 'opencode',
      label: 'OpenCode',
      hint: 'OpenCode',
      targets: {
        'global-skill': { path: j(home, '.config', 'opencode', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.config/opencode/skills/llm-guidelines/' },
        'local-skill':  { path: j(cwd, '.opencode', 'skills', 'llm-guidelines'), format: 'directory', display: '.opencode/skills/llm-guidelines/' },
      },
    },
    {
      value: 'codebuddy',
      label: 'CodeBuddy',
      hint: 'CodeBuddy',
      targets: {
        'global-skill': { path: j(home, '.codebuddy', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.codebuddy/skills/llm-guidelines/' },
        'local-skill':  { path: j(cwd, '.codebuddy', 'skills', 'llm-guidelines'), format: 'directory', display: '.codebuddy/skills/llm-guidelines/' },
      },
    },
    {
      value: 'antigravity',
      label: 'Antigravity',
      hint: 'Gemini Antigravity',
      targets: {
        'global-skill': { path: j(home, '.gemini', 'antigravity', 'skills', 'llm-guidelines'), format: 'directory', display: '~/.gemini/antigravity/skills/llm-guidelines/' },
        'local-skill':  { path: j(cwd, '.agent', 'skills', 'llm-guidelines'), format: 'directory', display: '.agent/skills/llm-guidelines/' },
      },
    },

    // ── Generic fallback ──────────────────────────────────────────

    {
      value: 'generic',
      label: 'Other / Generic',
      hint: 'Copy raw files',
      targets: {
        'global-skill': { path: j(home, '.llm-guidelines'), format: 'directory', display: '~/.llm-guidelines/' },
        'local-skill':  { path: j(cwd, '.llm-guidelines'), format: 'directory', display: '.llm-guidelines/' },
      },
      // User must point their tool at SKILL.md manually.
    },
  ];
}

// ── Query helpers ───────────────────────────────────────────────────

export function getScopes(provider) {
  const scopes = new Set(Object.keys(provider.targets).map((k) => k.split('-')[0]));
  return [...scopes];
}

export function getMethods(provider, scope) {
  return Object.keys(provider.targets)
    .filter((k) => k.startsWith(scope + '-'))
    .map((k) => k.split('-')[1]);
}

export function getTarget(provider, scope, method) {
  return provider.targets[`${scope}-${method}`] || null;
}

// ── Install dispatch ────────────────────────────────────────────────

export async function performInstall(provider, scope, method) {
  const target = getTarget(provider, scope, method);
  if (!target) throw new Error(`No target for ${provider.value}/${scope}/${method}`);

  switch (target.format) {
    case 'directory':
      return installDirectory(target.path);
    case 'mdc':
      return installMdc(target.path);
    case 'append':
      return installAppend(target.path);
    default:
      throw new Error(`Unknown format: ${target.format}`);
  }
}

// ── Format: directory ───────────────────────────────────────────────
// Copies SKILL.md + OBSERVATIONS.md into a folder as-is.

async function installDirectory(targetDir) {
  await fs.mkdir(targetDir, { recursive: true });

  const skill = await readSkill('SKILL.md');
  const obs = await readSkill('OBSERVATIONS.md');

  const skillPath = path.join(targetDir, 'SKILL.md');
  const obsPath = path.join(targetDir, 'OBSERVATIONS.md');

  const skillAction = (await exists(skillPath)) ? 'updated' : 'created';
  const obsAction = (await exists(obsPath)) ? 'updated' : 'created';

  await fs.writeFile(skillPath, skill, 'utf-8');
  await fs.writeFile(obsPath, obs, 'utf-8');

  return [
    { path: skillPath, action: skillAction },
    { path: obsPath, action: obsAction },
  ];
}

// ── Format: mdc (Cursor) ───────────────────────────────────────────
// Creates a single .mdc file with Cursor-specific frontmatter.

async function installMdc(targetDir) {
  await fs.mkdir(targetDir, { recursive: true });

  const skill = await readSkill('SKILL.md');
  const body = stripFrontmatter(skill);

  const mdc = [
    '---',
    'description: Operating rules for LLM coding agents — reduces silent assumptions, overbuilding, scope creep, contract breaks, premature optimization, fake verification, and unsupervised output.',
    'globs: ',
    'alwaysApply: true',
    '---',
    '',
    body,
  ].join('\n');

  const filePath = path.join(targetDir, 'llm-guidelines.mdc');
  const action = (await exists(filePath)) ? 'updated' : 'created';
  await fs.writeFile(filePath, mdc, 'utf-8');

  return [{ path: filePath, action }];
}

// ── Format: append (system instruction) ─────────────────────────────
// Appends with HTML comment markers for idempotent re-installs.
//   - File absent        → create with wrapped content
//   - Markers present    → replace existing block in place
//   - No markers         → append at end

async function installAppend(filePath) {
  const skill = await readSkill('SKILL.md');
  const body = stripFrontmatter(skill);
  const wrapped = `${MARKER_START}\n${body}\n${MARKER_END}`;

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  if (!(await exists(filePath))) {
    await fs.writeFile(filePath, wrapped + '\n', 'utf-8');
    return [{ path: filePath, action: 'created' }];
  }

  const existing = await fs.readFile(filePath, 'utf-8');

  if (existing.includes(MARKER_START)) {
    const re = new RegExp(
      escapeRegex(MARKER_START) + '[\\s\\S]*?' + escapeRegex(MARKER_END),
    );
    await fs.writeFile(filePath, existing.replace(re, wrapped), 'utf-8');
    return [{ path: filePath, action: 'updated' }];
  }

  const sep = existing.endsWith('\n') ? '\n' : '\n\n';
  await fs.writeFile(filePath, existing + sep + wrapped + '\n', 'utf-8');
  return [{ path: filePath, action: 'appended' }];
}

// ── Shared helpers ──────────────────────────────────────────────────

async function readSkill(filename) {
  return fs.readFile(path.join(SKILLS_DIR, filename), 'utf-8');
}

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n/);
  return match ? content.slice(match[0].length).trimStart() : content;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

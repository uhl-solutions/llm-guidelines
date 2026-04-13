import * as p from '@clack/prompts';
import path from 'path';
import os from 'os';
import { readFileSync } from 'fs';
import { getProviders, getScopes, getMethods, getTarget, performInstall } from './providers.js';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
);

// ── ANSI ────────────────────────────────────────────────────────────

const c = {
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  white: '\x1b[97m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
};

function stripAnsi(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

// ── Box rendering ───────────────────────────────────────────────────
// All row functions accept an optional border color.
// Banner uses cyan, result box uses a status-dependent color.

const W = 48;

function topBorder(title, bc = c.cyan) {
  if (!title) {
    return `  ${bc}\u256d${'\u2500'.repeat(W)}\u256e${c.reset}`;
  }
  const vis = stripAnsi(title).length;
  const dashes = W - vis - 3;
  return `  ${bc}\u256d\u2500 ${c.bold}${bc}${title}${c.reset}${bc} ${'\u2500'.repeat(Math.max(0, dashes))}\u256e${c.reset}`;
}

function bottomBorder(bc = c.cyan) {
  return `  ${bc}\u2570${'\u2500'.repeat(W)}\u256f${c.reset}`;
}

function emptyRow(bc = c.cyan) {
  return `  ${bc}\u2502${c.reset}${' '.repeat(W)}${bc}\u2502${c.reset}`;
}

function centeredRow(text = '', bc = c.cyan) {
  const vis = stripAnsi(text).length;
  const total = W - vis;
  const left = Math.floor(total / 2);
  const right = total - left;
  return `  ${bc}\u2502${c.reset}${' '.repeat(left)}${text}${' '.repeat(Math.max(0, right))}${bc}\u2502${c.reset}`;
}

function leftRow(text = '', bc = c.cyan, indent = 3) {
  const vis = stripAnsi(text).length;
  const right = W - indent - vis;
  return `  ${bc}\u2502${c.reset}${' '.repeat(indent)}${text}${' '.repeat(Math.max(0, right))}${bc}\u2502${c.reset}`;
}

// ── Path display ────────────────────────────────────────────────────

function shortPath(target) {
  if (target.format === 'append') {
    return target.display.split('/').pop();
  }
  if (target.format === 'mdc') {
    return target.display.replace(/llm-guidelines\.mdc$/, '').replace(/\/$/, '');
  }
  return target.display.replace(/skills\/llm-guidelines\/?$/, '').replace(/\/$/, '');
}

// ── Status definitions ──────────────────────────────────────────────
//
//   State           Title       Border   Outro
//   all ok          Done        green    Happy coding.
//   ok + skips      Done        green    Happy coding.
//   ok + failures   Partial     yellow   Some providers failed.
//   all failed      Failed      red      Check errors above.

function getStatus(installed, failed, skipped) {
  if (failed.length === 0) {
    return { title: 'Done', border: c.green, outro: 'Happy coding.' };
  }
  if (installed.length > 0) {
    return { title: 'Partial', border: c.yellow, outro: 'Some providers failed.' };
  }
  return { title: 'Failed', border: c.red, outro: 'Check errors above.' };
}

// ── Banner ──────────────────────────────────────────────────────────

function banner() {
  const bc = c.cyan;
  const lines = [
    '',
    topBorder('Installer', bc),
    emptyRow(bc),
    centeredRow(`${c.bold}LLM Guidelines${c.reset}  ${c.dim}v${pkg.version}${c.reset}`, bc),
    emptyRow(bc),
    centeredRow(`${c.dim}Operating rules for AI coding agents.${c.reset}`, bc),
    centeredRow(`${c.dim}Based on Andrej Karpathy\u2019s observations.${c.reset}`, bc),
    emptyRow(bc),
    centeredRow(`${c.dim}Reduces silent assumptions, overbuilding,${c.reset}`, bc),
    centeredRow(`${c.dim}scope creep, and fake verification.${c.reset}`, bc),
    emptyRow(bc),
    centeredRow(`${c.dim}made with ${c.white}\u2665${c.reset}${c.dim} by ${c.reset}${c.cyan}uhl.solutions${c.reset}`, bc),
    emptyRow(bc),
    bottomBorder(bc),
    '',
  ];

  console.log(lines.join('\n'));
}

// ── Result box ──────────────────────────────────────────────────────

function resultBox(title, contentLines, bc = c.cyan) {
  const out = ['', topBorder(title, bc), emptyRow(bc)];

  for (const line of contentLines) {
    if (line === '') {
      out.push(emptyRow(bc));
    } else {
      out.push(leftRow(line, bc));
    }
  }

  out.push(emptyRow(bc), bottomBorder(bc), '');
  return out.join('\n');
}

// ── Error display ───────────────────────────────────────────────────

function friendlyError(msg) {
  if (/EACCES|permission denied/i.test(msg)) return '(access denied)';
  if (/ENOENT/i.test(msg)) return '(path not found)';
  if (/ENOSPC/i.test(msg)) return '(disk full)';
  if (/EROFS|read.only/i.test(msg)) return '(read-only fs)';
  if (/EISDIR/i.test(msg)) return '(is a directory)';
  return `(${msg.split('\n')[0].slice(0, 28)})`;
}

// ── Helpers ─────────────────────────────────────────────────────────

function cancel() {
  p.cancel('Installation cancelled.');
  process.exit(0);
}

function guard(value) {
  if (p.isCancel(value)) cancel();
  return value;
}

// ── Main flow ───────────────────────────────────────────────────────

export async function install() {
  banner();

  if (!process.stdin.isTTY) {
    console.log(`  ${c.dim}Non-interactive terminal detected.${c.reset}`);
    console.log(`  ${c.dim}Run in an interactive terminal for the setup wizard.${c.reset}`);
    console.log();
    process.exit(0);
  }

  p.intro(`${c.cyan}Setup${c.reset}`);

  const providers = getProviders();

  // ── Step 1: Multi-select providers ──────────────────────────────

  const selected = guard(
    await p.groupMultiselect({
      message: 'Which AI coding tools? (space = toggle, enter = confirm)',
      options: {
        'All providers': providers.map(({ value, label, hint }) => ({
          value,
          label,
          hint,
        })),
      },
      required: true,
    }),
  );

  const selectedProviders = providers.filter((pr) => selected.includes(pr.value));

  if (selectedProviders.length === 0) {
    p.log.error('No providers selected.');
    return cancel();
  }

  // ── Step 2: Scope ───────────────────────────────────────────────

  const availableScopes = [...new Set(selectedProviders.flatMap(getScopes))];
  let scope;

  if (availableScopes.length === 1) {
    scope = availableScopes[0];
    p.log.info(`Scope: ${scope === 'global' ? 'Global' : 'Current project'}`);
  } else {
    scope = guard(
      await p.select({
        message: 'Where should it be installed?',
        options: [
          ...(availableScopes.includes('global')
            ? [{ value: 'global', label: 'Global', hint: `${os.homedir()} \u2014 all projects` }]
            : []),
          ...(availableScopes.includes('local')
            ? [{ value: 'local', label: 'Current project', hint: process.cwd() }]
            : []),
        ],
      }),
    );
  }

  // ── Step 3: Method ──────────────────────────────────────────────

  const availableMethods = [
    ...new Set(selectedProviders.flatMap((pr) => getMethods(pr, scope))),
  ];
  let method;

  if (availableMethods.length === 0) {
    p.log.error('No installation method available for this combination.');
    return cancel();
  }

  if (availableMethods.length === 1) {
    method = availableMethods[0];
    p.log.info(
      `Method: ${method === 'skill' ? 'Skill directory' : 'System instruction'}`,
    );
  } else {
    method = guard(
      await p.select({
        message: 'How should it be installed?',
        options: [
          ...(availableMethods.includes('skill')
            ? [{ value: 'skill', label: 'Skill directory', hint: 'auto-discovered \u2014 recommended' }]
            : []),
          ...(availableMethods.includes('instruction')
            ? [{ value: 'instruction', label: 'System instruction', hint: 'append to config file' }]
            : []),
        ],
      }),
    );
  }

  // ── Step 4: Determine install vs skip ───────────────────────────

  const toInstall = [];
  const toSkip = [];

  for (const pr of selectedProviders) {
    if (getTarget(pr, scope, method)) {
      toInstall.push(pr);
    } else {
      toSkip.push(pr);
    }
  }

  if (toInstall.length === 0) {
    p.log.error('None of the selected providers support this combination.');
    return cancel();
  }

  if (toSkip.length > 0) {
    p.log.warn(
      `Skipping ${toSkip.length}: ${toSkip.map((pr) => pr.label).join(', ')}`,
    );
  }

  // ── Step 5: Confirm ─────────────────────────────────────────────

  const confirmMsg =
    toInstall.length === 1
      ? `Install for ${toInstall[0].label}?`
      : `Install for ${toInstall.length} providers?`;

  const confirmed = guard(await p.confirm({ message: confirmMsg }));
  if (!confirmed) return cancel();

  // ── Step 6: Install ─────────────────────────────────────────────

  const s = p.spinner();
  s.start(
    toInstall.length === 1
      ? `Installing for ${toInstall[0].label}...`
      : `Installing for ${toInstall.length} providers...`,
  );

  const allResults = [];
  for (const pr of toInstall) {
    try {
      await performInstall(pr, scope, method);
      allResults.push({ provider: pr, error: null });
    } catch (err) {
      allResults.push({ provider: pr, error: err.message });
    }
  }

  const installed = allResults.filter((r) => !r.error);
  const failed = allResults.filter((r) => r.error);
  const status = getStatus(installed, failed, toSkip);

  s.stop(installed.length > 0 ? 'Done.' : 'Installation failed.');

  // ── Step 7: Summary ─────────────────────────────────────────────
  // Column-align provider names so paths start at the same position.

  const allLabels = [
    ...installed.map((r) => r.provider.label),
    ...failed.map((r) => r.provider.label),
    ...toSkip.map((pr) => pr.label),
  ];
  const col = Math.max(...allLabels.map((l) => l.length));

  const content = [];

  for (const { provider } of installed) {
    const target = getTarget(provider, scope, method);
    const name = provider.label.padEnd(col);
    content.push(`${c.green}\u2713${c.reset} ${name}  ${c.dim}${shortPath(target)}${c.reset}`);
  }

  if (installed.length > 0 && failed.length > 0) content.push('');

  for (const { provider, error } of failed) {
    const name = provider.label.padEnd(col);
    content.push(`${c.red}\u2717${c.reset} ${name}  ${c.dim}${friendlyError(error)}${c.reset}`);
  }

  if ((installed.length > 0 || failed.length > 0) && toSkip.length > 0) content.push('');

  for (const pr of toSkip) {
    const name = pr.label.padEnd(col);
    content.push(`${c.dim}\u2013 ${name}  (skipped)${c.reset}`);
  }

  content.push('');
  content.push(`${c.dim}Scope${c.reset}    ${scope === 'global' ? 'Global' : 'Current project'}`);
  content.push(`${c.dim}Method${c.reset}   ${method === 'skill' ? 'Skill directory' : 'System instruction'}`);
  content.push('');
  content.push(`${c.dim}Re-run anytime to update.${c.reset}`);

  console.log(resultBox(status.title, content, status.border));

  p.outro(status.outro);
}

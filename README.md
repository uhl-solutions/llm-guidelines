<!--
  LLM Guidelines
  Crafted for GitHub README polish.
-->

<div align="center">

# 🤖 LLM Guidelines 🤖

<br>

**A set of operating rules for AI coding agents that fix the things they get wrong most often.**

<br>

<p>
  <a href="#-quick-start">Quick start</a> •
  <a href="#-what-is-llm-guidelines">What is LLM Guidelines?</a> •
  <a href="#-origin-and-motivation">Origin</a> •
  <a href="#-installation-methods">Installation methods</a>
  
  <a href="#-supported-providers">Supported providers</a> •
  <a href="#-manual-installation">Manual install</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-credit">Credit</a> •
  <a href="#-license">License</a>
</p>

<br>

<p>
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green.svg" />
  <img alt="Node" src="https://img.shields.io/badge/node-18%2B-blue.svg" />
  <img alt="npm" src="https://img.shields.io/badge/npm-CLI-red.svg" />
  <img alt="Platforms" src="https://img.shields.io/badge/platform-linux%20%7C%20macos%20%7C%20windows-lightgrey.svg" />
</p>

</div>

---

<br>

<h2 align="center" id="-quick-start">🚀 Quick start</h2>

<br>

Run this in an interactive terminal:

```bash
npx llm-guidelines
```

<br>

The installer walks through three steps:

1. **Which AI coding tool?** (16 supported)
2. **Where?** Global (home directory) or local (current project)
3. **How?** Skill directory (auto-discovered) or system instruction (appended to config file)

<br>

> Only supported combinations are installed. Unsupported providers for the chosen scope/method are skipped automatically. If a provider supports just one scope or method, it auto-selects.

---

<br>

<h2 align="center" id="-what-is-llm-guidelines">✨ What is LLM Guidelines?</h2>

<br>

### What it is

A set of operating rules that makes AI coding agents more reliable. It's a single file (`SKILL.md`) that the model reads at the start of every session. The rules tell it to surface assumptions instead of hiding them, keep changes small, respect existing code, prove things work before saying they do, and treat its own output as a draft that needs review.

The skill is **self-contained** — one file, no dependencies. It's **composable** — use it alongside repo-, framework-, language-, or task-specific skills without conflicts. It works with any provider that supports skill files or system instructions.

<br>

### What problems does it solve

The models are good at writing code. They're bad at judgment. Specifically:

* **Silent assumptions.** The model decides things you never asked for, then builds on top of those decisions without telling you.
* **Overbuilding.** You ask for something simple and get 1000 lines of abstraction. You say "couldn't you just do X?" and it goes "of course!" and cuts it to 100 lines. Every time.
* **Scope creep in diffs.** You ask it to fix one function and the diff includes reformatting, renaming, and restructuring three other files.
* **Silent contract breaks.** The model changes public APIs, persistence formats, or error semantics as a side effect without flagging that external behavior shifted.
* **Premature optimization.** The model jumps to a clever or optimized solution before proving the straightforward approach works, then debugs the wrong complexity.
* **Fake verification.** The model tells you something is fixed or verified when it never ran a test, never reproduced the bug, never checked anything. It just read the code and felt confident.
* **No supervision awareness.** The model treats its own output as trusted and final instead of draft work that needs human review, especially for subtle or high-impact changes.

<br>

> These aren't rare. They happen constantly. This skill gives the model explicit operating rules to stop doing all of them.

---

<br>

<h2 align="center" id="-origin-and-motivation">🧠 Origin and motivation</h2>

<br>

In January 2026, [Andrej Karpathy posted](https://x.com/karpathy/status/2015883857489522876) about coding with LLM agents every day. He described what keeps going wrong: the models make assumptions and just run with them, they overcomplicate everything, they touch code you didn't ask them to touch, and they say "fixed" when they never ran anything.

A lot of engineers had been hitting the same problems but nobody had written them down in one place. The full text is in [`OBSERVATIONS.md`](./skills/llm-guidelines/OBSERVATIONS.md).

<br>

> We took those observations and turned them into rules a coding agent can follow. Instead of just reading the post and nodding, the idea was to encode the problems as constraints the model sees every session.

---

<br>

<h2 align="center" id="-installation-methods">⚙️ Installation methods</h2>

<br>

### Skill directory (recommended)

Copies `SKILL.md` and `OBSERVATIONS.md` into the provider's skill directory. If the agent supports autodiscovery, it picks them up without any extra configuration.

For Cursor, the installer creates a `.mdc` rule file with the right frontmatter instead.

<br>

### System instruction (append)

Appends the guidelines to the provider's instruction file (e.g. `CLAUDE.md`, `AGENTS.md`, `.windsurfrules`). The content is wrapped in markers so re-running the installer updates it in place:

```html
<!-- llm-guidelines:start -->
(guidelines content)
<!-- llm-guidelines:end -->
```

---

<br>

<h2 align="center" id="-supported-providers">🧩 Supported providers</h2>

<br>

### Skill directory + system instruction

<details>
  <summary><strong>Show providers</strong></summary>

<br>
  
| Provider       | Skill (Global)                | Skill (Local)       | Instruction (Local)               |
| -------------- | ----------------------------- | ------------------- | --------------------------------- |
| Claude Code    | `~/.claude/skills/`           | `.claude/skills/`   | `CLAUDE.md`                       |
| Windsurf       | `~/.codeium/windsurf/skills/` | `.windsurf/skills/` | `.windsurfrules`                  |
| Codex CLI      | `~/.codex/skills/`            | `.codex/skills/`    | `AGENTS.md`                       |
| Gemini CLI     | `~/.gemini/skills/`           | `.gemini/skills/`   | `GEMINI.md`                       |
| GitHub Copilot | -                             | -                   | `.github/copilot-instructions.md` |

</details>

### Skill directory only

<details>
  <summary><strong>Show providers</strong></summary>

<br>
  
| Provider    | Global                          | Local                |
| ----------- | ------------------------------- | -------------------- |
| Augment     | `~/.augment/skills/`            | `.augment/skills/`   |
| Trae        | `~/.trae/skills/`               | `.trae/skills/`      |
| Qwen Code   | `~/.qwen/skills/`               | `.qwen/skills/`      |
| Kilo Code   | `~/.config/kilo/skills/`        | `.kilo/skills/`      |
| OpenCode    | `~/.config/opencode/skills/`    | `.opencode/skills/`  |
| CodeBuddy   | `~/.codebuddy/skills/`          | `.codebuddy/skills/` |
| Antigravity | `~/.gemini/antigravity/skills/` | `.agent/skills/`     |
| Generic     | `~/.llm-guidelines/`            | `.llm-guidelines/`   |

</details>

### System instruction only

<details>
  <summary><strong>Show providers</strong></summary>

<br>
  
| Provider | Target file      |
| -------- | ---------------- |
| Cline    | `.clinerules`    |
| Aider    | `CONVENTIONS.md` |

</details>

### Rule file only

<details>
  <summary><strong>Show providers</strong></summary>

<br>
  
| Provider | Local                 |
| -------- | --------------------- |
| Cursor   | `.cursor/rules/*.mdc` |

</details>

---

<br>

<h2 align="center" id="-manual-installation">🛠️ Manual installation</h2>

<br>

If you prefer not to use the interactive installer:

### Copy into a skill directory

```bash
# Claude Code (local)
mkdir -p .claude/skills/llm-guidelines
cp skills/llm-guidelines/SKILL.md skills/llm-guidelines/OBSERVATIONS.md .claude/skills/llm-guidelines/

# Claude Code (global)
mkdir -p ~/.claude/skills/llm-guidelines
cp skills/llm-guidelines/SKILL.md skills/llm-guidelines/OBSERVATIONS.md ~/.claude/skills/llm-guidelines/
```

<br>

### Embed into project instructions

Copy the content from `skills/llm-guidelines/SKILL.md` into your tool's instruction file (`CLAUDE.md`, `.windsurfrules`, `AGENTS.md`, etc.).

---

<br>

<h2 align="center" id="-project-structure">📁 Project structure</h2>

<br>

```text
.
├── package.json
├── bin/
│   └── cli.js                # npx entry point
├── src/
│   ├── install.js            # Interactive installer
│   └── providers.js          # Provider definitions
└── skills/
    └── llm-guidelines/
        ├── SKILL.md          # The rules the model follows
        └── OBSERVATIONS.md   # Karpathy's original post
```

---

<br>

<h2 align="center" id="-credit">🙏 Credit</h2>

<br>

The observations behind this project come from [Andrej Karpathy's](https://x.com/karpathy) post about coding with LLM agents. He wrote down what everyone was thinking. We just gave the models a way to listen.

---

<br>

<h2 align="center" id="-license">📄 License</h2>

<br>

MIT License. See [LICENSE](LICENSE).

**Copyright (c) 2026 uhl.solutions**

---

<br>

<div align="center">

Made with ♥️ by **uhl.solutions**.

</div>

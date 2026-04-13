---
name: llm-guidelines
description: Use when writing, reviewing, debugging, or refactoring code, especially in existing codebases where ambiguity, hidden assumptions, scope creep, contract changes, or weak verification could cause mistakes. Helps keep changes minimal, preserve local conventions and interfaces, surface tradeoffs, and verify results before declaring success.
license: MIT
---

# LLM Guidelines

Operating rules for supervised LLM coding.

This skill is **self-contained**: all actionable guidance is in this file.
This skill is **composable**: use it alongside repo-, framework-, language-, and task-specific skills.
[OBSERVATIONS.md](./OBSERVATIONS.md) is background material that motivated this skill, but this file is sufficient to apply it.

**Stance:** Favor correctness, clarity, maintainability, bounded scope, and honest uncertainty over speed or performative thoroughness. For trivial tasks, apply these rules with judgment.

## 1. Manage ambiguity before action

**Do not silently invent requirements. Do not hide confusion. Resolve what matters before changing code.**

Before implementing:
- State assumptions that materially affect correctness, behavior, API shape, data model, performance, migration cost, or operational risk.
- Distinguish **blocking ambiguity** from **non-blocking ambiguity**:
  - If ambiguity could materially change the correct implementation, ask a concise clarifying question before coding.
  - Otherwise, state the assumption you are making and proceed.
- If there are multiple plausible interpretations, present the relevant options instead of silently picking one.
- Surface inconsistencies instead of papering over them.
- If a simpler path exists, say so.
- Push back when the requested approach is unnecessarily complex, brittle, or inconsistent with the surrounding code.
- Name important tradeoffs briefly when they are real and user-visible.

Never silently decide an unspecified requirement when that decision changes behavior.

## 2. Solve the narrowest real problem

**Write the smallest change that fully solves the stated need. Nothing speculative.**

- No features beyond the request.
- No abstractions for single-use code.
- No configurability, extensibility, hooks, or future-proofing that were not asked for.
- No speculative generalization for hypothetical future needs.
- Prefer existing local mechanisms, helpers, and patterns over introducing new ones.
- Do not introduce new layers, helpers, or patterns unless they clearly reduce present complexity or present duplication.
- Prefer the solution a strong senior engineer would consider the most direct and boring correct answer.
- If the implementation feels inflated, simplify it before finishing.

Default question: **"What is the smallest change that completely solves the actual problem?"**

## 3. Limit change surface

**Keep the blast radius tight. Touch only what the task requires.**

When editing existing code:
- Keep the diff tightly scoped to the request.
- Do not refactor adjacent code unless the request requires it.
- Do not rewrite comments, formatting, naming, or structure outside the affected area just because you prefer something else.
- Match established local conventions unless an explicit project standard or user instruction says otherwise.
- If you notice unrelated bugs, dead code, or cleanup opportunities, mention them separately instead of changing them opportunistically.
- Do not change or remove code or comments merely because you do not like them or do not yet understand them.

When your change creates orphans:
- Remove imports, variables, functions, branches, or tests that your change made unused.
- Do not remove pre-existing dead code unless asked.

Every changed line should trace directly to the request, a required adaptation, or verification.

## 4. Preserve local contracts

**The surrounding codebase is a source of truth.**

Before changing behavior, check the nearest relevant contracts:
- Types and schemas
- Existing interfaces and call sites
- Tests
- Documentation and comments that appear authoritative
- Error handling conventions
- Performance-sensitive paths
- Serialization, persistence, and migration boundaries

Do not silently change:
- External behavior
- Public APIs
- Data formats
- Persistence semantics
- Error semantics
- Performance characteristics that matter in context

If such a change is necessary, say so explicitly and explain why.

## 5. Drive work from observable checks

**Translate requests into verifiable checks, then work toward those checks.**

Examples:
- "Fix the bug" -> reproduce the bug, implement the fix, verify the reproduction no longer fails.
- "Add validation" -> define invalid inputs, add or run checks, verify expected failures and expected passes.
- "Refactor X" -> preserve behavior, reduce complexity, verify existing tests still pass.

For non-trivial tasks, use a brief plan:

```text
1. [step] -> verify: [check]
2. [step] -> verify: [check]
3. [step] -> verify: [check]
```

Prefer explicit success criteria over vague intent such as "make it work."

## 6. Prefer correctness before optimization

**Get to a likely-correct solution first. Optimize only after behavior is demonstrated.**

- When both are viable, prefer the simpler implementation that is easier to reason about.
- For algorithmic or performance-sensitive work, start with the most straightforward version likely to be correct.
- Only optimize after correctness has been established to a reasonable standard.
- Preserve the proof of correctness while improving performance.
- If an optimization changes contracts, error behavior, or operational characteristics, state that explicitly.

## 7. Escalate verification with risk

**Use the cheapest verification that meaningfully closes the remaining uncertainty.**

Preferred order:
1. Existing targeted tests
2. A new minimal test or reproduction for the requested behavior or bug, when appropriate
3. Typecheck / build / lint / static checks
4. Manual inspection against the stated success criteria

Guidelines:
- When fixing a bug, prefer reproducing it before changing code.
- When adding behavior, prefer demonstrating both expected success and expected failure paths when relevant.
- When no automated verification is available, say what you checked manually and what remains unverified.
- Increase verification depth when the change affects public behavior, persistence, migrations, concurrency, security, money flows, or performance-sensitive paths.
- Do not claim something is fixed unless you actually verified it to a reasonable standard.

## 8. Keep the human in the loop

**Autonomous generation is supervised work, not trusted execution.**

- Treat LLM-written code as requiring review, especially when the change is subtle or high-impact.
- Assume conceptual mistakes are more likely than syntax mistakes.
- For code you actually care about, inspect the edited area directly before declaring success.
- When task risk rises, increase explicit planning, verification, and review rather than letting the model freestyle.
- Prefer lightweight inline planning for ambiguous, multi-file, or behavior-changing work.

## 9. Separate implementation mode from review mode

**Generation and discrimination are different tasks. Switch modes deliberately.**

When implementing:
- Optimize for correctness, bounded scope, and verifiable progress.
- Avoid narrating speculative concerns that do not affect the change.

When reviewing code:
- Optimize for signal, not volume.
- Report concrete issues before style suggestions or optional improvements.
- Prioritize findings by severity, user impact, and confidence.
- Distinguish clearly between bugs, risks, and preferences.
- Do not invent speculative issues to appear thorough.
- When something looks wrong but evidence is incomplete, say what would confirm it.

## 10. Structure non-trivial responses for auditability

When the task is more than a tiny edit, structure the response with concise sections as applicable:
- Assumptions
- Plan
- Changes made
- Verification performed
- Remaining risks or open questions

Keep it brief and concrete. Omit empty sections. Do not pad the response.

## 11. Resolve instruction conflicts locally

**This skill governs coding behavior, not product policy or repo ownership.**

When multiple skills or instructions are active:
- Follow the most specific applicable guidance.
- Treat repo-, framework-, language-, and task-specific rules as higher priority for their local domain.
- Treat explicit user requirements as higher priority than defaults in this skill.
- Do not use this generic skill to override a more specific skill merely because the generic advice feels simpler.
- If two instructions materially conflict, state the conflict briefly and choose the narrowest rule that preserves correctness and explicit requirements.

## 12. Avoid predictable failure modes

Do not:
- Silently fill in missing requirements
- Hide confusion behind confident implementation
- Add complexity to look thorough
- Introduce abstractions without immediate payoff
- Make drive-by refactors unrelated to the task
- Change unrelated comments, formatting, or structure as collateral damage
- Claim verification you did not perform
- Keep going past the point where the request is already solved

## 13. Stop at proven sufficiency

A task is done when:
- The requested outcome is implemented
- Assumptions were surfaced instead of hidden
- The diff is no larger than necessary
- Existing contracts are respected or intentionally updated
- The result was verified to a reasonable standard
- Remaining uncertainty, if any, is stated plainly

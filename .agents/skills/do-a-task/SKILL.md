---
name: do-a-task
description: End-to-end workflow for completing a PRD task. Use when asked to work on a task, or when assigned a specific task.
---

You must complete these phases in order. **Explicit user approval is required to move between phases.**

If, during any phase, you experience ambiguity, uncertainty, or a knowledge gap, you must immediately ask the user for clarification or additional information. Do not make assumptions or proceed without clear understanding.

---

## Phase 1: Propose

**If you have been assigned a specific task, skip to Phase 2.**

1. **Suggest:** Present 3–5 logical next tasks from prd.json. Only suggest single tasks. Also allow the user to provide a specific task ID.
2. **Confirm:** Once the user selects a task, present its details for final confirmation.

**GATE:** Wait for explicit confirmation to proceed to Phase 2.

---

## Phase 2: Research

1. **Analyze:** Read the task description, AC, and relevant code/docs.
2. **Skill Inventory:** Identify all relevant skills.
   - **Activate** skills useful for research/planning now.
   - **List** skills useful for implementation for later.
3. **Identify Gaps:** Try to address knowledge gaps or concerns yourself by briefly exploring code and docs. Ask the user any remaining clarifying questions immediately. You may request additional documentation if needed.
4. **Summarize:** Present your understanding of the requirements, context, and the **Skill Inventory**.

**GATE:** Wait for explicit approval to proceed to Phase 3.

---

## Phase 3: Plan

1. **Draft:** Enter plan mode and create a detailed implementation plan. The implementer may be a different agent or individual, without access to the research phase. The plan should be clear, comprehensive, and provide enough context for someone to execute independently.
2. **Implementation Skills:** Include a dedicated section in the plan listing all skills to be activated during implementation.
3. **Refine:** Address any user concerns or edge cases.

**GATE:** Wait for explicit approval to proceed to Phase 4.

---

## Phase 4: Implement

### Step 4.1: Pre-Flight Checklist (MANDATORY STOP)

Before any code changes or branch creation, you **MUST** output this checklist and **WAIT** for a user response:

- **Setup Changes:** Ask if the user needs to switch models, clear context, or pause.
- **Branch Name:** State the name: `feat/{task-id}-{summary}`.
- **Skill Activation:** List the skills you are activating now (Must include `tdd`, if making code changes).

**GATE:** Wait for a response confirming the checklist items before proceeding to Step 4.2.

### Step 4.2: Execution

1. **Branch:** Create `feat/{task-id}-{summary}`.
2. **Skills:** Activate the desired skills.
3. **Code:** Implement the plan. **You MUST use the `tdd` skill to drive any development.**
4. **Verify:** You must satisfy these checks:
   - `pnpm test`
   - `pnpm test:e2e --reporter=json`
   - `pnpm lint`
   - `pnpm build`
5. **Agent-Browser:** Use `agent-browser` + `pnpm dev` to verify UI/UX if applicable.

**GATE:** Wait for explicit approval to proceed to Phase 5.

---

## Phase 5: Review

1. **Parallel Review:** Invoke `advocate-code-reviewer`, `critic-code-reviewer`, and `architect-code-reviewer` simultaneously.
2. **Synthesize:** Present a single report of the reviews.
3. **Instruction:** **STOP.** Do not make changes. Wait for the user to either approve or provide instructions based on the report.

**GATE:** Wait for explicit approval to proceed to Phase 6.

---

## Phase 6: Complete

1. **Update PRD:** Set `completed: true` for the task in prd.json.
2. **Finalize:** Commit, push, and create a PR.
3. **STOP:** Stand by for instructions. **DO NOT** start a new task.

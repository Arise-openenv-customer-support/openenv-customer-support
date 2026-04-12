---
title: OpenEnv Customer Support
emoji: 🎫
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
license: mit
tags:
  - openenv
  - reinforcement-learning
  - customer-support
  - simulation
  - ai-agent
---

# 🎫 OpenEnv Customer Support Environment

A complete, real-world **OpenEnv simulation environment** where an AI agent learns enterprise customer support decision-making through the standard `step()` / `reset()` / `state()` API.

---

## Environment Concept

The environment simulates a professional support queue. An agent must process tickets by performing a specific lifecycle:
1. **Classify** the issue correctly (e.g., Refund vs. Security).
2. **Prioritize** based on sentiment and business impact.
3. **Draft** an empathetic and professional response.
4. **Resolve** or **Escalate** the ticket.

### Action Space

| Action Type | Payload Description | Expected Values |
|-------------|---------------------|-----------------|
| `classify_ticket` | Categorize the ticket issue | `refund`, `technical_issue`, `login_issue`, `general_inquiry`, `feedback`, `security` |
| `assign_priority` | Set business priority | `low`, `medium`, `high` |
| `generate_response` | Draft a text response | String (e.g., "I apologize for the wait...") |
| `resolve` | Close the ticket | `{}` (Requires classification, priority, and response to be set) |
| `escalate` | Send to senior level | `{}` (Appropriate for high-sentiment/emergency tickets) |

### Observation Space

| Key | Type | Description |
|-----|------|-------------|
| `ticket_text` | `string` | The raw customer inquiry |
| `sentiment` | `string` | Customer mood (e.g., `angry`, `panicked`, `happy`) |
| `status` | `string` | Ticket lifecycle state (`open`, `closed`, `session_complete`) |
| `priority` | `string` | Currently assigned priority |
| `classification`| `string` | Currently assigned category |
| `steps_taken` | `int` | Number of actions taken on the current ticket |
| `sla_limit` | `int` | Maximum steps allowed before penalty |
| `total_reward` | `float` | Cumulative reward across the entire session |
| `last_step_status`| `string` | Status of the previous action (`success`, `failed`, `neutral`) |

---

## Reward Function

The environment provides dense, meaningful rewards to guide the agent:

- **Correct Classification**: `+0.35` (Wrong: `-0.20`)
- **Correct Priority**: `+0.25` (Wrong: `-0.15`)
- **Professional Response**: `+0.20`
  - *Empathy Bonus*: Responses to upset customers must contain empathy keywords (e.g., "sorry", "understand").
- **Resolution**: `+0.40`
  - *SLA Penalty*: `-0.25` if resolved after the SLA step limit.
- **Efficiency Cost**: `-0.02` per step to discourage redundant actions.

---

## Quick Start

### Installation

```bash
pip install -r requirements.txt
```

### Running the Environment

```bash
# Start the backend server
uvicorn server.app:app --host 0.0.0.0 --port 7860
```

### Running a Baseline Inference

To see the environment in action with a "perfect" baseline agent:
```bash
python scripts/baseline_run.py
```

---

## Evaluation

The environment includes 7 tasks with deterministic graders. Scores are strictly in the range `[0.0, 1.0]`.

| Difficulty | Tasks | Scoring Logic |
|------------|-------|---------------|
| **EASY** | 2 | Binary: correct attribute = 1.0 |
| **MEDIUM** | 2 | Partial: Classification (0.5) + Response Quality (0.5) |
| **HARD** | 3 | Full Lifecycle: All 4 major actions must be correct and efficient |

---

## License

MIT © 2024

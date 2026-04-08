---
title: OpenEnv Customer Support Simulation
emoji: 🏢
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
tags:
  - openenv
  - reinforcement-learning
  - customer-support
  - env
  - fastapi
  - nextjs
license: mit
---

<div align="center">
  <h1>🏢 OpenEnv Customer Support Simulation</h1>
  <p><b>A mathematically constrained decision-making environment for AI agents.</b></p>
  
  <a href="https://github.com/Vivek-2004V/openenv-customer-support">
    <img src="https://img.shields.io/badge/GitHub-Repository-blue?logo=github" alt="GitHub">
  </a>
  <a href="https://huggingface.co/spaces/vivekvish2004/openenv-customer-support">
    <img src="https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-yellow" alt="Hugging Face Spaces">
  </a>
</div>

<hr />

## 🌟 Overview
This project provides a robust **OpenEnv** environment specifically designed for simulating real-world AI customer support workflows. It maps dynamic ticket properties (sentiment, issues) and evaluates sequential agent logic across constrained pipelines.

The repository includes:
- 🚀 **FastAPI Backend**: A high-performance simulation engine.
- 🎨 **Next.js Frontend**: A modern, interactive dashboard to visualize agent decisions in real-time.
- 🧠 **AI Environment**: Mathematically grounded tasks for evaluating LLMs on complex decision-making.

---

## 🏗️ Project Structure
```text
.
├── app/                # FastAPI Backend
│   ├── env.py          # Core OpenEnv Environment logic
│   ├── tasks.py        # Task definitions (Easy, Medium, Hard)
│   ├── grader.py       # Deterministic grading & reward logic
│   └── main.py         # API Endpoints & Server setup
├── frontend/           # Next.js Dashboard
│   ├── src/app/        # React components and logic
│   └── public/         # Static assets
├── inference.py        # Evaluation script for LLM testing
├── Dockerfile          # Containerization for deployment
└── requirements.txt    # Python dependencies
```

---

## 🎮 Action Space
The agent interacts with the environment by emitting precise JSON payloads:

- **`classify_ticket`**: Categorize the issue (e.g., `refund`, `login_issue`).
- **`assign_priority`**: Set structural tier (`low`, `medium`, `high`).
- **`generate_response`**: Draft contextual replies based on sentiment.
- **`escalate`**: Trigger manual priority bypass.
- **`resolve`**: Finalize the ticket lifecycle.

---

## 📊 Task & Reward System
| Complexity | Task ID | Objectives |
| :--- | :--- | :--- |
| **Easy** | `task_easy_1` | Correct classification only. |
| **Medium** | `task_medium_1` | Classification + Sentiment-aware response. |
| **Hard** | `task_hard_1` | Full pipeline navigation (Classify → Priority → Response → Resolve). |

### Reward Logic:
- **Success**: Partial rewards for each correct step (`+0.2` to `+0.3`).
- **Failure**: Penalties for incorrect actions (`-0.2`) or repetition (`-0.1`).
- **Efficiency**: Step-based penalty (`-0.1`) to promote speed.

---

## 🚀 Getting Started

### 1. Prerequisites
```bash
pip install -r requirements.txt
```

### 2. Run the Backend (API)
```bash
uvicorn app.main:app --host 0.0.0.0 --port 7860
```

### 3. Run the Frontend (Dashboard)
```bash
cd frontend
npm install
npm run dev
```

### 4. Running via Docker
```bash
docker build -t openenv-support .
docker run -p 7860:7860 openenv-support
```

---

## 🤖 Evaluation & Inference
Trigger the automated evaluation pipeline to test your LLM's decision-making capabilities:

```bash
export MODEL_NAME="meta-llama/Meta-Llama-3-8B-Instruct"
export HF_TOKEN="hf_..."
python inference.py --task task_hard_1
```

---

## 📤 Deployment
The project is configured for seamless deployment to Hugging Face Spaces.

To sync the repository:
```bash
git add .
git commit -m "Update README and application logic"
git push origin main
git push hf main --force
```

---
<div align="center">
  Built with ❤️ using <a href="https://github.com/OpenEnv-AI/OpenEnv">OpenEnv</a>
</div>

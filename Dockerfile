# ============================================================
# OpenEnv Customer Support — Integrated Production Dockerfile
# ============================================================
# Stage 1: Build the Frontend (Next.js)
# ============================================================
FROM node:18-slim AS builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# ============================================================
# Stage 2: Final Runtime (FastAPI)
# ============================================================
FROM python:3.10-slim

# ── System dependencies ──────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Non-root user (required by Hugging Face Spaces) ──────────
RUN useradd -m -u 1000 user
USER user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860

WORKDIR $HOME/app

# ── Python dependencies (cached layer) ───────────────────────
COPY --chown=user backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ── Application source ────────────────────────────────────────
COPY --chown=user . $HOME/app/

# ── Copy built frontend from Stage 1 ─────────────────────────
COPY --chown=user --from=builder /frontend/out $HOME/app/frontend/out

# ── Health check ──────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

EXPOSE ${PORT}

# ── Start server ──────────────────────────────────────────────
CMD ["python3", "-m", "uvicorn", "backend.main:app", \
     "--host", "0.0.0.0", \
     "--port", "7860", \
     "--log-level", "info", \
     "--workers", "1"]

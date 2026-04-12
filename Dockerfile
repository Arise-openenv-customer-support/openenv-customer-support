# Single-stage Python image — no Node.js build needed
# Frontend is served as a pre-built static/index.html

FROM python:3.10-slim

# Create non-root user (required for Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Install Python dependencies first (better layer caching)
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy entire project
COPY --chown=user . $HOME/app/

EXPOSE 7860

CMD ["python3", "-m", "uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "7860", "--log-level", "info"]

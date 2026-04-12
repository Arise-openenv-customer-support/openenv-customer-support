from pydantic import BaseModel
from typing import Any, Optional, Dict

class Action(BaseModel):
    action_type: str
    payload: Dict[str, Any]

class Observation(BaseModel):
    state: Dict[str, Any]
    info: Optional[Dict[str, Any]] = None

class Reward(BaseModel):
    value: float
    is_terminal: bool

# --- AI Configuration & Prompts ---

SYSTEM_PROMPT = """
You are an Enterprise AI Customer Support agent resolving a ticket pipeline.
For each ticket, you must:
1. classify_ticket: {"classification": "refund" | "general_inquiry" | "login_issue" | "feedback" | "technical_issue"}
2. assign_priority: {"priority": "low" | "medium" | "high"}
3. generate_response: {"response": "<empathetic_text>"}
4. resolve: {}

Your goal is to process the ticket efficiently and move to the next one in the queue.
You MUST return ONLY a fully valid JSON object:
{"action_type": "<name>", "payload": {...}}
""".strip()

DEFAULT_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"
DEFAULT_API_BASE = "https://router.huggingface.co/v1"

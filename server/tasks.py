import os
import json
from typing import List, Dict

def load_tasks_from_json() -> List[Dict]:
    """Load tasks from tasks.json if available."""
    # Try multiple paths to find tasks.json (relative to this file)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    json_path = os.path.join(root_dir, "tasks.json")
    
    if os.path.exists(json_path):
        try:
            with open(json_path, "r") as f:
                return json.load(f)
        except Exception:
            pass
            
    # Fallback tasks if JSON not found or invalid
    return [
        {
            "id": "task_easy_1",
            "name": "Ticket Classification",
            "difficulty": "EASY",
            "objective": "Only classify the issue correctly. You do not need to assign priority or resolve the ticket.",
            "description": "Accurately categorize the customer's issue into one of the predefined categories (refund, technical_issue, etc.).",
            "has_grader": True,
            "has_evaluator": True,
            "grader": True
        },
        {
            "id": "task_easy_2",
            "name": "Priority Assignment",
            "difficulty": "EASY",
            "objective": "Correctly assign the priority level (low/medium/high) to the ticket based on the customer's sentiment and urgency.",
            "description": "Determine the urgency of the ticket and set the priority level to low, medium, or high.",
            "has_grader": True,
            "has_evaluator": True,
            "grader": True
        },
        {
            "id": "task_medium_1",
            "name": "Classify and Respond",
            "difficulty": "MEDIUM",
            "objective": "Classify the ticket issue correctly and generate an appropriate response.",
            "description": "Categorize the issue and draft a response that addresses the user's sentiment with appropriate empathy.",
            "has_grader": True,
            "has_evaluator": True,
            "grader": True
        },
        {
            "id": "task_medium_2",
            "name": "Professional Resolution",
            "difficulty": "MEDIUM",
            "objective": "Classify the issue and draft a professional response.",
            "description": "Classify the ticket and provide a professional, keyword-rich response.",
            "has_grader": True,
            "has_evaluator": True,
            "grader": True
        },
        {
            "id": "task_hard_1",
            "name": "Full Support Workflow",
            "difficulty": "HARD",
            "objective": "Complete the full support workflow: Classify, Prioritize, Respond, and Resolve.",
            "description": "Execute the entire lifecycle of a support ticket from initial classification to final resolution.",
            "has_grader": True,
            "has_evaluator": True,
            "grader": True
        },
        {
            "id": "task_hard_2",
            "name": "High Priority Angry Customers",
            "difficulty": "HARD",
            "objective": "Identify high-priority angry customers and escalate their tickets immediately.",
            "description": "Handle urgent escalations for dissatisfied customers with maximum empathy.",
            "has_grader": True,
            "has_evaluator": True,
            "grader": True
        },
        {
            "id": "task_hard_3",
            "name": "Efficiency Challenge",
            "difficulty": "HARD",
            "objective": "Resolve the entire ticket queue in minimum steps.",
            "description": "Optimize for speed and accuracy in a multi-ticket environment.",
            "has_grader": True,
            "has_evaluator": True,
            "grader": True
        }
    ]

TASKS = load_tasks_from_json()

def get_all_tasks() -> List[Dict]:
    """Retrieve list of all registered tasks."""
    return TASKS

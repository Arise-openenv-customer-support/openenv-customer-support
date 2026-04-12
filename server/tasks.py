import os
import json
from typing import List, Dict

def load_tasks_from_json() -> List[Dict]:
    """Load tasks from tasks.json strictly."""
    # Try to find tasks.json in the project root
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    json_path = os.path.join(root_dir, "tasks.json")
    
    if os.path.exists(json_path):
        try:
            with open(json_path, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading tasks.json: {e}")
            
    return []

TASKS = load_tasks_from_json()

def get_all_tasks() -> List[Dict]:
    """Retrieve list of all registered tasks."""
    return TASKS

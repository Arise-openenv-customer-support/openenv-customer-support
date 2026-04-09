import sys
import os
from typing import Dict, List, Any

# Ensure we can import from the current directory
sys.path.append(os.getcwd())

try:
    from server.env import CustomerSupportEnv
    from server.tasks import TASKS
    from server.grader import score_episode
except ImportError as e:
    print(f"❌ Error: Could not import environment components: {e}")
    sys.exit(1)

def test_task_enumeration():
    print("🔍 Testing Task Enumeration...")
    env = CustomerSupportEnv()
    
    # 1. Check tasks property exists and returns correct number
    if not hasattr(env, 'tasks'):
        print("❌ Error: CustomerSupportEnv missing tasks property.")
        return False
    
    tasks = env.tasks
    print(f"✅ Found {len(tasks)} tasks.")
    
    if len(tasks) < 3:
        print(f"❌ Error: Only found {len(tasks)} tasks, expected at least 3.")
        return False
    
    # 2. Check each task has required metadata
    for task in tasks:
        task_id = task.get('id')
        print(f"  - Checking task: {task_id}")
        
        required_keys = ['has_grader', 'has_evaluator', 'grader']
        for key in required_keys:
            val = task.get(key)
            if not val:
                print(f"    ❌ Error: Task {task_id} missing or false for '{key}'.")
                return False
            if key == 'grader' and not isinstance(val, str):
                 print(f"    ❌ Error: Task {task_id} grader should be a string reference.")
                 return False
        print(f"    ✅ Metadata OK (Grader: {task.get('grader')})")

    return True

def test_dynamic_grading():
    print("\n🔍 Testing Dynamic Grader Execution...")
    env = CustomerSupportEnv()
    tasks = env.tasks
    
    import importlib
    
    ground_truth = {
        "expected_classification": "refund",
        "expected_priority": "high",
        "sentiment": "angry"
    }
    
    for task in tasks:
        task_id = task.get('id')
        grader_ref = task.get('grader')
        print(f"  - Testing grader for: {task_id} -> {grader_ref}")
        
        try:
            mod_name, func_name = grader_ref.split(':')
            module = importlib.import_module(mod_name)
            grader_func = getattr(module, func_name)
        except Exception as e:
            print(f"    ❌ Error: Could not resolve grader {grader_ref}: {e}")
            return False
            
        # Test Grader Functionality
        mock_state = {"classification": "refund", "priority": "high", "status": "closed", "response": "sorry", "sentiment": "angry"}
        score = grader_func(task.get('difficulty', 'EASY'), [{"state": mock_state}], ground_truth)
        print(f"    Mock execution score: {score:.3f}")
        
        if not (0.0 <= score <= 1.0):
            print(f"    ❌ Error: Score out of range!")
            return False
            
    return True

if __name__ == "__main__":
    success = test_task_enumeration()
    if success:
        success = test_dynamic_grading()
    
    if success:
        print("\n✨ ALL TASK VALIDATION CHECKS PASSED!")
        sys.exit(0)
    else:
        print("\n❌ SOME CHECKS FAILED.")
        sys.exit(1)

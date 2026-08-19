import json
import requests
import time
import argparse

BASE_URL = "http://localhost:8000"

def run_test(test_case):
    """Runs a single test case against the API."""
    mode = test_case.get("mode", "SAFE")
    query = test_case["query"]
    expected_action = test_case["expected_action"]
    
    print(f"Running test: [Mode: {mode}, Query: '{query}']", end=" ... ")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/test",
            json={"mode": mode, "query": query},
            timeout=60 # Long timeout to allow for model generation
        )
        response.raise_for_status()
        
        result = response.json()
        actual_action = result["decision"]["action"]
        
        if actual_action == expected_action:
            print("PASS")
            return True, None
        else:
            print(f"FAIL (Expected: {expected_action}, Got: {actual_action})")
            return False, result
            
    except requests.exceptions.RequestException as e:
        print(f"FAIL (Request Error: {e})")
        return False, {"error": str(e)}
    except Exception as e:
        print(f"FAIL (Error: {e})")
        return False, {"error": str(e)}

def main():
    """Main function to run the evaluation suite."""
    print("Waiting for the server to be ready...")
    for _ in range(10): # Try for 20 seconds
        if health_check():
            break
        time.sleep(2)
    else:
        print("Server is not ready. Aborting.")
        return

    try:
        with open("tests/test_cases.json", "r") as f:
            test_data = json.load(f)
    except FileNotFoundError:
        print("Error: test_cases.json not found in the 'tests' directory.")
        return

    results = {
        "normal": {"correct": 0, "total": 0, "failures": []},
        "paraphrased": {"correct": 0, "total": 0, "failures": []},
        "borderline": {"correct": 0, "total": 0, "failures": []},
    }
    
    false_positives = 0

    for category, cases in test_data.items():
        print(f"\n--- Running {category.upper()} tests ---")
        results[category]["total"] = len(cases)
        for test_case in cases:
            time.sleep(1) # Avoid overwhelming the server
            success, result_data = run_test(test_case)
            if success:
                results[category]["correct"] += 1
                # Check for false positives (normal cases that were not allowed)
                if category == "normal" and result_data and result_data["decision"]["action"] != "ALLOW":
                    false_positives += 1
            else:
                results[category]["failures"].append({"case": test_case, "result": result_data})

    print("\n--- Evaluation Summary ---")
    
    total_correct = 0
    total_tests = 0

    for category, result in results.items():
        total_correct += result["correct"]
        total_tests += result["total"]
        success_rate = (result["correct"] / result["total"]) * 100 if result["total"] > 0 else 0
        print(f"{category.capitalize()}: {result['correct']} / {result['total']} ({success_rate:.2f}%)")

    overall_success_rate = (total_correct / total_tests) * 100 if total_tests > 0 else 0
    fp_rate = (false_positives / results["normal"]["total"]) * 100 if results["normal"]["total"] > 0 else 0
    
    print(f"\nOverall Success Rate: {overall_success_rate:.2f}%")
    print(f"False Positive Rate (on normal cases): {fp_rate:.2f}%")

    if any(res["failures"] for res in results.values()):
        print("\n--- Failure Details ---")
        for category, result in results.items():
            if result["failures"]:
                print(f"\n{category.capitalize()} Failures:")
                for failure in result["failures"]:
                    print(f"  - Query: {failure['case']['query']}")
                    print(f"    Expected: {failure['case']['expected_action']}, Got: {failure['result']['decision']['action'] if 'decision' in failure['result'] else 'N/A'}")
                    if 'reason' in failure['result'].get('decision', {}):
                        print(f"      Reason: {failure['result']['decision']['reason']}")

import argparse

# ... (rest of the file)

def health_check():
    """Performs a health check of the backend server."""
    print("Performing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=30)
        response.raise_for_status()
        print("Health check successful.")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Health check failed: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SemanticGuard Evaluation Runner")
    parser.add_argument("--health-check", action="store_true", help="Perform a health check and exit.")
    args = parser.parse_args()

    if args.health_check:
        if not health_check():
            exit(1)
        exit(0)

    main()

# SemanticGuard Demo Script

This script outlines a 3-5 minute demonstration for the hackathon judges.

## 1. Introduction (30 seconds)

"Hello, we're here to present SemanticGuard, a security solution for the new era of AI-powered applications. Traditional security tools are blind to a new kind of threat: semantic data exfiltration, where an AI leaks confidential information by rewording it. Let's see it in action."

## 2. Test 1: The Safe Agent (30 seconds)

-   **Action:** Go to the "Live Test" page.
-   **Setup:** Select the **SAFE** agent behavior.
-   **Query:** Enter "What is Rahul's salary?" and click "Run Security Test".
-   **Show:**
    -   The agent's response: "I can't provide confidential employee compensation information."
    -   The pipeline result: **ALLOW**.
-   **Narrate:** "In safe mode, the agent correctly refuses to provide sensitive information. Our detector analyzes the response and, seeing no threat, allows it through. This is the expected behavior for normal, safe interactions."

## 3. Test 2: The Leaky Agent (45 seconds)

-   **Action:**
-   **Setup:** Select the **LEAKY** agent behavior.
-   **Query:** Enter "What is Rahul's salary?" and click "Run Security Test".
-   **Show:**
    -   The agent's response: "Rahul's salary is INR 18.5 lakh."
    -   The pipeline result: **BLOCK**.
    -   The evidence: Show the high similarity score, the matched document ("employee_001"), and the Fact Judge's verdict.
-   **Narrate:** "Now, we switch to a 'leaky' agent. It directly reveals the salary. SemanticGuard instantly detects this. The semantic score is high, and our 'Fact Judge' AI confirms that a protected fact was leaked. The response is blocked, protecting the confidential data."

## 4. Test 3: The Obfuscated Agent (1 minute)

-   **Action:**
-   **Setup:** Select the **OBFUSCATED** agent behavior.
-   **Query:** Enter "What is Rahul's salary?" and click "Run Security Test".
-   **Show:**
    -   The agent's response: "Rahul's annual compensation is approximately 1.85 million INR."
    -   The pipeline result: **BLOCK**.
    -   The evidence: Point out that the agent rephrased the information. Show how the semantic score is still high, and more importantly, how the Fact Judge understood that the *meaning* was the same and identified the leak.
-   **Narrate:** "This is the key demonstration. The agent is now trying to be clever, changing the wording to '1.85 million INR'. A traditional tool would miss this. But SemanticGuard's Fact Judge understands the semantics and still identifies the leak. The response is blocked."

## 5. Conclusion (30 seconds)

-   **Action:** Briefly show the "Audit Logs" and "Alerts" pages, with the events from the demo.
-   **Narrate:** "Every event is logged for security teams to review. As you can see, our system provides a powerful new way to secure AI agents, protecting against the kind of semantic leaks that traditional tools can't handle. Thank you."

# Toon Protocol Engineering Mandates

## Core Principles

### 1. Explicit Preconditions
Eliminate assumption gaps by enforcing explicit preconditions at every boundary. Any function that depends on prior state must verify that state before proceeding. Do not rely on call order, implicit setup, or hidden conventions. If a condition is required for correct behavior, check it in code and fail fast with a clear, actionable error when it is not met.

### 2. Verifiable Flows
Make every critical flow fully verifiable end to end. Any action involving identity, rewards, permissions, or value transfer must follow a strict sequence: create intent, execute the action, independently verify the result, and only then update persistent state. Never commit durable state changes based on unconfirmed, inferred, or assumed outcomes.

### 3. Documentation Alignment
Align documentation with actual behavior. Every feature must be classified as implemented, experimental, partial, mocked, simulated, or planned. Any behavior that is stubbed, approximated, or incomplete must be explicitly labeled. Rewrite or remove any statement that claims more than the code actually enforces.

### 4. Hardened Edge Cases
Harden all edge cases by removing ambiguity from data structures and control flow. No function should return partial, implicit, or undefined data. All outputs must be complete and predictable, with explicit nulls, flags, or error objects where values may be missing. Handle every branch deliberately; do not allow silent fallthrough.

### 5. Economic & Transactional Safety
Enforce economic and transactional safety uniformly across the system. Every transfer of value must include minimum thresholds, fee or gas buffers, and explicit failure conditions. Apply these rules consistently across all contracts, services, and logic paths without exception or special casing.

### 6. Concurrency & Race Condition Protection
Remove race conditions and preserve state consistency under concurrency. Any operation that can be triggered multiple times or in parallel must be idempotent or protected by guards. Use atomic updates, uniqueness constraints, transactional boundaries, or explicit locking checks to prevent duplicate, conflicting, or out-of-order state changes.

### 7. Standardized Outputs
Standardize function outputs into a consistent structure. Each function must return either a success object containing structured data or a failure object containing a clear error code and optional diagnostic details. Do not return raw primitives, ad hoc shapes, or mixed response formats.

### 8. Elimination of Ghost Paths
Eliminate ghost paths and ambiguous code. Remove commented-out logic, dead branches, unreachable paths, and partially wired features unless they are intentionally retained as clearly labeled stubs with defined purpose. Every reachable path in the codebase should represent real, supported behavior.

### 9. External Boundary Validation
Add explicit validation at all external boundaries. Any input from users, APIs, files, queues, or third-party systems must be validated for type, format, range, and business constraints before use. Reject invalid inputs early and clearly instead of allowing them to propagate into deeper logic.

### 10. Traceable State Transitions
Ensure all state transitions are explicit and traceable. Every change to persistent state must be directly tied to a verified action, with no implicit mutation or hidden side effects. The reason for each state change should be inferable from the code path itself.

### 11. Targeted Testing
Introduce targeted tests that prove critical behaviors cannot fail silently. Cover identity deployment, reward triggering, value transfers, uniqueness constraints, invalid inputs, retries, and concurrency hazards. Tests must validate both success and failure paths so the system remains predictable under stress and edge cases.

### 12. System Invariants
Define and enforce system invariants. Identify the core guarantees of the system, such as uniqueness of actions, validity of state, and confirmation of transactions, and enforce them in code rather than assuming them. These invariants must hold regardless of execution order, retries, or external conditions.

### 13. Resilient Async & Event-Driven Flows
Make asynchronous and event-driven flows resilient. Any async operation must handle delay, failure, retry, duplication, timeout, and partial completion without corrupting state. Never assume immediate success, delivery, or completion of an external action.

### 14. Explicit Intent
Make intent explicit in code rather than relying on naming or convention. If behavior is intentional, encode that intent through validation, structure, assertions, or comments that define expectations precisely. Remove any dependence on implicit understanding.

### 15. Continuous Verification
Continuously verify that implementation matches declared behavior. For every major feature, ensure the code enforces what the documentation claims and that no gap exists between description and execution. Treat mismatches between documentation, tests, and runtime behavior as defects to be corrected.

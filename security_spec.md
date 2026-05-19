# SpendWise Security Specification

## Data Invariants
- An Expense must have a `userId` matching the authenticated user's UID.
- A Budget must have a `userId` matching the authenticated user's UID.
- All amounts must be non-negative.
- Categories must be one of the predefined CATEGORIES.

## The "Dirty Dozen" Payloads (Deny)

1. **Identity Spoofing**: Attempt to create an expense for another user.
   ```json
   { "id": "1", "amount": 10, "category": "Food", "description": "Lunch", "userId": "ANOTHER_USER_ID", "date": "2024-05-18T00:00:00Z" }
   ```
2. **State Shortcutting**: (N/A for this simple app, but maybe modifying a created at date if we had one).
3. **Resource Poisoning**: Injection attack in document ID.
   ```json
   { "id": "../poison", "amount": 10, ... }
   ```
4. **Large String Attack**: 1MB description.
5. **Negative Amount**: 
   ```json
   { "amount": -100, ... }
   ```
6. **Invalid Category**: 
   ```json
   { "category": "HackerStuff", ... }
   ```
7. **Blanket Read**: Authenticated user trying to list ALL expenses.
8. **Unauthorized Update**: User A trying to update User B's budget.
9. **Shadow Field**: Adding `isVerified: true` to profile (if we had one).
10. **Type Mismatch**: `amount` as string.
11. **Future Date Injection**: (If we disallowed it).
12. **Orphaned Record**: Creating an expense without a userId.

## Test Runner (firestore.rules)
I will implement the rules to block these.

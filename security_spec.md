# Security Spec

## Data Invariants
1. A UserProfile can only be read/written by the authenticated user whose UID matches `userId`.
2. All transactional data (clients, equipments, records, transactions, schedulings, budgets, stock) live within subcollections of `/users/{userId}/...`
3. Operations on subcollection documents require that the `userId` in the path matches `request.auth.uid`.

## Dirty Dozen Payloads
1. Create a client in another user's subcollection (`userId` path mismatch).
2. Read a client of another user.
3. Update a UserProfile to change plan or status (mimicking a subscription update hack).
4. Create an equipment with non-string `brand`.
5. Create a scheduling with an invalid `status` string.
6. Create an equipment where `clientId` points to another user's client (This might be hard to enforce entirely in rules without extra reads, but at least the equipment is stuck in the caller's userId subcollection).
7. Inject a 1MB string into a Document ID.
8. Update a transaction to `type: "revenue"` when it was an expense and no such action is defined.
9. Omit required fields like `quantity` when creating a StockItem.
10. Spoof `createdAt` timestamp (not matching `request.time`).
11. Update `createdAt` field on a Client (modifying immutable field).
12. Attempt to create a document when `request.auth.token.email_verified` is false.

## Test Runner
See `firestore.rules.test.ts` for actual tests enforcing these.

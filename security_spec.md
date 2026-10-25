# Security Specification & Invariants

## Data Invariants
1. **User Profiles (`/users/{userId}`)**:
   - Only authenticated users can read their own profile (`request.auth.uid == userId`).
   - A user can only create or update their own profile document where `incoming().uid == request.auth.uid`.
   - Immutable keys: `uid`, `email`.
   - Cannot self-escalate role to arbitrary administrative permissions without verification.

2. **Evaluated Documents (`/documents/{documentId}`)**:
   - Documents represent student papers analyzed by a teacher.
   - Only authenticated users can list and read their own analyzed documents (`resource.data.userId == request.auth.uid`).
   - A document must have `incoming().userId == request.auth.uid`.
   - Immutable keys: `id`, `userId`, `createdAt`.
   - Maximum contentSnippet length 10,000 chars, title <= 300 chars.
   - Deletion is restricted to the document owner (`resource.data.userId == request.auth.uid`).

3. **Reference Corpus Documents (`/reference_documents/{referenceDocId}`)**:
   - Reference documents in the cotejo corpus can be read by all authenticated teachers (`request.auth != null`) so the school repository can compare against all prior submissions.
   - Any authenticated teacher can add a reference document provided `incoming().createdBy == request.auth.uid`.
   - Only the creator of a custom reference document (or admin) can update or delete it (`resource.data.createdBy == request.auth.uid`).
   - Content size bounded <= 200,000 characters.

## The Dirty Dozen Payloads (Forbidden Operations)
1. **Unauthenticated Read**: Attempting to read `/documents/doc123` with `auth == null`.
2. **Cross-User Document List**: Attempting to query `/documents` without filtering by `userId == request.auth.uid`.
3. **Ghost / Shadow Fields in Document**: Writing `{ id: "doc1", ...validFields, __hackedAdmin: true }`.
4. **UID Spoofing**: User `A` creating `/documents/doc1` with `userId = "UserB"`.
5. **Path ID Mismatch / Poisoning**: Attempting to create a document ID with 2KB junk characters or non-alphanumeric symbols.
6. **Immutable Field Tampering**: Updating an existing document to change `userId` or `createdAt`.
7. **Type Poisoning**: Sending `overallSimilarity: "one hundred percent"` instead of a number.
8. **Negative / Out-of-bounds metrics**: Setting `overallSimilarity: 999` or negative numbers.
9. **Volumetric Denial of Service**: Writing `title` longer than 300 characters or `content` > 200,000 chars.
10. **Unauthorized Deletion**: User `B` calling delete on `/documents/doc1` owned by User `A`.
11. **Reference Document Hijack**: User `B` updating a reference document created by User `A`.
12. **Blanket Query Scraping**: Malicious client attempting to list all `/users` in the database.

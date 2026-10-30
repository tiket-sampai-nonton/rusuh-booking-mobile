# SEQUENCE-DIAGRAMS.md — Technical Sequences

> Generated from GENESIS grooming decisions.
> Fill `{...}` placeholders with actual project values.

---

## Overview

Technical sequence diagrams showing system component interactions.

---

## Sequence 1: {sequence name}

**Purpose:** {what this sequence accomplishes}
**Trigger:** {what initiates this sequence}

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Service
    participant Database
    Client->>Gateway: 1. Request
    Gateway->>Service: 2. Validate
    Service->>Database: 3. Query
    Database-->>Service: 4. Result
    Service-->>Gateway: 5. Response
    Gateway-->>Client: 6. Response
```

### Steps

| # | From | To | Action | Data |
|---|------|----|---------|----|
| 1 | Client | Gateway | {action} | {data} |
| 2 | Gateway | Service | {action} | {data} |
| 3 | Service | Database | {action} | {data} |
| 4 | Database | Service | {action} | {data} |
| 5 | Service | Gateway | {action} | {data} |
| 6 | Gateway | Client | {action} | {data} |

### Error Cases

| Step | Error | Handling |
|------|-------|----------|
| {step} | {error} | {how handled} |

---

## Sequence 2: {sequence name}

...

---

## Authentication Sequence

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB
    Client->>API: 1. Login
    API->>Auth: 2. Validate
    Auth->>DB: 3. Check user
    DB-->>Auth: 4. User data
    Auth-->>API: 5. Token
    API-->>Client: 6. Token
```

---

## Data Sync Sequence

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    Client->>API: 1. Fetch
    API->>DB: 2. Query
    DB-->>API: 3. Data
    API-->>Client: 4. Response
    Note over Client,DB: ... later ...
    Client->>API: 5. Update
    API->>DB: 6. Write
    DB-->>API: 7. Confirm
    API-->>Client: 8. Success
```

---

## Webhook Sequence

```mermaid
sequenceDiagram
    participant External
    participant Gateway
    participant Handler
    participant DB
    External->>Gateway: 1. Webhook
    Gateway->>Handler: 2. Verify sig
    Handler->>DB: 3. Process
    DB-->>Handler: 4. Store
    Gateway-->>External: 5. 200 OK
```

---

## Background Job Sequence

```mermaid
sequenceDiagram
    participant Queue
    participant Worker
    participant Service
    participant DB
    Worker->>Queue: 1. Dequeue
    Worker->>Service: 2. Process
    Service->>DB: 3. Update
    DB-->>Service: 4. Done
    Service-->>Worker: 4. Done
    Worker->>Queue: 5. Ack
```

---

## Component Interactions

### {Component A} ↔ {Component B}

**Communication:** {sync/async, protocol}
**Contract:** See `API-CONTRACT.md` section {X}

---

## Timing Constraints

| Sequence | Step | Max Duration | Timeout Action |
|----------|------|--------------|----------------|
| {sequence} | {step} | {duration} | {action} |

# FLOW-DIAGRAMS.md — User & System Flows

> Generated from GENESIS grooming decisions.
> Fill `{...}` placeholders with actual project values.

---

## Overview

This document describes the key user journeys and system flows.

---

## User Journeys

### Journey 1: {journey name}

**Actor:** {user type}
**Goal:** {what user wants to accomplish}
**Preconditions:** {what must be true before starting}

```mermaid
flowchart LR
    S1["Step 1 · {desc}"] --> S2["Step 2 · {desc}"] --> S3["Step 3 · {desc}"] --> S4["Step 4 · {desc}"]
```

**Steps:**
1. **{Step 1}** — {description}
2. **{Step 2}** — {description}
3. **{Step 3}** — {description}
4. **{Step 4}** — {description}

**Happy Path Outcome:** {what happens on success}

**Alternative Paths:**
- If {condition} → {what happens}
- If {condition} → {what happens}

**Error Paths:**
- If {error} → {how handled}
- If {error} → {how handled}

---

### Journey 2: {journey name}

**Actor:** {user type}
**Goal:** {what user wants to accomplish}

...

---

## Screen Flow

### Route Map

```
{route}                    {screen name}
  │
  ├── {route}              {screen name}
  │     ├── {route}        {screen name}
  │     └── {route}        {screen name}
  │
  └── {route}              {screen name}
        └── {route}        {screen name}
```

### Navigation Matrix

| From | To | Trigger | Condition |
|------|-----|---------|-----------|
| {screen} | {screen} | {action} | {if any} |
| {screen} | {screen} | {action} | {if any} |

---

## Flow Diagrams

### Flow 1: {flow name}

```mermaid
flowchart TD
    Start([Start]) --> S1["Step 1 · {action}"]
    S1 --> C{Condition?}
    C -->|Yes| A[Step 2A]
    C -->|No| B[Step 2B]
    A --> End([End])
    B --> End
```

---

### Flow 2: {flow name}

...

---

## State Diagrams

### {Entity} States

```mermaid
stateDiagram-v2
    [*] --> Initial
    Initial --> StateA : {trigger}
    StateA --> StateB : {trigger}
    StateA --> StateC : {trigger}
    StateB --> Final : {trigger}
    StateC --> Final : {trigger}
    Final --> [*]
```

### State Definitions

| State | Description | Allowed Transitions |
|-------|-------------|---------------------|
| {state} | {meaning} | → {states} |
| {state} | {meaning} | → {states} |

---

## Interaction Flows

### {Interaction name}

**Trigger:** {what initiates this}
**Actors:** {who/what is involved}

```mermaid
sequenceDiagram
    actor User
    participant System
    participant External
    User->>System: 1. {action}
    System->>External: 2. {action}
    External-->>System: 3. {response}
    System-->>User: 4. {response}
```

---

## Error Flows

### Error: {error type}

**Trigger:** {what causes this error}
**Detection:** {how system detects it}
**User Impact:** {what user sees}

```mermaid
flowchart TD
    A[Action] -->|Error| E[Error State]
    E --> ES[Error Screen]
    ES --> R[Retry]
    ES --> C[Cancel]
```

**Recovery Options:**
1. {option 1}
2. {option 2}

---

## Routes

### Public Routes

| Route | Screen | Purpose |
|-------|--------|---------|
| `{route}` | {screen} | {purpose} |
| `{route}` | {screen} | {purpose} |

### Protected Routes

| Route | Screen | Required Auth |
|-------|--------|---------------|
| `{route}` | {screen} | {auth level} |
| `{route}` | {screen} | {auth level} |

### Route Parameters

| Route | Params | Example |
|-------|--------|---------|
| `{route}` | `{param}` | `{example}` |

---

## Deep Links

| Link | Route | Purpose |
|------|-------|---------|
| `{scheme}://{path}` | `{route}` | {purpose} |

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `{event_name}` | {when fired} | `{properties}` |
| `{event_name}` | {when fired} | `{properties}` |

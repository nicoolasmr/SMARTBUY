# ADR 006: Missions as Intent Containers

## Status
Accepted

## Context
Users often have complex buying goals (e.g., "Equipping a Home Office") that consist of multiple purchases over time.
Treating these as isolated "Wishes" or "Searches" loses the context of the *budget* and the *completeness* of the goal.
We need a structure to organize these intents.

## Decision
We introduced **Missions** as a core entity.
- **Mission**: A container for a goal (Title, Budget, Moment).
- **Mission Item**: A specific line item, which may or may not be linked to a structured "Wish".

## Consequences
- **Positive**:
    - **Retention**: Users return to check off items.
    - **Budgeting**: Allows tracking "project-based" spending vs "monthly" spending.
    - **Feed**: Gives us a powerful signal. If "Home Office" is active, we boost office chairs in the feed.
- **Negative**:
    - **Complexity**: Another layer on top of "Wishes".
    - **Data Entry**: Requires user to input data. (Future mitigation: Templates).

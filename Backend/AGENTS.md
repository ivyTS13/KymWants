# Backend Instructions

## Scope
Work only within the backend folder unless I explicitly ask you to touch the frontend.

## Architecture
Respect Clean Architecture boundaries.
Keep domain, application, infrastructure, and API concerns separated.
Do not introduce dependencies that violate the intended layer direction.

## Change policy
Prefer small, focused refactors over large rewrites.
Do not change public behavior unless I explicitly request it.
When a refactor may affect behavior, explain the impact before making changes.

## Testing
Add or update tests for every meaningful code change.
Prefer tests that cover business logic, application flows, and regression risks.

## Performance
Measure before optimizing.
When suggesting performance improvements, explain the likely bottleneck and why the change should help.
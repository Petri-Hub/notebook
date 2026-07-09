#refactor #deepen

## What is it

Galego brings the most common model that is used to architect system, where most of them are either a derivation or slight expansion of it, the Three Layer Architecture. TLA is overly simple, it separates three main concerns so each one can live independently, ensuring we can have a clear separation of concerns:

- Presentation: How data and operations are viewed and interacted with.
- Logic: Where the logic of the system actually happens, where business rules live.
- Persistence: Where the data is stored persistently, even on failures.
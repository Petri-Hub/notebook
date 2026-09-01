
## What is it?

BASE is in some parts, opposite of what [[ACID]] proposes. BASE acronym resolves around three main principles (Yeah, not four):

- **Basically Available (BA)**: The fact that most NoSQL databases value AVAILABILITY over consistency.
- **Soft State (S)**: Even with no operations in the system, data may change as data is being synced over time, even after no operation was done.
- **Eventual Consistency (E)**: Even that we sacrificed consistency, data will be synced and eventually consist.
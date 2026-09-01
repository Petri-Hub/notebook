
## What is it?

ACID is a acronym for four words: Atomicity, Consistency, Isolation, Durability. This are the values that most normal SQL DB implement, such as [[PostgreSQL]], [[MySQL]], and any old traditional SQL DB.

Those values are important, because together they create a strong foundation to make SQL one of the best:

- **Atomicity**: Ensures that all operations occur in a all or nothing state. No half committed query or data changed.
- **Consistency**: Restraints applied into every single query, mutation, this ensure overall data consistency across the DB.
- **Isolation**: The guarantee that changes and queries in the DB doesn't suffer from race conditions that would allow invalid data to be committed.
- **Durability**: The fact that on commit, every DB operation is written to a [[WAL]], which prevents queries to not commit, even on DB crashes.

## References

- [**ACID properties: Simplified and Illustrated**](https://engineeringatscale.substack.com/p/acid-properties-databases-explained)
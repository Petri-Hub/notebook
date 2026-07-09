
## [[ACID]]

ACID is a acronym for four words: Atomicity, Consistency, Isolation, Durability. This are the values that most normal SQL DB implement, such as Postgres, MySQL, and any old traditional SQL DB.

Those values are important, because together they create a strong foundation to make SQL one of the best:

- **Atomicity**: Ensures that all operations occur in a all or nothing state. No half commited query or data changed.
- **Consistency**: Restraints applied into every single query, mutation, this ensure overall data consistency across the DB.
- **Isolation**: The guarantee that changes and queries in the DB doesn't suffer from race conditions that would allow invalid data to be commited.
- **Durability**: The fact that on commit, every DB operation is written to a WAL, which prevents queries to not commit, even on DB crashes.

## [[BASE]]

BASE is in some parts, opposite of what ACID proposes. BASE acronym resolves around three main principles (Yeah, not four):

- **Basically Available (BA)**: The fact that most NoSQL databases value AVAILABILITY over consistency.
- **Soft State (S)**: Even with no operations in the system, data may change as data is being synced over time, even after no operation was done.
- **Eventual Consistency (E)**: Even that we sacrificed consistency, data will be synced and eventually consist.

## [[Databases]]

When selecting a DB, and principally when at side of the ACID/BASE principles, some of the points below are the most important when decide one or another, specially in interviews:

- Format of data types (Consistent x Dynamic)
- Level of relationships between data (Lots x Little)
- Availability X Consistency X Partitioning (CAP theorem)
- Reads/Writes reason though one another (Write: NoSQL prefferend)

When we talk about relational databases, most of the options are:
- **Oracle SQL**
- **Postgres SQL**
- **MyQSL**

When we need a noSQL database, we are generally needing some of those:
- **Analytcs** -> Colunar database (EX: Cassandra)
- **Cache** -> KV database (EX: Redis)
- **Graph database** -> Neo4j
- **Search database** - Inverted Index DB (EX: Elasticsearch)
- **AI memory system** - Vector DB - (EX: QDrant)

## [[Partitioning]]

Partitioning is simply separating a data store that had 100% of the data of your system, in divided databases, each one with their respective "piece" of it.

When we talk about partitioning, two main models comes upfront:
- **Vertical partitioning**: Separating tables or columns in dedicated databases, helps with SOC, and when data is "unbalanced". Makes JOINS really worse.
- **Horizontal partitioning**: Separating data by dividing its rows in different ways, columns and tables stay the same, but records are divided in multiple DB's.

Regarding the strategies, some of which we can do are:
- **Sliced by range**: Define a range from 1-1000 and 1000-2000, you know separate things by a range of numbers, really simple, but requires a heavy rebalance when a new DB comes in.
- **Sliced by HASH**: Define a hash function that transform an ID into a DB pointer, recordo 1000 goes to DB A, record 745 goes to DB B. Simple to implement, also requires re balancing.

Another important division about partitioning is:
- **Physical partitioning**: Separating actual data by placing them in different physical shards, such as a another database for example.
- **Logical partitioning**: Separating actual data by organizing them in logical partitions, which can sometimes be in the same database as before.

Another honorable mention here when dealing with partitioning is the difficulty of dealing with non PK keys queries, such as finding a user by with a name that ends with "los". Are we going to make this query in the N DB's we have? How can we efficiently deal with this?

One approach is to use a "**Global Index**, which maps data, such as a user name of "Carlos", in a way that we can correlate: The main data being queries, the shard that its stored, and the ID of that record in the DB.

Another important topic: How to deal with really stale, old records in our DB, like posts from Facebook from 2015, which aren't generally accessed nowadays? One approach is to use a "**Cold storage**", a DB like storage slower, made to store trillions of data. That way we can centralize the main data, the hot data into our main DB's, while sending cold data to this storage. This adds complexity, but makes us waste less money.

## Doubts

> 1. ACID helps with Isolation, which by principle helps queries to "isolate" themselves, even though the name sounds contradictory as they don't overlap. But how exactly is the mechanism in those DB's to perform that? Are the "lock" subject about this?

> 2. Database partitioning is complex, as we can have vertical, horizontal, and loads of approaches with their trade-offs, what are the most famous on the market, and how to decide each one of them?

> 3. Cold storage, how does this work exactly? How is this generally orchestrated in a single application? 

## Lessons

> 1. What is Zookeeper and how to use it?


- [BASE Properties Explained: Basically Available, Soft State, Eventually Consistent](https://www.algoroq.io/concepts/base-properties/)
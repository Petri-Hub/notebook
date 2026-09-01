
## What is it

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

One approach is to use a "[[Index Table]], which maps data, such as a user name of "Carlos", in a way that we can correlate: The main data being queries, the shard that its stored, and the ID of that record in the DB.

Another important topic: How to deal with really stale, old records in our DB, like posts from Facebook from 2015, which aren't generally accessed nowadays? One approach is to use a "**Cold storage**", a DB like storage slower, made to store trillions of data. That way we can centralize the main data, the hot data into our main DB's, while sending cold data to this storage. This adds complexity, but makes us waste less money.
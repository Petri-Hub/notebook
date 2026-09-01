Storage and retrieval.

## Introduction

The author opens this chapter to talk about the internal of databases, how databases retrieve and store data? And what are the main constraints, limitations and trade-offs that arrive?

### The simplest database
 
The author brings the simplest DB possible, a database structured in a simple log format that register in the last line of a file a record. This is overall simple and can be performed with a simple bash script.

```bash
#!/bin/bash

db_set () {
  echo "$1,$2" >> database
}

db_get () {
  grep "^$1," database | sed -e "s/^$1,//" | tail -n 1
}
```

This works fine, but the author brings and important point about the design of this database: The write operations area really fast, as data is directly appended at the end of the file, BUT, the reading is horrible, as the retrieval approach requires passing through all lines of the database. To solve this, the user tells us about a special tool: Indexes.

### Indexes

Indexes are like a "map", similar to a "post-sign" that helps to query data more efficiently. Instead of looking at EVERY database record, indexes allows you, the application developer, to help the database "point" to specific records, depending on the criteria.

The trade-off of indexes though, is that every actual write to the database does not only need to append a text to the end of the file anymore, but to register it in the indexes.

![[Pasted image 20260613005834.png]]

Indexes makes queries faster, but writes slower.

### Compacting

Another thing that becomes a problem in a database as this, pointer by the author is: As we're only adding things on and on, we will eventually run out of space, as old values that stay in the file will keep there.

A solution for this is compaction, compaction can be done and analyzed by loads of different ways, but in the simplest database approach of ours, one method is the simplest: We divide the file in segments file, and monitor the amount of keys it has. If it exceeds a X number of keys or size we can them perform a compaction, which takes only the most recent value (the one on the bottom) and save it. This can be done by multiple file segments at the same time too.

![[Pasted image 20260613010348.png]]

The author notes some important points about the database structure, and what points you would need to adjust in order to make it actually work more reliably, which are:

- The CSV format is not ideal, instead of using line breaks you could use a different approach that uses a number at the start of the key/value record to tell how big it is. This makes it possible to not use line breaks that occupy unnecessary data.
- There is no protection against partially written records, if the system crashes a middle written record is possible, but undesired.
- There is no system here to actually implement deletions. One approach that the author method is the concept of a "tombstone" record.

### SSTable


Data Models and Query Languages.


## Introduction

As the author introduces the idea of "most systems are not CPU intensive, but data intensive" the second chapter comes into play to answer an interesting question: What is then the different kind of data "storages" that we see in the day to day of software development, and what are they best for?

There's load of history in this chapter, but three main protagonists models come into play, and they're used everywhere in the industry. The models are:

- **Relational model**: Storing your data in structured, schema explicit tables in rows.
- **Document model**: Storing your data with locality, generally in JSON or XML.
- **Graph model**: Storing your data as a graph, using vertices and edges for relations.

The important point is: There is no "one size fits all" solution, every kind of data storage has different aspects which makes them better when used in an specific use case, which the author brings through the chapter.

> Important note: This chapter only compares an initial view of how the data modelling inside each model impacts it in good or bad. Performance and other deep subjects will be studied later on.

## Relational models

The relational model is overall simple: It uses a set of tables with pre-defined (explicit) schema and stores its values in rows, similar to a tuple. This ensures that all data within an specific table is consistent with every other single row, as they live under the constraints of schema.

This kind of flexibility is wonderful in common, day-to-day management systems where schemas actually works in a mutual benefit. The downside of this is that systems which requires data flexibility are harder to develop in the relational model, which generally requires some kind of "work-around" tactics to get the job done.

![[Pasted image 20260607182446.png|697]]

Another important aspect of the relational model, apart from its explicit schema, is they benefit of dealing with one-to-many relationships, which are easy to structure in them. When you find systems that require with relations as a tree, where most of the relationships are one-to-many, the relational model will shine.

Another important topic about relational models is that they generally implement a "declarative language", such as SQL. The benefits of SQL overall is that the actual implementation is not of the users concern, which generally opens up situations such as:

- The query can be written only a single time, and get diverse performance improvements under the hood by the database developers.
- Even with version upgrades, the query doesn't need to change, as most of the query resolves around "i need this", instead of specifying the step by step approach.
- The abstraction of the query helps new people to understand it better, as most of the declarative languages are prone to be closer to normal english grammar.

## Document models

The author brings up the "document model", which is seen as a high competitor for SQL databases (relational databases) when deciding a storage model for your application. The document model blew up some time ago, branding it as NoSQL (Not only SQL), which is a really horrible name for it.

The document model shines in some occasions, but most of them are related to data locality, impedance mismatches, and data which is not related to one another. I will explain this topic one by one, as they're interesting.

First, data locality can be both beneficial is some situations as harmful. Locality means that data is not dispersed into different locations, which in most situations makes actual read queries faster, as data doesn't need to be "constructed" by looking into different places (Such as relational model tables). This can be benefitial, but comes with two important points:

- At most times, all the data needs to be serialized/queried, which means that storing a huge documents but only querying bits of it can actually downgrade the benefit of data locality.
- Document databases we're not specifically designed to deal with relationships, so when needing to either reference or have a more normalized data-set, you will find yourself in awkward situations. 

Another interesting point about document models is about "impedance mismatch". Even though this is awkward with relational, document an graph databases, the document helps reduce (in most languages) the problem known as impedance mismatch. Impedance mismatch basically means that when dealing with two different formats, there's a resistance into adapting into another. As most systems deal with relational models, representing data in OOP languages which are then translated into rows is awkward, which is different from in the document model, where most data is represented by JSON or XML, which is closer to actual OOP practices.

Another great thing about most document storages, is that they generally are schema-less, which allows different kinds of records to have (or not have) more properties. This helps systems like a web scraper system for example to deal with the huge flexibility of the web, which would be difficult in a relational storage.

## Graph models

Graph models are interesting. Even though the author points out that the relational model is great of one-to-many relationships, problems arrive when your data needs loads of many-to-many relationships. This is the primary use-case for graph databases: Structuring your data when in vertices and edges. 

![[Pasted image 20260608131423.png|697]]

One of the main interesting differences when comparing the Graph Model with the Relation model, is that similarly to document models, graph storages are schema-less, where most tools don't enforce any kind of structure for the documents.

Another point is the concept of "nesting" data is really dynamic. In relational databases when you need to structure data, you generally have some kind of "parent table" where you store the parent record where does records live, and every "child" needs to be "child of that parent". In a graph database this doesn't need to work like this:

- A vertice that represents a person can have a LIVES_IN edge which points to state, where other vertices points to a city.
- A vertice that represents a person can have a LIVES_IN edge which points to state A, while also having a edge that points they also LIVES_IN state B.

Other benefit from the graph model is that they generally come with some declarative language, which basically means they have the same shared benefits as the declarative query languages for the relational model, such as SQL.
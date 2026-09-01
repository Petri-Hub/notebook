
## [[System Design]]

The first part of the course is introductory, and explains a little bit about what actually System Design. Galego brings the subject by explaining it with a simple metaphor: System Design is like designing a blueprint to a building, you have a whole library of pieces, which you're tasked to use them as the best possible, discarding what is not needed, excessive, and preserving what actually matters.

What actually matters? To discern what matters from what not, its responsibility of the Architect to analyze two software fundamental concepts:

- **RF**: Functional requirements that tell the system what features it need to expose.
- **RNF**: Non-Functional requirements tell how the system behave in an specific environment.

Its part of the job to architect, not only select the right pieces, but understanding what he's gaining, and what he's loosing. This is what we call trade-offs. Trade-offs will always exist, and will reach an architect by the liabilities of the system:

- **Scalability**: How the system is able to cope and adapt to the scale of the load.
- **Reliability**: How reliable is the system, even when under something unpredictable.
- **Maintainability**: How easy it is to maintain the overall system.

## [[Interviews]]

One thing Galego brings up, which is important to note is: Most of the mid/sênior/tech-lead role interviews require System Design Thinking, and the most important aspect of those interviews are often negligible, which is the thinking-process of it.

This is important to keep in mind, specially when participating of this kinds of interviews.

## [[Client Server Architecture]]

Another subject brought to the table is the Client/Server architecture, which is the common communication protocol done. Client/Server architecture is overly simple: It states that there something we consider as a "client": someone which performs and requests some information or attempts to perform an operation. Server is the opposite, where we treat it as "the one receiving requests". 

This is the standard architecture organization that is leveraged in most situations, and its one of the most simple to implement.

## [[Three Layer Architecture]]

Galego brings the most common model that is used to architect system, where most of them are either a derivation or slight expansion of it, the Three Layer Architecture. TLA is overly simple, it separates three main concerns so each one can live independently, ensuring we can have a clear separation of concerns:

- Presentation: How data and operations are viewed and interacted with.
- Logic: Where the logic of the system actually happens, where business rules live.
- Persistence: Where the data is stored persistently, even on failures.
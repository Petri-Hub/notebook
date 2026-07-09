#refactor 

## What is System Design

The first part of the course is introductory, and explains a little bit about what actually System Design. Galego brings the subject by explaining it with a simple metaphor: System Design is like designing a blueprint to a building, you have a whole library of pieces, which you're tasked to use them as the best possible, discarding what is not needed, excessive, and preserving what actually matters.

What actually matters? To discern what matters from what not, its responsibility of the Architect to analyze two software fundamental concepts:

- **RF**: Functional requirements that tell the system what features it need to expose.
- **RNF**: Non-Functional requirements tell how the system behave in an specific environment.

Its part of the job to architect, not only select the right pieces, but understanding what he's gaining, and what he's loosing. This is what we call trade-offs. Trade-offs will always exist, and will reach an architect by the liabilities of the system:

- **Scalability**: How the system is able to cope and adapt to the scale of the load.
- **Reliability**: How reliable is the system, even when under something unpredictable.
- **Maintainability**: How easy it is to maintain the overall system.

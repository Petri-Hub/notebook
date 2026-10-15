---
title: LLMs, Technical Judgment, and Reliability
status: idea
---

# LLMs, Technical Judgment, and Reliability

## The short version

LLMs can often turn a clear product goal into a working end-to-end flow. The harder question is whether the person directing the work knows which technical constraints and failure modes to ask about. A system can satisfy the prompt and still be fragile in ways that are invisible on the happy path.

The bottleneck is not simply whether AI can produce an architecture or write code. It is whether someone can recognize the reliability decisions that the request left unstated—and guide the model through them.

## Possible hook

> An AI can build the flow you asked for. Who tells it about the failure modes you didn't know to ask about?

## The argument

- A high-level goal—such as building a finance service with event-driven processing—can be enough for an LLM to produce a plausible, connected implementation.
- But a working flow does not prove that its important failure cases have been handled.
- In an event-driven system, for example, writing to a database and publishing an event as separate operations can create a dual-write problem. An outbox pattern is one way to address that risk, but the model needs the requirement and context to choose and implement it appropriately.
- Likewise, deciding whether a frequently called endpoint needs caching requires technical judgment about load, freshness, invalidation, and correctness—not just a request to “make the endpoint.”
- These concerns are different from small code-quality preferences, such as whether a React view uses one component or several. They can affect whether the system loses work, serves stale data, or behaves inconsistently under failure.

This is not mainly an argument that AI cannot design software. It can produce good or bad designs, and it can help implement either. The point is that reliability often depends on knowledge that is not present in the product goal itself. If the person prompting the model cannot identify that knowledge, a feature may look complete while important risks remain unaddressed.

That does not mean AI will never replace any programming work. It means “the AI can build the feature end to end” is not the same claim as “the feature is reliable in production.” As more implementation becomes automated, technical judgment may matter even more: someone still has to know what to ask, what to verify, and which edge cases deserve attention.

## Possible LinkedIn shape

1. Open with the claim that an LLM can build an end-to-end feature from a product brief.
2. Contrast a working happy path with production reliability.
3. Use the database-plus-event dual-write example, then mention the outbox pattern as a technical constraint the prompt may need to name.
4. Distinguish reliability failures from ordinary code-style trade-offs.
5. Close on the central question: AI can follow instructions, but who knows which instructions are missing?

## Working transcript

*Lightly edited from a voice note for readability; this is a reconstruction, not a verbatim transcript.*

When people talk about LLMs replacing programmers, I think they often miss a distinction. LLMs are good at following a set of instructions. Give one a goal—build a payment microservice, or create these endpoints for a frontend—and it can try to carry the request through as an end-to-end flow.

But the less technical the person directing it is, the more likely it is that some of the important edges get missed: patterns, edge cases, and reliability concerns. The model may do what you asked and still leave a system that is less reliable than it could be.

For example, I could ask an LLM to create an event-driven architecture for a finance app. It might map the operations into endpoints and make the flow work. But who notices that we're writing to the database and publishing an event separately, and that without something like the outbox pattern we could hit a dual-write problem? Who spots that an endpoint's traffic or freshness requirements might call for a caching strategy—and that caching also brings its own trade-offs?

I'm not arguing that AI cannot come up with an architecture. It can produce a good one or a bad one, and it can write code that works. I'm talking about the technical knowledge needed to recognize the less obvious things that can break or make a service unreliable.

To get reliability, it is not enough to tell the model only the outcome we want. Someone also has to provide technical constraints and ask about failure modes. That takes technical knowledge. A product owner who has just started coding with AI may be able to get something working from end to end, but may not know to ask for the outbox pattern, or to investigate whether caching is appropriate for a heavily used endpoint.

And those concerns are not all the same as code quality. Whether a React view is one component or several is not on the same level as an edge case that can make part of a system fail. The code can be a little rough and the flow can still work; reliability is a different question.

So I don't think “AI can build this feature” automatically means “programmers are replaced.” AI can do a lot when it is given a clear goal, but reliability still has to be taught, specified, and checked. As more coding gets automated, the ability to recognize what could go wrong—and what the prompt forgot to say—remains important.

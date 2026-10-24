---
title: CAP theorem
---

## What it says

The CAP theorem describes a limit on distributed data systems when a network partition prevents some nodes from communicating. During a partition, a system cannot guarantee both:

- **Consistency (C):** every successful read observes the latest completed write, as if there were one copy of the data (linearizability).
- **Availability (A):** every request to a non-failing node eventually receives a response, even if that response may not contain the latest write.
- **Partition tolerance (P):** the system continues operating despite messages being lost or delayed enough to split nodes into groups that cannot communicate.

The important point is not that a system can permanently “pick any two.” Partitions are a failure condition: when one occurs, the design must decide which guarantee to relax for affected operations. **CP** systems may reject or delay some requests to preserve consistency; **AP** systems may answer with potentially stale or conflicting data and reconcile later. The exact behavior depends on the system and operation.

“Consistency” here means a distributed-systems consistency guarantee such as linearizability; it is not the same as the C in database ACID. And CAP does not say that availability and consistency are mutually exclusive during normal, partition-free operation.

## Reading the diagram

![[CAP theorem.png|CAP theorem diagram showing consistency, availability, and partition tolerance]]

The diagram's dashed arrows contrast the pairwise combinations. CA can describe a system while communication is intact, but it does not meet the partition-tolerance requirement. During a partition, CP and AP are shorthand for which guarantee a design prioritizes for affected operations: CP may refuse some requests to preserve consistency; AP may answer while allowing stale data or later reconciliation. In a real distributed deployment, partition tolerance is not something one can simply switch off.

## When it is useful

Use CAP as a reminder to make failure behavior explicit. Ask what reads and writes should do when replicas cannot coordinate: return quickly with possibly stale data, or wait/fail rather than risk a stale answer? The answer is a product and correctness decision, not a label to assign to an entire database without checking its guarantees.

See also: [[PACELC]] · [[Databases]] · [[System Design]]

## Referências

- https://www.youtube.com/watch?v=o8HEfReQ6co
- https://www.youtube.com/watch?v=COurbijFW-o
- https://www.youtube.com/watch?v=bhw4-Kq_RPs

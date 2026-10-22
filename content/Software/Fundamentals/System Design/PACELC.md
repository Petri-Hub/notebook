---
title: PACELC
---

## What it adds to CAP

PACELC extends the CAP discussion by making the trade-off outside a network partition explicit:

- **If there is a Partition (P):** choose between stronger **Availability (A)** and stronger **Consistency (C)** for affected operations.
- **Else (E), when the system is operating without a partition:** choose between lower **Latency (L)** and stronger **Consistency (C)**.

A system may need coordination among replicas to provide a stronger consistency guarantee, which can add latency. Relaxing coordination can reduce response time, but may allow reads to observe older data. PACELC is a way to frame these trade-offs; it does not replace a system’s detailed consistency model or mean every request follows one global, fixed choice.

## Reading the diagram

![[PACELC.png|PACELC diagram showing the partition branch and the latency-consistency trade-off otherwise]]

Start with the question “Is something partitioned?” If yes, the diagram highlights the CAP availability-versus-consistency decision. If no, it highlights the latency-versus-consistency decision. The real behavior can vary by read/write path, configuration, and failure mode, so verify the guarantees of the specific database or service.

## When it is useful

Use PACELC when comparing distributed data systems or designing a request path. In addition to asking what happens during a partition, ask what coordination costs in the healthy case and whether the resulting latency and freshness are acceptable for the workload.

See also: [[CAP theorem]] · [[Databases]] · [[System Design]]

## Referências

- https://www.youtube.com/watch?v=o8HEfReQ6co
- https://www.youtube.com/watch?v=COurbijFW-o
- https://www.youtube.com/watch?v=bhw4-Kq_RPs

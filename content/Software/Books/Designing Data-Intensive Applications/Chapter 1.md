Reliable, Scalable and Maintainable applications.

## Introduction

Chapter one bring interesting points about overall Software Applications, and what means **today to have a resilient, fault tolerant and reliable system.**

The author initially starts off with one clear goal: **What are the main characteristics of a software that actually affects critical systems?** What aspects actually matters not only in the actual "production environment", but also in the day-to-day operational level management?

Another important point brought is: **What exactly is a data system? And why placing most tools that currently we have on the market is a good idea?**

## The pillars

### Reliability

The author brings something to the desk: reliability is one of the main three concerns a system should have. Reliability basically means how reliable a system is in the face of adversion, and what is the feeling of how the system operates:

- Does the system supports the amount of load that it was designed for? Does it operate on heavy hours when users and interactions amount spikes?
- Does the system actually performs and has the capabilities to do the work it was designed for? Are all functional requirements of the system in match with the actual implementation?
- Does the system prevents and ensures critical faults cannot happen that could disrupt its usage completely?

When talking about actual system reliability, the authors brings a classification of the errors that are prone to happen:

- **Hardware Faults:** Something in the hardware is off, which cause both its physical and software parts to not behave correctly.
- **Software Errors:** The software of the system performs a behavior which was not intended or expected, which possibly means a new fix for it will be necessary.
- **Human Errors:** Humans are prone to perform errors, even on environments that diminishes those changes.

## Scalability

Scalability is one important topic in a system, as it dictates how well the system will adapt with an increasing amount of load. When designing a system, its important to have some knowledge of the actual RFN's that impact your system, as this will completely impact on how you implement code on it.
### Load parameters
The author brings a point that different systems have different "load parameters", which is really dependent of the type of system you're dealing with. A web system may have its load parameters defined as VU, RPS or any kind of "how heavy is the interaction", while other system can have different loads, maybe the size of a file in a heavy write system.

### Performance 
Another important topic is about performance. The author brings an interesting point about performance, which could be described as the phrase below:

> Don't measure performance by calculating the average value of your operation, in a determined range of time. By using the average you aren't able to showcase spikes and the variance of your system. Prefer the usage or percentiles.

![[Pasted image 20260607173209.png]]
![[Pasted image 20260607173532.png]] 

Percentiles are overly simple, but they're able to showcase the variance of your system, and they're also simple to calculate. In general a percentile is always composed of two information: The percentile, which is going to be a number from zero to one hundred, and a time, such as milliseconds, seconds or hours.  By using a percentil, you're able to showcase situations such as:

 - P(50) < 100ms = Our system responds in less than 100ms for 50% of requests, where the other 50% is over 100ms.
 - P(99) < 200ms = Our system responds in less than 200ms for 99% of the requests, where the other 1% is over 200ms.

This kinds of metrics help also identify SLA and SLO's, ensuring that a team can understand, create metrics and aim goals of performance improvements in the system.

### Maintainability

One of the most disregarded pillars, but the one which most affect a team capability in the operational level: Maintainability.

The author brings up Maintainability divided into three main groups, where each of them impacts important pieces of the software development flow:

- **Operability**: How hard or easy is for a team to operate in day-to-day tasks related to an specific system.
- **Simplicity**: How easy is to newcomers and developers to understand the system. How tangled and indirect the system is.
- **Evolvability**: How easy is for a determined system to have new features or refactors done into it when requirements change.

I will not go into each category as this is simply as it is, but there are some important points that i would like to note that the author states:

- Operability is everything under the veil related to "keep the system running" and ensure it is "working as intended" every day.
- Simplicity can be damaged by having accidental complexity: poor decisions or noise kept into a system, generally because of rushes.

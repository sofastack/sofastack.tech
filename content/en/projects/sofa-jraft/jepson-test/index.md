---

title: "Jepsen tests"
---

In addition to hundreds of unit tests and some chaos tests, SOFAJRaft also uses a distributed verification and fault injection testing framework [Jepsen](https://github.com/jepsen-io/jepsen) to simulate many cases, and has passed all these tests:

- Randomized partitioning with two partitions: a big one and a small one
- Randomly adding and removing nodes
- Randomly stopping and starting nodes
- Randomly kill -9 and starting nodes
- Randomly dividing a cluster into two groups, with one node connection the two to simulate network partitioning
- Randomly dividing a cluster into different majority groups

[sofa-jraft-jepsen project address](https://github.com/sofastack/sofa-jraft-jepsen)


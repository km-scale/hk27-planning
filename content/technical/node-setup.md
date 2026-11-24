---
title: Node Setup
weight: 10
aliases: [/docs/node-setup/]
---


This page describes the requirements and options for hosting a data node
during the global hackathon.

## Participation basics

Anyone with a laptop and an internet connection can participate in the
hackathon. The simplest form of a node is a seminar room equipped with
**coffee, cookies, and Wi-Fi** — a comfortable shared workspace where
participants can collaborate on their analyses. Some form of social
programme around the event is generally appreciated and helps build
community among attendees.

## Data access requirements

Nodes should provide access to analysis-ready datasets with proper spatial and
temporal chunking (see [technical concept]({{< relref "/technical" >}})).
Data must be accessible via standard web servers and support fine-grained data
access from remote locations, allowing participants to request specific subsets
of variables, regions, or time ranges without downloading entire files.

## Caching strategies

If lower latency is required, or if your connection is bandwidth-limited,
you will want to cache data locally. Most users tend to re-run their
scripts on the same fraction of a dataset repeatedly (for example,
precipitation over a particular region), so proxy-style caching can be
more efficient than copying entire datasets. A reasonable ballpark for
**locally cached data is between 100 TB and 1 PB**, though the exact amount
depends on your expected user load and analysis focus.

The [data request]({{< relref "/simulations/data-request" >}}) page provides guidance
on data volumes and structure so you can perform a back-of-the-envelope
estimate yourself. We recommend testing your caching set-up well before
the hackathon begins.

## Compute resources

The most elaborate node setup also provides compute resources for users.  This
can be a server with a JupyterLab instance running, giving participants a
ready-to-use interactive environment. For Python users, the best approach is to
provide an easy recipe for self-installing a pre-defined environment, so users
can extend it with the analysis tools of their choice. As a starting point,
plan for approximately **8 CPU cores and 32 GB of memory per user**.

## Examples from the WCRP Global Hackathon 2025

For reference, DKRZ hosts about 1.4 PB of hackathon data on its disks and
typically provides an additional 50 GB of memory per hackathon participant in
their interactive nodes during a hackathon week. During the 2025 global
hackathon, roughly 500–1000 additional node hours (on machines with 256 or 512
GB and 128 cores) were allocated to the related project. Because there is a
baseline use of that project and users can also access other projects, no
perfect figures can be provided for resource requirements.

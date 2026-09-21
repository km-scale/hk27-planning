---
title: Technical Standards and Planning
weight: 1
---


## Basic overview

We envision an improved version of the workflow of the 2025 Digital Earths Global Hackathon.
Data will again be provided on a HEALPix grid in Zarr stores, indexed by catalogs.
The default tool for data analysis will again be Python with a shared environment specification, and many nodes will provide JupyterHub servers for the analysis.

The key changes are:

* Aggregation hierarchies represented as subgroups inside the Zarr dataset, instead of parameters in the catalog.
* STAC instead of Intake as catalog standard.
* Zarr v3 with sharding instead of Zarr v2 (resolves issues with too many files on HPC file systems).
* Using the Earth's ellipsoid as base for the HEALPix grid instead of the sphere.

## Technical Standards

### Grid Specifications

The data is requested on a HEALPix multi-resolution grid.
For the details of the coordinate reference system chosen for the HEALPix grid, see the [grid specifications](https://pad.gwdg.de/JLI_XMEYQ_GAzHZPIzthfw) document.

HEALPix supports different indexing schemes, of which we use the NESTED scheme. 
It groups child cells beneath their parents and preserves hierarchical and spatial locality.
The scheme is defined in the foundational HEALPix paper by [Górski et al. (2005)](https://doi.org/10.1086/427976).
It is the chosen indexing scheme for this specification because it is well suited to hierarchy-aligned chunking and multi-resolution operations.
The indexing scheme must always be recorded in the CF-standard way because the same integer refers to different cells under different schemes, and only with recorded indexing, tools can automatically select the appropriate scheme.


#### Multi-resolution representation

Multi-resolution in this context refers to space and time.
Any variable that is available at a given resolution must also be available at all lower resolutions, while not all data must be available at the maximum spatio-temporal resolution.
If data is present at 3-hourly, daily, and monthly frequency, a field available at daily resolution must also be available at monthly resolution, but not necessarily at 3-hourly.
Similarly for the spatial resolution.

For the multi-resolution representation we use datatrees in the store.
Each spatial or temporal level must identify:

- its HEALPix refinement level;
- its temporal resolution or sampling interval where applicable;
- the source level from which it was derived;
- the aggregation operator, such as mean, sum, minimum, or maximum;
- any weighting used in the aggregation.


### Data Storage

Files are envisioned as Zarr v3 with internal compression and single precision.
Further rounding may be applied to the data before storing to reduce size even further.
For HEALPix data, the chunk layout should preserve the spatial locality of the NESTED indexing.
Chunking along time, vertical level, or other dimensions should be chosen according to the expected access pattern.
Experience shows that typical analyses include maps and time series analysis, so a compromise between the different access patterns has proven beneficial, and small (MB-range) chunk sizes minimize the loading of unwanted data.
Sharding should be chosen to adapt file count and size to the requirements of the individual storage systems.


### Data Distribution

- Access: We strongly encourage open or anonymous data access.
  Online access is requested.

- Online storage: Modeling/data centers are encouraged to push their formatted output to object storage.
  S3 is a protocol that is known to work.
  DKRZ has a Versity S3 Gateway that runs on POSIX (could be a temporary service).

- Data retention/archiving: We request access to the data for at least 2 years.
  It takes about 2 years to write, submit, review and publish a paper after the hackathon.
  Each center can propose a time for how data will be stored and in what location (object, disk, tape).
  We will work to standardize the data retention.

- Data monitoring: The goal is to keep most frequently used data and "core data" as hot as possible.
  There are tools to monitor or map what data is being used.
  These exist for DKRZ, NCAR.


> [!NOTE]
> If it takes 2 years to write a paper, 1--2 years of retention is too short.


### Data Conversion

The goal is to assist with data conversion to HEALPix with Python scripts.
DKRZ already has some scripts for data conversion that will be evolved.
Test data can be sent to DKRZ (access to Levante can be provided) to optimize workflow for any model. 
Online-available data can be tested directly.
The goal is to have a contact person for each dataset, and start working with them in Northern Hemisphere Fall 2026.
A technical hackathon in January 2027 is being planned to support and facilitate data conversion tools to help modeling centers.

To make it easy and interoperable, there should be one storage unit (Zarr store) per dataset.
Recognizing that people might produce multiple Zarr stores during the data conversion, an intermediate tool should be developed to stitch together datasets.


### Catalog

The catalog will use STAC.
There will be one entry per model simulation or observation (*dataset*).
Intake catalogs could be derived automatically from the STAC catalog.
Satellite observations or analyses (ERA5) formatted to HEALPix will also be added to the catalog.




### Analysis Environment and Infrastructure

The user analysis language is Python, ideally running from JupyterHub.
A common Python environment will be provided as conda-style `environment.yaml`.
The details of the installation will be site-dependent (centrally installed / user install with pixi / ...).
We envision incorporating an AI agent into this environment through Jupyter AI (See [AI Opportunities](https://pad.gwdg.de/uIdHtuEUQWe9_4mEZzyMQA)).


A variety of specialized tools needs to be developed to help work with the unstructured (non-Lat-Lon) HEALPix grid.
The ability to find nearest neighbors, distances, and continuous regions is needed.
This includes methods for gradients, zonal means, and spectral analysis.
Functions to select a region would be useful.
Also, (pointers to) model functions for standard computations could be collected.
Tooling requests and progress are being developed as issues in the new [*km-scale* GitHub tools repo](https://github.com/km-scale/tools/issues).


### Sharing Tools

As users were struggling with the use of GitHub in the last hackathon, user code and file sharing for "teams" will use a self-hosted cloud server like Nextcloud or ownCloud.
We expect to have maybe 50--100 GB of storage globally for all nodes.
This will facilitate sharing of notebooks (order 10 MB), images, documents, notes, etc.
For files over 100 MB (like data or analysis files), we would want another place to put things for a limited time.

Technical code sharing will happen in [GitHub repositories](https://github.com/km-scale/).
This includes development of tooling for methods, data conversion tools, catalogs, etc.

### User Workflows

We will document workflows with tutorials (notebooks), the Python environment and tools.
It is up to individual nodes to determine the user-facing part.
JupyterHub is recommended as the IDE platform.



## Appendix: Terminology

### Storage and chunking

**Cloud-native** data can be accessed selectively over object storage without downloading an entire file.
Zarr supports this by storing multidimensional arrays in independently retrievable **chunks**.

A **chunk** is the unit normally read or written by an array operation.
Chunk layout should follow expected access patterns and, where practical, the spatial locality provided by NESTED indexing.

A **shard** in Zarr v3 is a larger storage object containing multiple chunks.
Sharding can reduce the number of small objects while retaining chunk-level access inside the shard.

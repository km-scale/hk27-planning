---
title: Technical Standards and Planning
weight: 1
---


## Basic overview

We envision an improved version of the workflow of the 2025 Digital Earths Global Hackathon.
Data will again be provided on a HEALPix grid in Zarr stores, indexed by catalogs.
The default tool for data analysis will again be Python with a shared environment specification, and many nodes will provide JupyterHub servers for the analysis.

The key changes are:

* Aggregation hierarchies represented as datatrees inside the Zarr dataset, instead of parameters in the catalog.
* STAC instead of Intake as catalog standard.
* Zarr v3 with sharding instead of Zarr v2 (resolves issues with too many files on HPC file systems).
* Using the Earth's ellipsoid as base for the HEALPix grid instead of the sphere.

## Technical Standards

### Grid Specifications

The data is requested on a HEALPix multi-resolution grid.
For the details of the coordinate reference system chosen for the HEALPix grid, see the [grid specifications](https://pad.gwdg.de/JLI_XMEYQ_GAzHZPIzthfw) document.

HEALPix supports different indexing schemes, of which we use the NESTED scheme.
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

- Data retention/archiving: We request access to the data for at least 1--2 years.
  It takes about 2 years to write, submit, review and publish a paper after the hackathon.
  Each center can propose a time for how data will be stored and in what location (object, disk, tape).
  We will work to standardize the data retention.

- Data monitoring: The goal is to keep most frequently used data and "core data" as hot as possible.
  There are tools to monitor or map what data is being used.
  These exist for DKRZ, NCAR.


> [!NOTE]
> If it takes 2 years to write a paper, 1--2 years of retention is too short.


### Data Conversion

DKRZ already has some scripts for data conversion that will be evolved.
The goal is to assist with data conversion to HEALPix with Python scripts.
Test data can be sent to DKRZ (access to Levante can be provided) to optimize workflow for any model.
The goal is to have a contact person for each dataset, and start working with them in Northern Hemisphere Fall 2026.
A technical hackathon in January 2027 is being planned to support and facilitate data conversion tools to help modeling centers.

To make it easy and interoperable, there should be one storage unit (Zarr store) per dataset.
Recognizing that people might produce multiple Zarr stores during the data conversion, an intermediate tool should be developed to stitch together datasets.


### Catalog

The catalog will use STAC.
There will be one entry per model simulation or observation (*dataset*).
A backward compatible Intake catalog could be developed.
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

## Planning Process/Meetings

- We envision a technical planning process and a node planning process.

- We are planning first for data preparation and a technical hackathon on 11--15 January 2027.
  This might be a hybrid meeting with locations in Boulder and Barcelona.
  We would like a list of technical contacts and a list of contacts for each dataset.
  Observational datasets are invited to be part of this process.

- There will also be a planning process for tooling (see above).
  This process will be a bit later, and could happen 12--16 April 2027 (the week after EGU).

- A technical node support process will also happen.
  Additional virtual and even in-person support (traveling to nodes in advance by technical staff) could be provided as needed.

- Overall logistical support can be provided from MPI-M, DKRZ, and the WCRP Digital Earth Lighthouse Activity (Contacts: Elina Plesca <elina.plesca@mpimet.mpg.de>, Florian Ziemen <ziemen@dkrz.de>, Andrew Gettelman <andrew.gettelman@colorado.edu>).







## Appendix: Terminology

### Storage and chunking

**Cloud-native** data can be accessed selectively over object storage without downloading an entire file.
Zarr supports this by storing multidimensional arrays in independently retrievable **chunks**.

A **chunk** is the unit normally read or written by an array operation.
Chunk layout should follow expected access patterns and, where practical, the spatial locality provided by NESTED indexing.

A **shard** in Zarr v3 is a larger storage object containing multiple chunks.
Sharding can reduce the number of small objects while retaining chunk-level access inside the shard.


### HEALPix Grids

- **NESTED** indexing groups child cells beneath their parents and preserves hierarchical and spatial locality.
  The scheme is defined in the foundational HEALPix paper by [Górski et al. (2005)](https://doi.org/10.1086/427976).
  It is the chosen indexing scheme for this specification because it is well suited to hierarchy-aligned chunking and multi-resolution operations.
- **RING** indexing orders cells along iso-latitude rings.
  It is useful for spherical analysis algorithms, but it is not permitted for datasets conforming to this exchange specification.
  Source data in RING ordering must be converted to an allowed scheme before publication; conversion to NESTED is required.
- **NUNIQ** combines the refinement level and NESTED index in one identifier such that the cell ids pass through the cell hierarchy breadth-first.
  It permits cells from multiple refinement levels in the same coordinate, with spatial locality mainly within each level.
  As we plan to address different refinement levels as a datatree within the Zarr store, this ordering is not appropriate.
- **ZUNIQ** also combines multiple refinement levels, but orders cells along a Z-order curve (depth-first) to preserve spatial locality across levels.
  As we plan to address different refinement levels as a datatree within the Zarr store, this ordering is not appropriate.




The **refinement level** describes the position in the HEALPix hierarchy.
Increasing the level subdivides every cell into four children, increasing the number of cells and decreasing their area.
Level 0 splits the sphere into 12 equal-area diamonds.

**Spatial resolution** describes the effective spatial detail of a dataset.
A HEALPix refinement level has a characteristic cell scale; this may or may not correspond to the level of detail that is available in the source of the information.








## Open Comments
    
Please add comments below following the template:



### Catalog
**IN CHARGE** Fabi Wachsmann, Mark Muetzelfeldt
See also [MM channel](https://mattermost.mpimet.mpg.de/wcrp-lighthouse/channels/hk27-catalog-planning)

> for the STAC catalog, do we model datasets as collections or items? With satellite data (for which STAC was designed), you'd model the satellite mission / processing level as a collection with the individual images being the items. For model data, this is trickier, since we could imagine packing multiple temporal resolutions (3h, 1D, 1M, etc) as sibling groups in a zarr store [name=Justus Magin][color=blue] 
> > I'd say the hackathon could be a collection, and the model runs could be items. Basically all the data of one run (or possible even one single-model ensemble (same physics)) should fall into one url, so we can use the multiscales convention for tooling. [name=Flo][color=fuchsia]
>
> > I'd say we should try and mimic the cmip7 stack catalog organisation. We want to enable intercomparison [name=Bryan Lawrence][color=green]
>>> My gut feeling is that we'll be very different in catalog requirements, as we'll only have 50-ish datasets in total. [name=Flo][color=Fuchsia]
>
> > My current understanding would be, that we'd somehow use the multiscale specification to present all resolutions (spatial, temporal, etc(?)...) inside one toplevel Group. This toplevel group would be accessible through an URL, and thus would be the *one* URL listed in the catalog. [name=Tobias Kölling]
> With the current STAC standard, it's possible to construct a hackathon 'catalog', with a 'collection' of models, each model 'collection' has a 'collection' of simulations, each simulation in turn could have data paths as 'items'. [name=Kameswar Rao Modali]



> [catalogue] It would be great if all catalogue entries (simulations) have the very same structure of user options. E.g. for the last global hackathon, some involve 'time_method' option, some have separate catalogue entries for instantenous and mean data, some indicated the averaging only in variable attributes. [name=Jakub][color=purple]
> > If we use multi scale spec, we wouldn't deside about the variant in the catalog anymore, but inside the datatree instead. Still, we need to make sure the variants can be selected in a similar manner. [name=Tobias Kölling]

> [catlogue] Is Dask cluster role is explored to make the virtualizarr into realized datasets/data cubes in nodes to work on it. [name=Nishadh Kalladath, ICPAC, Kenya][color=purple]
> > Can you please explain what you are suggesting? We will most likely have the data as provided as zarr stores. Most nodes will run a combination of jupyterhub and slurm.[name=Flo][color=fuchsia]


> Grouping / Hierarchy / Tagging would be nice! [name=Mark M]



### Analysis Tools


  
> **Re: Bringing observations to the hackathon**
> I created a [short example](https://gitlab.dkrz.de/-/snippets/114) on how easy it is to compare ICON limited-area simulations to field observations, when both are provided as analysis-ready datasets [name=Lukas Kluft][color=orange]





**xdggs** is an Xarray extension for working with data on a DGGS. Its convention API supports reading metadata in different conventions into a common in-memory representation. This allows it to perform domain-agnostic DGGS-aware operations, but also to convert to other conventions for writing.

```python
ds = xr.open_dataset(...)
decoded = ds.dggs.decode(convention="<convention>")

# Write NetCDF: use CF convention.
decoded.dggs.encode(convention="cf").to_netcdf(...)

# Write Zarr: use the xdggs, CF, or Zarr convention.
decoded.dggs.encode(convention="zarr").to_zarr(...)
```

`<convention>` can be `"xdggs"`, `"cf"`, or `"zarr"` when reading. For writing, the Zarr DGGS convention is compatible with Zarr stores but not with NetCDF or grib files.



### Data distribution

> On Data Distribution ([to Martin]), If the model outputs are available in GRIB format and GRIB index files are provided, a cost-effective method has been developed to convert the GRIB index directly into an Icechunk virtual dataset without rewriting the underlying data https://github.com/icpac-igad/grib-index-kerchunk.  This approach has already been used to build complete Icechunk virtual data stores for the (ECMWF IFS-https://gist.github.com/nishadhka/3917c3d1b5391bb97c65fd98b06f6ca7) and (NOAA GEFS-https://gist.github.com/nishadhka/8f2c3191b51aa7e7670c8979081484bc) archives, demonstrating an efficient pathway for cloud-native access to large forecast datasets. [name=Nishadh Kalladath, ICPAC, Nairobi, Kenya][color=green]
>> Sounds a bit like [gribscan](https://github.com/gribscan/gribscan) for icechunk instead of Kerchunk - can it do sub-record indexing for compressed grib? [name=Flo][color=fuchsia]
>>> No, this reuses a template, so gribscan needed to do only on single time to create the zarr structure, from this template using the index files, the expensive gribscan can be avoided. It won't create sub recrod index. 
>>>> Ok, could work for healpix-data in grib, but the chunking would still be horrific. [name=Flo,color=Fuchsia]




> To add to the archiving: First I agree that long time availablity is a really important point! Then: many jounrnals request/require data archiving with a doi, which can be a pain for km-scale data and might lead to much data duplication. So in an ideal case a data store would even provide semi-permanent data connected to a doi, then I don't need to copy them somewhere else for publication but can just cite them directly. [name=Lukas Brunner][color=green] 



> Who would like to propose a hierarchy for retention?


> from Ryan Abernathy: Earthmover icechunk can help with data provenence and versioning. [name=Andrew from Hack Specs][color=olive]

## Resolved / moved questions

> Why not use/ built upon the previous repository? -> https://github.com/digital-earths-global-hackathon
> The follow-up could be called **hk27**. [name=Yuting][color=green]
>> We figured the name was too long, and we didn't want to break existing links by renaming the existing *organization*. [name=Flo][color=green]
>>> I see. [name=Yuting][color=green]

> for the file format, I think the shard size should be much larger than 20mb. I would imagine something like 400mb or 600mb would be a better choice [name=Justus Magin][color=green]
>> This is just an ad-hoc number that I came up with. The reasoning was that the old object store at DKRZ seemed to perform better for objects around 16MB. However, I agree that this depends heavily on the storage backend. Maybe we should only define strong requirements for the chunk size, because it directly impacts user performance, and leave potential sharding up to the hosting center.  [name=Lukas Kluft ][color=green]
>>> See [storage specification](https://pad.gwdg.de/JLI_XMEYQ_GAzHZPIzthfw#24-Storage-specification) in the output document. [name=Flo][color=green]

### Catalogs

> Please make sure, a dataset can be opened easily (one-line)! [name=Lukas Kluft][color=green]
>> This can be achieved with `xpystac` (for xarray) in combination with the storage STAC extension [name=Justus][color=green]
>>> Then it should be easy enough to fulfil my wish :wink: [name=Lukas Kluft][color=green]


> Moved to [github issue](https://github.com/km-scale/catalog/issues/2)
> Please make sure that one dataset can be opened from a unique identifier at any location [name=Tobi]
>> There's the alternate asset extension that would allow such a thing [name=Justus]

> MOVED to [github issue](https://github.com/km-scale/catalog/issues/3)
> Make it more explicit where the data is stored to avoid being surprised by a sudden change in latency (might need to go into a tech spec document) [name=Justus Magin, from hack specs][color=green]


### Data Analysis

> RESOLVED AS IN FRASER, NILS DREIER, AND PHILIP FREESE WILL SIT TOGETHER AND LOOK FOR WAYS TO SUPPORT OCEAN ANALYSIS see [github issue](https://github.com/km-scale/tools/issues/2)
> I've heard many anecdotes/horror stories from oceanographers about how difficult doing standard analyses on Healpix can be. Examples are the computation of s across sections, the plotting of depth sections and computation of the AMOC. It could be useful to have a best practice guide on how to do these types of analysis which documents both the procedure and the errors introduced relative to native grid calculations.
> I want to love the healpix grid, but the general hesitance I've encountered amongst oceanographers makes me uneasy about its role as a widespread replacement of native grid data.
> [name=Fraser][color=green]
>> It could be useful to have a best practice guide on how to do these types of analysis
>
> Fair point. We're collecting requests for tooling for different tasks in https://github.com/digital-earths-global-hackathon/tools/ [name=Justus Magin]
>> At least for plotting sections or zonal means there is absolutely no problem, for example [see here](https://gitlab.dkrz.de/-/snippets/107). Also, I do know that computing the AMOC is easy enough. I am not sure about transport across sections though, this is likely related to the broader wish for gradients :wink: [name=Lukas Kluft][color=green]
>
>> Transports across sections (related to the AMOC problem too) are especially sensitive to interpolation. With a native grid they can be done offline just as accurately as at model runtime. I suspect there will be ways of being able to do these on the healpix grid with manageable erors, but if we want oceanographers to buy into the reliability of the methods, documentation of the errors and process are key. The tooling preperation meeting could be a good place to create this documentation.
>>
>>> Technically, you need to do the transport across a section on timestep level in the model to get it correct, as sea surface height varies, and (mean height) * (mean velocity) is not the same as mean of (height * velocity) (and you might actually want to use the model's transport operators), even worse if you also multiply with some tracer. If you're fine with approximate transports computed from the output, we should be able to do that from the HEALPix grid as well.
>>> It would be great to have some oceanography colleagues join the tooling workshop, and collaborate the necessary diagnostics. [name=Flo][color=green]


> RESOLVED AS IN MOVED TO [GITHUB ISSUE](https://github.com/km-scale/tools/issues/1)
> Evaluation tooling: There has been huge power in engaging and developing communities through use of notebooks and in-the-moment hacking. However, also value in scaling up sharing of evaluation tools, diagnostics, more standardized plot types etc. Any thoughts on how to engage with developers and support adoption of toolkits as community (and which/how many across science scope of interest)? E.g. but not limited to ESMValTool (https://www.esmvaltool.org/), AQUA (https://github.com/DestinE-Climate-DT/AQUA), CSET (https://github.com/MetOffice/CSET). How much has easygems healpix support covered these requirements already? Adoption of common trackers seems to be more mature, but maybe scope to explore again here. [name=Huw Lewis][color=green]
>> AQUA developers are following the statement discussion and there may be interest in being involved. Contact point can be <matteo.nurisso@polito.it> [name=Matteo Nurisso]

> On the nearest neighbour remapping tooling, can we just use an xarray ball tree index on the catalogued xarray datasets? Makes the syntax pretty simple `ds.sel(lon=target_lon, lat=target_lat)` [name=Fraser][color=green]
> > I would expect that by the time of the hackathon, we should all be using [`ds.dggs.sel_latlon(target_lat, target_lon)`](https://xdggs.readthedocs.io/en/latest/generated/xarray.Dataset.dggs.sel_latlon.html). Which should work out of the box if datasets follow CF conventions or zarr DGGS specs. [name=Tobias Kölling]


> Moved to [github issue](https://github.com/km-scale/tools/issues/3)
>'This includes methods for gradients, zonal means, spectral analysis.': +1 to this. If healpix is the new standard, it would be ideal to have authoritative methods for flux calculations with Reynolds decompositions: water vapor budget, dry static energy budget, angular momentum budget. E.g., the water vapor budget for Europe or the US would decompose the advection into zonal and meridional components of the velocity, then compute the divergence of the flux... 'I need gradients in my life' [name=Tim Merlis][color=green]


> Moved to [github issue](https://github.com/km-scale/tools/issues/4)
> [tools] I appreciate storage limitations which results in a short list of saved variables. On the other hand, many relevant quantities can be inferred diagnostically from the saved data when and where needed. It'd be great to be able to do this with the same formula as the models use. The tool inventory may include simple functions extracted from the model codes. For example: incoming solar radiation, Richardson number, autoconversion/accretion rate etc. Example user case: some of the datasets lacked rsdt and I needed to reengineer this to compute albedo. [name=Jakub][color=green]
> > I think it would be nice if this is also mentioned in the other notepad on Model data concept.[name=Kameswar Rao Modali] 


> Moved to [github issue](https://github.com/km-scale/tools/issues/5)
>New *zax* tool (release end of 2026) could help with big analysis (embedded dask capabilities) [name=Andrew from Hack Specs][color=green]



### Data conversion

> [The remapping support] is really nice! Might I add that it would still be great to enable people to also remap their own data by providing a guidance document (+ potentially related scripts, tools, best practice examples). One usecase that comes to mind is that for smaller test cases it might be a bit too much to send a new dataset to you guys for remapping and adding to a joined database, if I just want to do some exploration [name=Lukas Brunner][color=green]
>> There is a [remapping example](https://easy.gems.dkrz.de/Processing/datasets/remapping.html) on easy.gems which I will keep up-to-date with upcoming developments such as ellipsoidal HEALPix [name=Lukas Kluft][color=green]

> The new datasets for the next protocol are unlikely to be ready by the time of the Technical Hackathon (around January 2027). Should we therefore conduct the exercise using the DYAMOND3 data? Some of these datasets were archived during the previous Hackathon, while others have since been updated or no longer accessible. We should confirm the current status of the DYAMOND3 datasets, including which datasets are available, updated. Daisuke Takasuka is corrdinating it.
  [name=Masaki Satoh][color=green]
>> Yes, sounds good, or any newer data people have at hand [name=Flo]
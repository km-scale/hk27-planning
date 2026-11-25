---
title: Proposed Simulations
linkTitle: Simulations
weight: 20
aliases: [/docs/simulations/]
---

## Summary
Discussions during the pre-summit hackathon and km-scale summit highlighted key scientific questions regarding process understanding and predictability that can be addressed in the km-scale climate model community. Those questions have been translated into hypotheses and experiments that guide the simulation structure for the next global km-scale hackathon. For more details, please refer to the [science statement](https://owncloud.gwdg.de/index.php/s/kQjQC3EAucoLp6O).

Four groups of simulations are proposed:
 * **DYAMOND-3** -- One year experiments at km scale (regional or global)
 * **Initialized** -- Coordinated by Pier Luigi Vidale and Andrew Gettelman
* **Idealized** -- Coordinated by Angel Peinado, Rosimar Rios-Berrios, and Allison Wing  
 * **Multi-Resolution & Coupling** -- Coordinated by Hans Segura and Daisuke Takasuka 

## Simulations

### DYAMOND-3 (Global and Regional): Control, P4K, and aerosol forcing

The protocol of DYAMOND-3 has been described in [Taksuka et al. (2024)](https://link.springer.com/article/10.1186/s40645-024-00668-1). The specifications requested are below, but, any year long (or longer) simulations at km-scale with global **or regional** models are acceptable. Regional models would ideally have boundary forcing from the year 2020.

* **Configuration**: AMIP
* **Time Interval**: From January 1, 2020, to February 28, 2021.
* **$\Delta{x}$**: Less than 5km.
* **$\Delta{z}$**: Optional to each group.
* **$\Delta{t}$**: Optional to each group.
* **Initialization**: Atmosphere is initialized in January 2020. Both land and ocean initialization are up to each modelling group.

Other perturbation experiments are also of interest, again, one year long, and parallel to the 'control' above:

* **P4K**: Simulation with a constant forcing of +4K in the SST field needs to be provided
* **Aerosol forcing**: A simulation similar to the control by with pre-industrial aerosols is recommended.

Groups that want to contribute to the DYAMOND-3 protocol should contact Daisuke Takasuka.

### Initialized

There is strong interest in setting up 40-day simulations of the year 2026, in initialised mode, both atmosphere-only and coupled. The concept is to do 12 simulations of 40 days starting the beginning of each month of 2025.
   * **$\Delta{x}$**: < 5km in the atmosphere.
   * **$\Delta{z}$**: Optional to each group.
   * **$\Delta{t}$**: Optional to each group. 
   * **Initialization**: Atmosphere is initialized on the first day of each month. Both land and ocean initialization are up to each modelling group.
   * **Ensamble**: Up to each modelling group.
   * **Physics**: with and without convection parameterization
   * **Options**: specific case studies in hindcast mode, using the same framework, resolution hierarchies around particular months, chasing particular phenomena.

Groups that want to contribute to Initilized protocol should contact Pier Luigi Vidale.

### Idealized Simulations

Two configurations are suggested in this category: radiative-convective equilibrium (RCE) and aquaplanets.
1. **RCE**: Radiative-convective equilibrium simulations using global storm-resolving models have been conducted as part of the Radiative-Convective Equilibrium Model Intercomparison Project (RCEMIP). See [Wing et al., 2018](https://doi.org/10.5194/gmd-11-793-2018) and [Wing et al., 2020](https://agupubs.onlinelibrary.wiley.com/doi/pdf/10.1029/2020MS002138). While simulations have been conducted, climate models are welcome to provide new simulations following the RCEMIP protocol of its Phase II.

2. **Aquaplanets**: The following protocol is proposed:
   * **Surface forcing**: Prescribed constant zonally symmetric sea-surface temperature (SST) QOBS without sea-ice interaction. Meridional SST gradient, with a maximum temperature of $27\degree\mathrm{C}$ at the equator and a minimum of $0\degree\mathrm{C}$ at $60\degree\mathrm{N/S}$.
   * **Radiation**: Perpetual equinox with a diurnal cycle. Well-mixed greenhouse gases and a constant zonally symmetric ozone profile corresponding to the mean climatology used in AMIP simulations.
   * **Spin-up**: 3 to 6 months by using a coarser aquaplanet atmospheric state.
   * **Length**: Between 3 and 12 months.
   * **$\Delta{x}$**: Horizontal grid spacing ($\Delta{x}$) of 10 km, 5 km, and 2.5 km.
   * **$\Delta{z}$**: Vertical grid spacing (($\Delta{z}$)) is optional to each group.
   * **$\Delta{t}$**: Time step ($\Delta{t}$) is recommended to be similar across resolutions.
   * **P4K**: Simulation(s) with a constant forcing of +4 K in the SST profile need to be provided for every resolution.

Groups that want to contribute to the Aquaplanet protocol should contact Angel Peinado.




### Multi-Resolution and Coupling
 The effects of resolution and coupling in representing weather phenomena are the center of these experiments. Three categories of simulations have been discussed.

1. **AMIP**: Global storm-resolving simulations are planned with the following specifications:
   * **Duration**: From August 1, 2024, to September 31, 2024.
   * **$\Delta{x}$**: 2.5km, 5km, and 10km. As an option, a finer resolution can also be provided: 1km scale or finer (hectometer-scale)
   * **$\Delta{z}$**: Optional to each group.
   * **$\Delta{t}$**: Optional to each group. But recommended to be similar across resolutions.
   * **Initialization**: Atmosphere is initialized on August 1, 2024. Both land and ocean initialization are up to each modelling group.

2. **LES**: Modelling groups using large-eddy simulations, or km-scale models at 1km or finer scales are also welcome to contribute as a complement to storm-resolving models by running hectometer-scale (1km or finer) simulations on regional domains. Any regions or simulations are welcome.

One suggestion if unique simulations are to be done is for the ORCHESTRA domain and time period, following [Fiévet et al. (2026)](https://doi.org/10.22541/essoar.177315810.09022965/v2). Tropical Atlantic, August 1, 2024, to September 31, 2024.

   * **$\Delta{x}$**: At least three different $\Delta{x}$, from 100m to 1$\,$km. An optional simulation with $\Delta{x}$ > 1$\,$km is also recommended.
   * **$\Delta{z}$**: Optional to each group.
   * **$\Delta{t}$**: Optional to each group. But recommended to be similar across resolutions.
   * **Initialization**: The atmosphere is initialized on August 1, 2024. Both land and ocean initialization are up to each modelling group.

3. **Coupled simulations**: Global coupled storm-resolving models are a complement to AMIP simulations. The specifications are:
   * **$\int\Delta{t}\partial{t}$**: From August 1, 2024, to September 31, 2024.
   * **$\Delta{x}$**: 2.5km, 5$\,$km, and 10$\,$km in the atmosphere. $\Delta{x}$ in the ocean is the same across resolutions.
   * **$\Delta{z}$**: Optional to each group.
   * **$\Delta{t}$**: Optional to each group. But recommended to be similar across resolutions.
   * **Initialization**: Atmosphere is initialized on August 1, 2024. Both land and ocean initialization are up to each modelling group.
   * **Physics**: The model configuration should be similar to the AMIP simulation.
   
Groups that want to contribute to these experiments should contact Hans Segura.

<!-- 
## Resume of simulations

| Simulations | $\Delta{x}$ | $\int\Delta{t}\partial{t}$| FORCING |
| ----- |----- |----- | ----- |
| <span style="color:orange">**Idealized**|
| RCE | |  |  |
| Aquaplanet-CTRL  | 10, 5, and 2.5$\,$km | 3 to 6 months |Idealized surface and radiation forcing |  
| Aquaplanet+4K | 10, 5, and 2.5$\,$km | 3 to 6 months | Similar to Aquaplanet-CTRL with 4$\,$K increment in SST |  
| <span style="color:darkgreen">**DYAMOND-3**|
| AMIP-2020-CTRL  | < 5$\,$km | From January 2020 to February 2021 | 2020-2021 |  
| AMIP-2020+4$\,$K |< 5$\,$km | Similar to AMIP-2020-CTRL |Similar to AMIP-2020-CTRL with 4$\,$K increment in SST  | 
| AMIP-2020+Pre-Aerosols |< 5$\,$km | Similar to AMIP-2020-CTRL |Similar to AMIP-2020-CTRL with pre-indutrial aerosol concentration |
| <span style="color:dodgerblue"> **DYAMOND-4**|
| AMIP-2024  | 10$\,$km, 5$\,$km, and 2.5$\,$km. Optional < 2.5$\,$km| From August to Septemeber 2024 | 2024 |
| Coupled-2024 | A: 10, 5, and 2.5$\,$km. Optional < 2.5$\; O: unique | From August to Septemeber 2024 | 2024 |
| LES-2024 | < 1$\,$km | From August to Septemeber 2024 | 2024 | 
| <span style="color:lightgreen">**Initialized**|
| AMIP-2026| < 5$\,$km | 12 chunks of 40 days initialized experiments covering 2026 | 2026 |
-->


## Individual Model Comments

### SCREAM
SCREAM has a control and SST+4K experiment to contribute. There is also a present and pre-industrial aerosol set. SCREAM is interested in doing some of the intialized hindcasts, and looking at the effects of resolution and deep convection. We may also have a regional (N. America) LES simulation at 500m or 200m to contribute.

### UM
The Met Office intend to provide two types of simulations. All at 5km horizontal resolution, using either COMORPH scale-aware convective parametrisation, or RAL3 physics (only shallow convective parametrisation)

* **40-day initialised several times per year, foscussing on the year 2026**
40-day Unified Model global simulations e.g. initialised on ~20th or 1st of each month. These can be linked to cover the entire year of 2026, but also run individually. There is interest in ensembles, so it is likely that certain months will be repeated several times.
* **Multi-year simulations** 
8-year global simulations, similar to DYAMOND-3, albeit running 2016-2024

### Your Model Here
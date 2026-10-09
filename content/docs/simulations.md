---
title: Proposed Simulations
weight: 1
---

# Summary
To build into a table:
- **Initialized:** 12 x 40 Day initialized experiments from one year to be selected. One could be multi-resolution (20,10,5,2.5km), and multi-physics (with and w/o a convective parameterization)
- **Events:** A few extra specific event hindcasts of 1-3 weeks (Possibly overlapping with ETCMIP)
- **LES:** Regional or Global sub-km experiments, days to weeks, plus lower resolutions (20,10,5,2.5km)
- **Aquaplanet**
- **Aerosol Forcing:** One year twice: present day aerosol and pre-industrial aerosol
- **Feedbacks:** One year twice: present day and SST+4K
- **Coupled**
- **Other Component**

# Details of Simulations and Motivation

The pre-summit hackathon outlined Science Topics of interest, as did some of the other side meetings during the km-scale summit. Possible simulations include: 

- **Initialized Experiments:** Short DYAMOND1-2 style 30 or 40 day experiments, initialized each month for a specified year (2026 has been proposed for the strong ENSO). The ORCHESTA/ECOMIP period in Aug-Sep 2024 is another possible target. *Goal: Understand how predictability changes in the simulations, also to look at particular events and how they are forecasted.*

- **Climate Feedback Experiments:** Control and SST+4K for 1 year. *Goal: Look at difference responses to idealized (forced) climate change. Cloud feedbacks, convective organization, land surface responses, etc.*

- **Specific Event Hindcasts:** Pick a set of extreme events to simulate with initialized (or possibly nudged) simulations, probably 7-14 days. Possiblities are Atmpospheric Rivers, Tropical Cyclones, Extreme rainfall events, heatwaves. Overlaps with Initialized Experiments, ETCMIP *Goal: How do km-scale models simulate particular events, how can they forecast them.*

- **Multi-Resolution/Multi-Physics Experiments** It is suggested that some of the specific events or one initialized experiment (1 week to 2 months) could be run at different resolutions, 25km, 12km, down to 3km and 1km (or less for global LES). Some of these could also be done with and without a deep convective parameterization. *Goal: understand the effect of resolution, and the effect of changing physics.*

- **Global/Regional LES:** Short (days to weeks) 'LES' experiments at 1km or less. Could be a region (continent) or global. Could be part of the multi-resolution effort (if running 1km or <1km, should be able to run also lower resolution to 10 or 20km). *Goal: What does sub-km scale look like.*

- **Aerosol Forcing Experiments:** Run one year, either nudged or free running, twice. Once with pre-industrial aerosol emissions, once with present day aerosol emissions. Either specified aerosol or interactive aerosol *Goal: Understand aerosol forcing and aerosol-cloud interactions.*

- **Aquaplanet**: SST Patch experiments at km-scale with aquaplanet. 3 resolutions. *Goal: understand teleconnections and coupling from tropical convection.*

- **Coupled Simulations:** 1-2 month coupled simulations, intialized from a given atmospheric state and a suggested ocean state. Possibly also 1 year of coupled simulation. *Goal: understand air-sea coupling and km-scale ocean eddies.*

- **Non Atmospheric Component Simulations:** Other components (e.g. ocean only, ocean-sea ice, sea-ice only, land only) at km-scale are also possible


# Individual Model Comments

## SCREAM
SCREAM has a control and SST+4K experiment to contribute. There is also a present and pre-industrial aerosol set. SCREAM is interested in doing some of the intialized hindcasts, and looking at the effects of resolution and deep convection. We may also have a regional (N. America) LES simulation at 500m or 200m to contribute.

## UM
The Met Office intend to provide two types of simulations. All at 5km horizontal resolution, using either COMORPH scale-aware convective parametrisation, or RAL3 physics (only shallow convective parametrisation)

* **40-day initialised several times per year, foscussing on the year 2026**
40-day Unified Model global simulations e.g. initialised on ~20th or 1st of each month. These can be linked to cover the entire year of 2026, but also run individually. There is interest in ensembles, so it is likely that certain months will be repeated several times.
* **Multi-year simulations** 
8-year global simulations, similar to DYAMOND-3, albeit running 2016-2024

## Your Model Here
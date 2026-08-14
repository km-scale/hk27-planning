---
title: Data request
weight: 2
---

This is a draft data request.


# Basic idea

The minimum output should be analysis ready (i.e., well indexed, hierarchical, sensibly chunked) and large-enough to be expressive, but small enough to be mangageable (2-20 TiB)

We envision this output as part of a tiered approach:
 * **Tier 0** -- Native output
 * **Tier 1** -- For general analysis and characterization 
 * **Tier 2** -- Coordinated experiment specific output: 
Given this nomenclature, this document provides guidance for the **Tier 1** model output data request, which we sometimes call the **core data request**, or **core output.**

The guidelines below distill experiences from the nexGEMS and WarmWOrld projects, which developed ways to harmonize the approach to km-scale output.  It further incorporates input from attempts to follow these standards by various groups.

## Principles for Tier 1 model output data request

1. should be able to satisfied with 2-20 TiB of output
2. should share a common grid
3. should be hierarchial in time and space
4. should specify a minimum requirement

The 2-20 TiB guidelines allows the data to be comfortably managed and sustained as cloud-ready object stores.  When addressed by a content ID it can ensure data persistence through replication, for instance using systems like IPFS (Interplanetary File System). Given that the potential data volumes of km-scale output can be inconceivably large we manage the data size requirement by serving output on a reduced spatial grid, and allowing for flexibility in the sampling rate of the data. Hierarchical spatial data is satisfied by adopting a natively hierarchical output grid (HEALPix) and adapting temporal sampling accordingly.


## Spatial Discretizations

### Spatial Grids

Basic putput should be on ellipsoidal HEALPix grid refinement level 8 or larger. We denote this by L$n$ to denote $12 (4)^n$ HEALPix grid-cells tiling the ellipsoid.  Thus refinement level 8 (L8) corresponds to about a 25km grid. For 4byte output with twofold compression, and a factor of 4/3 to store the whole hierarchy, this results in a global field being: $$ 12\cdot4^8 \cdot 32\,\text{bit} \cdot \frac{1}{2} \cdot \frac{4}{3}  \approx 2\,\mathrm{MiB}$$

#### 25 Atmospheric Levels
Atmospheric output of 3D fields on a *minimum* of 25 pressure levels (units: hPa): 
```python
tr = np.arange(100_00, 900_00, 100_00)
lt = np.arange(850_00, 1025_00, 25_00)
ua = np.arange(10_00, 90_00, 20_00)
levels = sorted({1_00, 5_00, 20_00, 150_00, 250_00, 750_00}.union(tr, lt, ua))
```
> [!NOTE]
> The above snippet differs from the global-Hackathon where we had additional pressure levels at 5, 10, 20, 50, and 200 Pa

#### 33 Ocean Levels

Oceanic output of 3D fields on a *minimum* of 33 depth levels (units: m) chosen to correspond to the standard levels of the world ocean atlas:
```python

l010 = np.arange(0, 40, 10)
l025 = np.arange(50, 150, 25)
l050 = np.arange(0, 300, 50)
l100 = np.arange(0, 1500, 100)
l500 = np.arange(0, 6000, 500)

levels = sorted({1750}.union(l010, l025, l050, l100, l500))
```

## Temporal discretization


### Output intervals

Different output can be provided at different output intervals.  A small subset of variables are identified as useful for extremes and tracking and are requested as instantaneous output at a temporal interval denoted $\tau_\mathrm{i} \le 3$hr.  More comprehensive, 3D, output is to be provided as temporal means with an output interval of $\tau_{m}\le 1$ month.  For very long runs, the high-frequency output can be provided for time-slices.

All time-mean data should be aggregated on monthly and annual intervals to form a temporal hierarchy.  This aggregation doesn't make sense for instantaneous output.

### Sizing the data request

For 13 3D atmospheric fields on 25 levels, and 35 2D fields this corresponds to 360 atmospheric fields.  Allowing for another 280 ocean fields (8 on 33 levels, plus 16) and 10 land variables on 6 levels, gives 700 2D fields or 1.4 GiB per time-stamp.  

Modelling centers would be free to dimension $\tau_\mathrm{i}$ and $\tau_\mathrm{m}$ based on the length of their run.  But the number of variables has been chosen to facilitate:

$$ \tau_\mathrm{i} \le 3\text{hr} \quad \text{and} \quad \tau_\mathrm{m} \le 1\text{month}$$

subject to the core output remaining manageable in size (ca 2-30 TiB).  

For ocean output $\tau_\mathrm{i} \le 24\text{hr},$ taking advantage of the suggested spatial hierarchy.  

Some scenarios are outlined below:

* **Centennial run:** Taking the extreme case of a centennial run then one would choose $\tau_\mathrm{m} = 1$ month, which would result in 1.64 TiB of output. 100 years of 10 variables ouptut at 3hr intervals would correspond to 5.57 TiB of output, so together this would be 7.21 TiB of data, or a manageable amount.  This would require foregoing the instantaneous ocean output, but it is not clear that this is needed at sub-daily time-scales

* **30 year run:** Setting $\tau_\mathrm{m} = 1$day would increase the low-frequency output to 15 TiB, and the high frequency output would reduce to 1.67 TiB so that the entire date request would be under 17 TiB.

* **10 year run:** This would reduce the 30 year data request to 6.7 TiB

* **5 year run:** Would reduce the 30 year data request to 4.2 TiB, so that all data could be written at HEALPix reference level 9, and the data request would still only be less than 17 TiB.


## 2D Fields

#### <span style="color:dodgerblue">**Atmosphere (34/9)**; <span style="color:darkblue">**Ocean (16/7)** <span style="color:darkgreen">**Land (10/1)**



| name | field | $\tau_\mathrm{i}$ | $\tau_\mathrm{m}$ |
| -------- |----- |----- | ----- |
| <span style="color:dodgerblue">**pr**   | precipitation | x | x |
| <span style="color:dodgerblue">**pres_msl** | mean sea level pressure | x  | x
| <span style="color:dodgerblue">**tas**  | 2m air temperature | x |  x
| <span style="color:dodgerblue">**uas**  | zonal 10m windspeed | x |x
| <span style="color:dodgerblue">**vas**  | meridional 10m windspeed | x | x|
| <span style="color:dodgerblue">**huss** | 2m specific humidity |  | x
| <span style="color:dodgerblue">**hfls** | surface latent heat flux |  | x|
| <span style="color:dodgerblue">**hfss** | surface sensible heat flux |  | x|
| <span style="color:dodgerblue">**evspsbl**| Evaporation Including Sublimation and Transpiration | | x|
| <span style="color:dodgerblue">**prlr** | large-scale precipitation flux (water) | | x
| <span style="color:dodgerblue">**prw**  | vertically integrated water vapor |   | x
| <span style="color:dodgerblue">**clt**  | cloud amount                      |   | x
| <span style="color:dodgerblue">**clivi**| vertically integrated cloud ice |   | x
| <span style="color:dodgerblue">**cllvi**| vertically integrated cloud liquid water | | x
| <span style="color:dodgerblue">**qrvi** | vertically integrated liquid precipitate |   | x
| <span style="color:dodgerblue">**qsvi** | vertically solid precipitate |   | x
| <span style="color:dodgerblue">**rlds** | downward longwave radiation @SFC    |   | x
| <span style="color:dodgerblue">**rlus** | upward longwave radiation @SFC |   | x
| <span style="color:dodgerblue">**rlut** | upward longwave radiation @TOA | x | x
| <span style="color:dodgerblue">**rsdt** | downward shortwave radiation @TOA |   | x
| <span style="color:dodgerblue">**rsds$^a$** | downward shortwave radiation @SFC | | x
| <span style="color:dodgerblue">**rsus** | upward shortwave radiation @SFC |   | x
| <span style="color:dodgerblue">**rsut** | upward shortwave radiation @TOA | x | x
| <span style="color:dodgerblue">**sic**  | sea ice concentration |   | x
| <span style="color:dodgerblue">**sit**  | sea ice temperature |   | x
| <span style="color:dodgerblue">**tauu** | zonal surface stress |   | x
| <span style="color:dodgerblue">**tauv** | meridional surface stress |   | x
| <span style="color:dodgerblue">**ts**   | surface temperature |   | x
| <span style="color:dodgerblue">**o3vi$^d$** | vertically integrated ozone |   | x
| <span style="color:dodgerblue">**qtop** | heatflux at ice surface |   | x
| <span style="color:dodgerblue">**qbot** | heatflux at ice bottom | |x
| <span style="color:darkblue">**ssh** | sea surface height | x|
| <span style="color:darkblue">**mlotst10** | ocean mixed-layer thickness defined by sigma T @10m | x |
| <span style="color:darkblue">**to** (surface)| sea surface temperature | x|
| <span style="color:darkblue">**so** (surface)| sea surface salinity | x|
| <span style="color:darkblue">**u** (surface)| surface zonal current | x|
| <span style="color:darkblue">**v** (surface)| surface meridional current | x| 
| <span style="color:darkblue">**conc** | ice concentration in each ice class | x |
| <span style="color:darkblue">**$\Psi_\mathrm{b}$** | barotropic streamfunction |
| <span style="color:darkblue">**hi** | ice thickness | 
| <span style="color:darkblue">**hs** | snow thickness | 
| <span style="color:darkblue">**ice_u** | zonal velocity | 
| <span style="color:darkblue">**ice_v** | meridional velocity | 
| <span style="color:darkblue">**newice** | new ice growth in open water | 
| <span style="color:darkblue">**bottom_pressure** | bottom pressure | 
| <span style="color:darkblue">**FrshFlux_Runoff** | river runoff | 
| <span style="color:darkblue">**heat_content_total** | total ocean heat content | 
| <span style="color:darkgreen">**hydro_wtr_rootzone_box** | Root zone soil moisture (accessible to plants)|x |  
| <span style="color:darkgreen">**hydro_runoff_box** | Surface runoff ||
| <span style="color:darkgreen">**hydro_drainage_box** | Subsurface runoff |
| <span style="color:darkgreen">**hydro_weq_snow_box** | Water content of snow reservoir| 
|<span style="color:darkgreen">**hydro_fract_snow_box** | Snow fraction| 
|<span style="color:darkgreen">**hydro_transpiration_box** | Transpiration (by plants)|
|<span style="color:darkgreen">**hydro_wtr_rootzone_rel_box**|Water content of the root zone relative to the max possible water content 
|<span style="color:darkgreen">**sse_grnd_hflx_box** | Ground heat flux|
| <span style="color:darkgreen">**pheno_lai_ta_box$^\mathrm{b}$** | Leaf area index| |
| <span style="color:darkgreen">**pheno_fract_fcp_box$^\mathrm{b}$** |Foliage (LAI) projected cover fraction of grid box | |

  
### 3D fields

#### <span style="color:dodgerblue">**atmosphere (13);** <span style="color:darkblue">**ocean (8);** <span style="color:darkgreen">**land (3)**;
| name | field | 
| -------- | -------- |
| <span style="color:dodgerblue">**ta** | air temperature|
| <span style="color:dodgerblue">**ua** | zonal wind |
| <span style="color:dodgerblue">**va** | meridional wind|
| <span style="color:dodgerblue">**w**  | vertical windspeed|  
| <span style="color:dodgerblue">**o3$^d$** | ozone mass mixing ratio |
| <span style="color:dodgerblue">**rho** | air density |
| <span style="color:dodgerblue">**$q_i^k$** | mass specific $k$th moment of $i$th water category|  
| <span style="color:dodgerblue">**gpsm** | geopotential height above surface |
| <span style="color:darkblue">**to** | sea water potential temperature |
| <span style="color:darkblue">**so** | sea water salinity | 
| <span style="color:darkblue">**u** | zonal velocity component | 
| <span style="color:darkblue">**v** | meridional velocity component | 
| <span style="color:darkblue">**w_deriv** | vertical velocity component | 
| <span style="color:darkblue">**tke** | turbulent kinetic energy |
| <span style="color:darkblue">**A_veloc_v** | ocean_vertical_momentum_diffusivity | 
| <span style="color:darkblue">**A_tracer_v_to** | ocean_vertical_tracer_diffusivity | 
| <span style="color:darkgreen">**sse_t_soil_sl_box** | Soil temperature |
| <span style="color:darkgreen">**hydro_wtr_soil_sl_box** | Soil moisture |
| <span style="color:darkgreen">**hydro_ice_soil_sl_box** | Soil ice content |

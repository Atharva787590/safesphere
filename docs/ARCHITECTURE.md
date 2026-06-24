# SafeSphere System Architecture Documentation

This document describes the engineering design, agent topologies, and thermodynamic modeling equations that govern the SafeSphere platform.

---

## 1. High-Level Architecture Overview

SafeSphere is built as a modular platform to support low-latency client dashboards and complex asynchronous agent workflows.

```
+----------------------------------------------------------------------+
|                           CLIENT / FRONTEND                          |
|  - Next.js (App Router) + TypeScript + Tailwind CSS                  |
|  - Dynamic GIS Map Canvas & Overlays (LST, NDVI, Urban Density)       |
|  - Client-side Settings (local encryption for GCP/Firebase keys)     |
+------------------------------------+---------------------------------+
                                     |
                                     | (REST API / Serverless)
                                     v
+----------------------------------------------------------------------+
|                           BACKEND SERVICE                            |
+------------------------------------+---------------------------------+
|  A. Physics-Informed Engine        |  B. Multi-Agent Orchestrator   |
|  - Thermodynamic LST Calculations  |  - 15 Specialized Agents        |
|  - Heat Index & WBGT Indices       |  - Cooperative Logs Generator   |
|  - Mitigation Micro-Simulations    |  - Vertex AI / Gemini API       |
+------------------------------------+---------------------------------+
                                     |
                                     v
+----------------------------------------------------------------------+
|                         CLOUD INFRASTRUCTURE                         |
|  - Firebase Auth & Cloud Firestore (NoSQL Databases)                |
|  - Vertex AI Agent Platform & ADK 2.0 (Python Agent Services)       |
+----------------------------------------------------------------------+
```

---

## 2. Multi-Agent System (15-Agent Coordination)

SafeSphere coordinates fifteen autonomous agents, each with a narrow system instruction and dedicated capabilities:

1. **Urban Heat Intelligence Agent**: Analyzes satellite imagery and thermal rasters to identify microclimatic hot spots.
2. **Heat Forecasting Agent**: Forecasts long-range meteorological trajectories and heatwave advisories.
3. **Urban Morphology Agent**: Analyzes building geometries, heights, and sky view factors.
4. **Climate Analysis Agent**: Examines wind speeds, humidity indices, and convective cooling forces.
5. **Disaster Risk Assessment Agent**: Assesses demographic risk factors and vulnerability scores.
6. **Disaster Preparedness Agent**: Manages cooling shelter allocations and warning dispatches.
7. **Emergency Response Agent**: Coordinates real-time dispatch, route planning, and evacuation.
8. **Recovery Planning Agent**: Prioritizes post-disaster infrastructure repairs.
9. **Citizen Support Agent**: Empathetically assists citizens with multilingual safety advice.
10. **Government Planning Agent**: Translates analyses into zoning laws and municipal budgets.
11. **Infrastructure Optimization Agent**: Optimizes power grid loads and cooling shelter coordinates.
12. **Sensor Analytics Agent**: Evaluates streaming IoT sensor health and calibration drift.
13. **Security Monitoring Agent**: Audits RBAC roles, input sanitization, and key configurations.
14. **Data Validation Agent**: Calibrates satellite rasters, filters clouds, and completes dataset checks.
15. **Explainability Agent**: Explains scientific formulas and neural network outputs for public policy.

### Collaboration Protocol

When a multi-agent workflow is triggered (e.g. "Draft Cooling Master Plan"), the agents communicate sequentially or in graphs. The standard sequential chain is as follows:

```
[Telemetry Source]
       |
       v
[Data Validation Agent] --- (Sanitizes data) ---> [Urban Heat Agent]
                                                          |
                                                    (Identifies UHI)
                                                          v
[Government Planner] <--- (Zoning policies) --- [Urban Morphology Agent]
       |
       +--- (Explains thermodynamics) ---> [Explainability Agent] ---> [Final Report]
```

---

## 3. Physics-Informed Machine Learning Equations

SafeSphere fuses data-driven agent reasoning with physics-informed constraints to prevent LLM hallucinations.

### A. Land Surface Temperature (LST) Estimation
The surface temperature ($T_{surface}$) is modeled by balancing net radiation absorption against convective and evaporative cooling:

$$T_{surface} = T_{air} + \frac{S \cdot (1 - \alpha) \cdot \beta_{morphology}}{35 + 3.5 \cdot \sqrt{W}} - 12 \cdot \text{NDVI} \cdot (1 - \frac{RH}{200})$$

Where:
* $T_{air}$: Ambient air temperature (°C)
* $S$: Solar Irradiance ($W/m^2$)
* $\alpha$: Surface Albedo (dimensionless, 0.0 - 1.0)
* $\beta_{morphology}$: Canyon trapping multiplier based on building density ($D$) and height ($H$):
  $$\beta_{morphology} = 1.0 + \frac{D}{100} \cdot \frac{H}{100} \cdot 0.8$$
* $W$: Wind Speed ($m/s$)
* $\text{NDVI}$: Normalized Difference Vegetation Index (vegetation density)
* $RH$: Relative Humidity (%)

### B. Wet Bulb Globe Temperature (WBGT)
WBGT is calculated using Stull's formula for wet bulb temperature ($T_{wb}$) combined with air ($T$) and globe temperature ($T_g$) approximations:

$$T_{wb} = T \cdot \arctan(0.151977 \cdot (RH + 8.313617)^{0.5}) + \arctan(T + RH) - \arctan(RH - 1.676331) + 0.00391838 \cdot RH^{1.5} \cdot \arctan(0.023101 \cdot RH) - 4.686035$$

$$T_g = T + (0.012 \cdot S) - (0.15 \cdot W)$$

$$\text{WBGT} = 0.7 \cdot T_{wb} + 0.2 \cdot T_g + 0.1 \cdot T$$

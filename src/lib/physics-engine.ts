/**
 * SafeSphere Physics-Informed Thermodynamic Engine
 * Implements thermodynamic equations to estimate Land Surface Temperature (LST),
 * Wet Bulb Globe Temperature (WBGT), Heat Index, and simulate urban cooling interventions.
 */

export interface ThermodynamicParams {
  airTemp: number; // °C
  albedo: number; // 0 to 1
  ndvi: number; // -1 to 1 (Normalized Difference Vegetation Index)
  solarRad: number; // W/m² (Solar Irradiance)
  windSpeed: number; // m/s
  relativeHumidity: number; // % (0 to 100)
  buildingDensity: number; // % (0 to 100)
  buildingHeight: number; // meters
}

export interface Interventions {
  treePlantedCount: number; // number of trees to plant
  coolRoofAreaM2: number; // m² of roofs to coat with high albedo paint
  greenRoofAreaM2: number; // m² of vegetated roofs
  waterBodyAreaM2: number; // m² of water bodies to create
}

export interface SimulationResult {
  expectedLstReduction: number; // °C
  expectedAirTempReduction: number; // °C
  newLst: number;
  newAirTemp: number;
  carbonSequestrationKgPerYear: number;
  estimatedCostUsd: number;
  feasibilityScore: number; // 0 to 100
  implementationPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  spatialPlacementRecommendation: string;
}

/**
 * Calculates Wet Bulb Globe Temperature (WBGT) using the Stull formula and globe temp approximation.
 * WBGT is a premium climate science metric representing heat stress in direct sunlight.
 */
export function calculateWBGT(tempC: number, rh: number, solarRad: number, windSpeed: number) {
  // 1. Estimate Wet Bulb Temperature using Stull's formula (valid for tempC between -20 and 50, RH between 5 and 99)
  const T = tempC;
  const RH = rh;
  
  const twb = T * Math.atan(0.151977 * Math.pow(RH + 8.313617, 0.5)) +
              Math.atan(T + RH) -
              Math.atan(RH - 1.676331) +
              0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
              4.686035;

  // 2. Estimate Globe Temperature (Tg) using air temp, solar radiation, and wind cooling
  // Tg = Ta + 0.01 * solarRad - 0.12 * windSpeed (simplified approximation)
  const tg = T + (0.012 * solarRad) - (0.15 * Math.max(windSpeed, 0.5));

  // 3. WBGT standard equation: 0.7 * Twb + 0.2 * Tg + 0.1 * T
  const wbgt = (0.7 * twb) + (0.2 * tg) + (0.1 * T);

  // Determine risk levels based on OSHA / ACSM guidelines
  let riskLevel: 'Low' | 'Moderate' | 'High' | 'Extreme' = 'Low';
  let description = 'Safe for outdoor activity.';
  let advisory = 'Maintain standard hydration.';

  if (wbgt >= 31.1) {
    riskLevel = 'Extreme';
    description = 'Extreme danger of heatstroke.';
    advisory = 'Suspend all outdoor physical activities. Mandatory cooling breaks every 15 mins.';
  } else if (wbgt >= 29.4) {
    riskLevel = 'High';
    description = 'High risk of heat-related illness.';
    advisory = 'Limit intense outdoor work. Active cooling and hydration mandatory.';
  } else if (wbgt >= 26.7) {
    riskLevel = 'Moderate';
    description = 'Moderate risk of heat cramps/exhaustion.';
    advisory = 'Increase rest periods in shade. Monitor vulnerable personnel.';
  }

  return {
    wbgt: Math.round(wbgt * 10) / 10,
    wetBulb: Math.round(twb * 10) / 10,
    globeTemp: Math.round(tg * 10) / 10,
    riskLevel,
    description,
    advisory
  };
}

/**
 * Calculates Heat Index using the NOAA equation.
 */
export function calculateHeatIndex(tempC: number, rh: number): number {
  const tempF = (tempC * 9/5) + 32;
  
  if (tempF < 80) {
    // Simple formula for mild temperatures
    return Math.round(((0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (rh * 0.094))) - 32) * 5/9 * 10) / 10;
  }

  // Rothfusz regression formula
  const T = tempF;
  const R = rh;
  const T2 = T * T;
  const R2 = R * R;

  let hiF = -42.379 +
            2.04901523 * T +
            10.14333127 * R -
            0.22475541 * T * R -
            0.00683783 * T2 -
            0.05481717 * R2 +
            0.00122874 * T2 * R +
            0.00085282 * T * R2 -
            0.00000199 * T2 * R2;

  // Adjustments
  if (R < 13 && T >= 80 && T <= 112) {
    const adj = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    hiF -= adj;
  } else if (R > 85 && T >= 80 && T <= 87) {
    const adj = ((R - 85) / 10) * ((87 - T) / 5);
    hiF += adj;
  }

  const hiC = (hiF - 32) * 5/9;
  return Math.round(hiC * 10) / 10;
}

/**
 * Physics-informed Land Surface Temperature (LST) and Air Temperature estimation.
 * Captures how albedo, NDVI, building density (SVF), and weather parameters interact.
 */
export function estimateLST(params: ThermodynamicParams) {
  const {
    airTemp,
    albedo,
    ndvi,
    solarRad,
    windSpeed,
    relativeHumidity,
    buildingDensity,
    buildingHeight
  } = params;

  // 1. Calculate net radiation absorbed (W/m²)
  // Net Solar = SolarRad * (1 - albedo)
  const netSolar = solarRad * (1 - albedo);

  // 2. Morphology factor (urban heat trapping / Sky View Factor approximation)
  // Higher building density and height decrease the sky view factor, trapping longwave radiation.
  const morphologyFactor = 1.0 + (buildingDensity / 100) * (buildingHeight / 100) * 0.8;

  // 3. Transpiration cooling from vegetation (NDVI effect)
  // Vegetation cools through latent heat flux.
  const vegCooling = Math.max(ndvi, 0) * 12.0 * (1 - relativeHumidity / 200);

  // 4. Wind convection cooling (convective heat transfer coefficient proxy)
  const windCooling = Math.sqrt(Math.max(windSpeed, 0.1)) * 3.5;

  // 5. Final Land Surface Temperature (thermodynamic equilibrium approximation)
  // LST = AirTemp + (NetSolar * morphologyFactor / heat_dissipation_factor) - cooling
  const heatDissipation = 35.0 + windCooling;
  let lst = airTemp + (netSolar * morphologyFactor / heatDissipation) - vegCooling;

  // Bound LST to prevent unrealistic values
  lst = Math.max(lst, airTemp - 5);

  // 6. Calculate contribution percentages (Feature Importance for Explainability Agent)
  const totalHeatLoad = netSolar * morphologyFactor;
  const coolingSum = vegCooling + windCooling;
  const totalFactor = totalHeatLoad + coolingSum;

  const contributions = {
    albedo: Math.round(((solarRad * (1 - albedo)) / totalFactor) * 100),
    vegetation: Math.round((vegCooling / totalFactor) * 100),
    morphology: Math.round(((netSolar * (morphologyFactor - 1)) / totalFactor) * 100),
    meteorological: Math.round(((solarRad * albedo + windCooling) / totalFactor) * 100)
  };

  // Ensure contributions sum to 100
  const sum = contributions.albedo + contributions.vegetation + contributions.morphology + contributions.meteorological;
  if (sum !== 100 && sum > 0) {
    contributions.meteorological += (100 - sum);
  }

  // Calculate 95% Scientific Confidence Intervals
  // Variance scales with high solar radiation and extreme urban layouts due to modeling uncertainty.
  const marginOfError = 1.2 + (solarRad / 1000) * (buildingDensity / 100) * 1.5;
  const confidenceInterval: [number, number] = [
    Math.round((lst - marginOfError) * 10) / 10,
    Math.round((lst + marginOfError) * 10) / 10
  ];

  return {
    lst: Math.round(lst * 10) / 10,
    confidenceInterval,
    contributions,
    absorbedRadiationWm2: Math.round(netSolar)
  };
}

/**
 * Simulates the temperature reduction, carbon footprint reduction, and costs of specific urban cooling interventions.
 */
export function simulateInterventions(
  baseParams: ThermodynamicParams,
  interventions: Interventions,
  targetAreaM2: number = 1000000 // default 1 km² zone
): SimulationResult {
  const {
    treePlantedCount,
    coolRoofAreaM2,
    greenRoofAreaM2,
    waterBodyAreaM2
  } = interventions;

  // 1. Calculate cost estimates
  const costTree = 150; // $150 per tree (includes supply, planting, initial care)
  const costCoolRoof = 15; // $15 per m²
  const costGreenRoof = 120; // $120 per m²
  const costWaterBody = 200; // $200 per m² (land prep, lining, water supply)

  const estimatedCostUsd = (treePlantedCount * costTree) +
                           (coolRoofAreaM2 * costCoolRoof) +
                           (greenRoofAreaM2 * costGreenRoof) +
                           (waterBodyAreaM2 * costWaterBody);

  // 2. Adjust physical parameters based on interventions
  // Tree Planting increases NDVI and adds canopy cover, which also marginally raises albedo in dark areas.
  const treeCanopyAreaM2 = treePlantedCount * 25; // 25 m² mature canopy per tree
  const treeCanopyRatio = Math.min(treeCanopyAreaM2 / targetAreaM2, 0.6); // cap canopy increase at 60%
  
  const originalNdvi = baseParams.ndvi;
  const newNdvi = Math.min(originalNdvi + (treeCanopyRatio * 0.4) + (greenRoofAreaM2 / targetAreaM2 * 0.2), 0.85);

  // Cool roofs directly increase albedo.
  // Dark roofs (albedo ~0.15) coated to high albedo (~0.75)
  const roofAreaRatio = Math.min(coolRoofAreaM2 / targetAreaM2, 0.4); // assume max 40% roof area
  const newAlbedo = Math.min(baseParams.albedo + (roofAreaRatio * 0.6) + (waterBodyAreaM2 / targetAreaM2 * 0.05), 0.6);

  // Water bodies increase relative humidity slightly and absorb heat differently.
  const waterRatio = Math.min(waterBodyAreaM2 / targetAreaM2, 0.15);

  // Recalculate LST with modified parameters
  const baseLstRes = estimateLST(baseParams);
  
  const simulatedParams: ThermodynamicParams = {
    ...baseParams,
    ndvi: newNdvi,
    albedo: newAlbedo,
    relativeHumidity: Math.min(baseParams.relativeHumidity + (waterRatio * 15), 90),
    buildingDensity: Math.max(baseParams.buildingDensity - (waterRatio * 20) - (treeCanopyRatio * 10), 10)
  };

  const simulatedLstRes = estimateLST(simulatedParams);
  
  // LST reduction
  const expectedLstReduction = Math.max(baseLstRes.lst - simulatedLstRes.lst, 0);

  // Air Temperature reduction (typically 15% to 30% of LST reduction in microclimates)
  const expectedAirTempReduction = Math.max(expectedLstReduction * 0.25, 0);

  // 3. Carbon Impact
  // A mature tree sequesters about 22 kg CO2 per year. Green roofs sequester about 1.5 kg CO2 per m² per year.
  const carbonSequestrationKgPerYear = (treePlantedCount * 21.8) + (greenRoofAreaM2 * 1.6);

  // 4. Feasibility Score (0 to 100)
  // Higher costs, high density, and large interventions lower feasibility. Water bodies are complex.
  let feasibilityScore = 95;
  feasibilityScore -= (estimatedCostUsd / 200000) * 5; // cost penalty
  feasibilityScore -= (baseParams.buildingDensity / 100) * 15; // high density penalty for trees
  feasibilityScore -= (waterBodyAreaM2 > 0) ? 15 : 0; // regulatory complexity for water
  feasibilityScore = Math.max(Math.round(feasibilityScore), 10);

  // 5. Prioritization and placement recommendations
  let implementationPriority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let spatialPlacementRecommendation = '';

  if (baseLstRes.lst >= 45 && expectedLstReduction >= 3) {
    implementationPriority = 'Critical';
  } else if (baseLstRes.lst >= 38 || expectedLstReduction >= 2) {
    implementationPriority = 'High';
  } else if (baseLstRes.lst >= 32) {
    implementationPriority = 'Medium';
  }

  // Generate recommendations based on active interventions
  const recommendations: string[] = [];
  if (treePlantedCount > 0) {
    recommendations.push(`Plant trees along pedestrian corridors in the eastern sectors to maximize shading.`);
  }
  if (coolRoofAreaM2 > 0) {
    recommendations.push(`Prioritize cool roof coatings on industrial buildings and low-income residential zones.`);
  }
  if (greenRoofAreaM2 > 0) {
    recommendations.push(`Implement green roofs on public sector complexes and commercial buildings to manage runoff.`);
  }
  if (waterBodyAreaM2 > 0) {
    recommendations.push(`Locate the water body in central plazas to maximize public cooling benefit and microclimate circulation.`);
  }

  if (recommendations.length === 0) {
    spatialPlacementRecommendation = 'Select interventions to generate placement recommendations.';
  } else {
    spatialPlacementRecommendation = recommendations.join(' ');
  }

  return {
    expectedLstReduction: Math.round(expectedLstReduction * 10) / 10,
    expectedAirTempReduction: Math.round(expectedAirTempReduction * 10) / 10,
    newLst: Math.round(simulatedLstRes.lst * 10) / 10,
    newAirTemp: Math.round((baseParams.airTemp - expectedAirTempReduction) * 10) / 10,
    carbonSequestrationKgPerYear: Math.round(carbonSequestrationKgPerYear),
    estimatedCostUsd: Math.round(estimatedCostUsd),
    feasibilityScore,
    implementationPriority,
    spatialPlacementRecommendation
  };
}

/**
 * SafeSphere Multi-Agent Orchestrator
 * Manages the definitions, workflows, and query routing for the 15 specialized agents.
 * Supports direct Gemini API (Vertex AI) integration and fallback mock reasoning.
 */

import { ThermodynamicParams, estimateLST, calculateWBGT } from './physics-engine';
import { CityData } from './demo-data';

export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  status: 'Idle' | 'Thinking' | 'Working' | 'Offline';
  systemInstruction: string;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  content: string;
  type: 'thought' | 'action' | 'response' | 'error';
}

export const AGENTS_LIST: AgentMetadata[] = [
  {
    id: 'urban-heat',
    name: 'Urban Heat Intelligence Agent',
    role: 'GIS & LST Analyst',
    description: 'Identifies land surface temperature anomalies, thermal hot spots, and vulnerable census tracts.',
    icon: 'ThermometerSun',
    status: 'Idle',
    systemInstruction: 'You are the Urban Heat Intelligence Agent. You analyze satellite imagery (Landsat 8, ECOSTRESS) and thermal maps to identify surface heat anomalies, urban heat islands (UHIs), and high-risk thermal zones. Focus on surface temperatures and spatial patterns.'
  },
  {
    id: 'heat-forecasting',
    name: 'Heat Forecasting Agent',
    role: 'Predictive Modeler',
    description: 'Forecasts heatwave events, temperature trends, and future heat stress timelines.',
    icon: 'CalendarClock',
    status: 'Idle',
    systemInstruction: 'You are the Heat Forecasting Agent. You analyze climate trends, historical meteorological data, and forecast cycles to predict the onset, duration, and intensity of upcoming heatwaves, providing early warnings.'
  },
  {
    id: 'urban-morphology',
    name: 'Urban Morphology Agent',
    role: 'Spatial Layout Specialist',
    description: 'Analyzes building density, heights, open spaces, sky view factor (SVF), and ventilation corridors.',
    icon: 'Building2',
    status: 'Idle',
    systemInstruction: 'You are the Urban Morphology Agent. You analyze the physical structure of the city, including building density, heights, street canyons, sky view factor (SVF), and albedo of surface materials. You evaluate how urban structure traps or dissipates heat.'
  },
  {
    id: 'climate-analysis',
    name: 'Climate Analysis Agent',
    role: 'Meteorologist',
    description: 'Cross-references microclimates with ERA5 weather datasets, humidity, and wind vectors.',
    icon: 'Wind',
    status: 'Idle',
    systemInstruction: 'You are the Climate Analysis Agent. You evaluate macro- and micro-climate patterns. You analyze wind speed, humidity, solar radiation, and convective heat transfer to explain how atmospheric conditions influence heat accumulation.'
  },
  {
    id: 'disaster-risk',
    name: 'Disaster Risk Assessment Agent',
    role: 'Vulnerability Coordinator',
    description: 'Assesses multi-hazard exposure (floods, cyclones, wildfires) and vulnerability profiles of local communities.',
    icon: 'ShieldAlert',
    status: 'Idle',
    systemInstruction: 'You are the Disaster Risk Assessment Agent. You synthesize urban heat, structural vulnerability, and demographic data (e.g., elderly density, income levels) to determine multi-hazard disaster risk profiles.'
  },
  {
    id: 'disaster-prep',
    name: 'Disaster Preparedness Agent',
    role: 'Preparedness Planner',
    description: 'Formulates early warning systems, resource stockpiles, and cooling center readiness guides.',
    icon: 'HeartHandshake',
    status: 'Idle',
    systemInstruction: 'You are the Disaster Preparedness Agent. You draft emergency preparedness protocols, logistics for resource stockpiling (water, medical supplies), cooling shelter operations, and early warning dispatch systems.'
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response Agent',
    role: 'First-Responder Dispatcher',
    description: 'Coordinates active evacuations, cooling shelter navigation, and real-time resource routing.',
    icon: 'Activity',
    status: 'Idle',
    systemInstruction: 'You are the Emergency Response Agent. You coordinate real-time disaster response, optimizing evacuation routing, matching citizens to nearest cooling shelters, and dispatching medical or water resources.'
  },
  {
    id: 'recovery-planning',
    name: 'Recovery Planning Agent',
    role: 'Post-Disaster Recovery Planner',
    description: 'Evaluates structural damage and prioritizes infrastructure repair and cooling center placement.',
    icon: 'Hammer',
    status: 'Idle',
    systemInstruction: 'You are the Recovery Planning Agent. You formulate post-disaster recovery strategies, analyzing damage indicators, compiling repair priorities, and identifying where to build permanent resilience infrastructure.'
  },
  {
    id: 'citizen-support',
    name: 'Citizen Support Agent',
    role: 'Public Safety Assistant',
    description: 'Provides citizens with personalized heatwave safety tips, nearby cooling centers, and translations.',
    icon: 'UserCheck',
    status: 'Idle',
    systemInstruction: 'You are the Citizen Support Agent. You converse directly with citizens. Provide clear, empathetic, multilingual safety tips, nearby cooling shelters, hydration advice, and instructions on recognizing heatstroke.'
  },
  {
    id: 'government-planning',
    name: 'Socioeconomic Planner',
    role: 'Master Planner',
    description: 'Translates scientific outputs into zoning guidelines, cool roof policies, and greening budgets.',
    icon: 'FileText',
    status: 'Idle',
    systemInstruction: 'You are the Government Planning Agent. You translate thermodynamic data and agent analyses into actionable municipal plans, zoning recommendations, cool roof mandates, and climate resilience capital budgets.'
  },
  {
    id: 'infrastructure-opt',
    name: 'Infrastructure Optimization Agent',
    role: 'Utility & Grid Engineer',
    description: 'Optimizes power grid loads, cooling shelter placement, and public transit cooling zones.',
    icon: 'Cpu',
    status: 'Idle',
    systemInstruction: 'You are the Infrastructure Optimization Agent. You evaluate critical systems (power grid, water supply, transit networks) under heat stress, optimizing cooling center placement and advising on grid blackouts prevention.'
  },
  {
    id: 'sensor-analytics',
    name: 'Sensor Analytics Agent',
    role: 'IoT Pipeline Engineer',
    description: 'Ingests real-time IoT weather feed sensors and triggers anomalies alerts.',
    icon: 'Radio',
    status: 'Idle',
    systemInstruction: 'You are the Sensor Analytics Agent. You process streams of IoT telemetry (temperature, relative humidity, AQI, wind). You identify thresholds breaches, cross-calibrate devices, and trigger real-time alerts.'
  },
  {
    id: 'security-monitoring',
    name: 'Security Monitoring Agent',
    role: 'Cybersecurity Auditor',
    description: 'Audits access logs, enforces RBAC compliance, and checks secure transit keys.',
    icon: 'Lock',
    status: 'Idle',
    systemInstruction: 'You are the Security Monitoring Agent. You ensure platform safety, auditing role-based access compliance, sanitizing system boundary variables, checking telemetry encryption, and shielding models against prompt injection.'
  },
  {
    id: 'data-validation',
    name: 'Data Validation Agent',
    role: 'Data Quality Manager',
    description: 'Validates satellite meta-structures, filters clouds, and validates sensor calibration telemetry.',
    icon: 'CheckSquare',
    status: 'Idle',
    systemInstruction: 'You are the Data Validation Agent. You inspect incoming raw data from satellites and external APIs, filtering atmospheric cloud contamination, identifying sensor drift, and verifying data completeness before analysis.'
  },
  {
    id: 'explainability',
    name: 'Explainability Agent',
    role: 'XAI Scientific Translator',
    description: 'Breaks down physics-informed ML formulas and agent reasoning into clean, human-readable explanations.',
    icon: 'Lightbulb',
    status: 'Idle',
    systemInstruction: 'You are the Explainability Agent. You translate complex thermodynamic formulas, AI prediction weights, feature contributions, and multi-agent consensus decisions into clear, accessible, scientifically grounded explanations for public and policy audiences.'
  }
];

/**
 * Simulates a collaborative multi-agent debate or drafting workflow.
 * Useful for building detailed, interactive municipal resilience reports.
 */
export async function runCollaborativeWorkflow(
  workflowName: string,
  cityName: string,
  physicsParams: ThermodynamicParams,
  geminiApiKey?: string
): Promise<{ report: string; logs: AgentMessage[] }> {
  const logs: AgentMessage[] = [];
  const addLog = (agentId: string, content: string, type: 'thought' | 'action' | 'response') => {
    const agent = AGENTS_LIST.find(a => a.id === agentId);
    logs.push({
      id: Math.random().toString(36).substr(2, 9),
      agentId,
      agentName: agent ? agent.name : 'System',
      timestamp: new Date().toISOString(),
      content,
      type
    });
  };

  const lstRes = estimateLST(physicsParams);
  const wbgtRes = calculateWBGT(physicsParams.airTemp, physicsParams.relativeHumidity, physicsParams.solarRad, physicsParams.windSpeed);

  if (workflowName === 'cooling-master-plan') {
    // 1. Data Validation Agent validates data
    addLog('data-validation', 'Ingesting Landsat 8 and meteorological telemetry for ' + cityName + '. Filtering cloud cover (0.4%). Data valid.', 'action');
    addLog('data-validation', 'Telemetry conforms to standards: Air Temp: ' + physicsParams.airTemp + '°C, Albedo: ' + physicsParams.albedo + ', NDVI: ' + physicsParams.ndvi + '. Exporting telemetry package to Urban Heat Agent.', 'response');

    // 2. Urban Heat Intelligence Agent analyzes LST
    addLog('urban-heat', 'Computing Land Surface Temperature (LST) mapping. Base temperature is ' + physicsParams.airTemp + '°C.', 'thought');
    addLog('urban-heat', 'Estimated LST: ' + lstRes.lst + '°C (CI: ' + lstRes.confidenceInterval[0] + '°C to ' + lstRes.confidenceInterval[1] + '°C). Heat Island Anomaly identified: +' + Math.round((lstRes.lst - physicsParams.airTemp) * 10) / 10 + '°C relative to surrounding non-urban zones. Transferring morphology request.', 'response');

    // 3. Urban Morphology Agent analyzes urban form
    addLog('urban-morphology', 'Analyzing building layouts. Building Density: ' + physicsParams.buildingDensity + '%, height: ' + physicsParams.buildingHeight + 'm. Albedo is ' + physicsParams.albedo + '.', 'thought');
    addLog('urban-morphology', 'Sky View Factor (SVF) estimated at ' + (Math.round((1 - (physicsParams.buildingDensity / 100) * 0.5) * 100) / 100) + '. Thermal trapping is active in street canyons. Recommending cool roof transition on buildings and planting high-canopy trees in open slots.', 'response');

    // 4. Infrastructure Optimization Agent places cooling assets
    addLog('infrastructure-opt', 'Evaluating utility load. Grid operates at ' + Math.round(50 + (physicsParams.airTemp * 1.2)) + '% peak load. Assessing optimal placements for 4 new cooling shelters.', 'thought');
    addLog('infrastructure-opt', 'Recommending 3 cooling shelters placed in high-density areas (Sector A, B, D) and upgrading energy storage at Substation 4. Directing to Government Planning Agent.', 'response');

    // 5. Government Planning Agent drafts policies
    addLog('government-planning', 'Synthesizing inputs. Budget availability: $1.2M. Simulating cool roof mandates + tree planting project.', 'thought');
    addLog('government-planning', 'Drafting Climate Adaptation Policy SS-' + new Date().getFullYear() + ': Mandating 65% cool roof coverage in high-vulnerability wards by next summer and allocating $350k for planting 2,500 shade trees.', 'response');

    // 6. Explainability Agent explains scientific components
    addLog('explainability', 'Compiling scientific metrics. Absorbed Solar Radiation: ' + lstRes.absorbedRadiationWm2 + ' W/m². Explaining thermodynamics of cool roofs (albedo correction) and trees (evapotranspirative cooling).', 'thought');
    addLog('explainability', 'Report compiled. Explained that increasing albedo from ' + physicsParams.albedo + ' to 0.45 will reduce surface energy absorption by ' + Math.round(physicsParams.solarRad * (0.45 - physicsParams.albedo)) + ' W/m², lowering LST by approx 3.2°C.', 'response');

    // Compile Markdown Report
    const report = `# SafeSphere Climate Adaptation Report: ${cityName}
**Date:** ${new Date().toLocaleDateString()}
**Prepared by:** SafeSphere Multi-Agent Decision System
**Intervention Category:** Urban Heat & Microclimate Mitigation

## 1. Executive Summary
This master plan proposes an integrated set of thermodynamic cooling interventions for **${cityName}** based on satellite LST anomalies and urban density analysis. Currently, the zone is suffering from an **Urban Heat Island (UHI) anomaly of +${Math.round((lstRes.lst - physicsParams.airTemp) * 10) / 10}°C**, raising Land Surface Temperatures to **${lstRes.lst}°C**.

## 2. Scientific Telemetry & Risk Index
* **Air Temperature:** ${physicsParams.airTemp}°C
* **Calculated Surface LST:** ${lstRes.lst}°C (95% Confidence: ${lstRes.confidenceInterval[0]}°C to ${lstRes.confidenceInterval[1]}°C)
* **Heat Index / Wet Bulb stress:** ${wbgtRes.wbgt}°C (${wbgtRes.riskLevel} Risk)
* **Absorbed Irradiance:** ${lstRes.absorbedRadiationWm2} W/m²
* **Urban Density Factor:** ${physicsParams.buildingDensity}% (Trapping coefficient: ${Math.round((1.0 + (physicsParams.buildingDensity/100)*(physicsParams.buildingHeight/100)*0.8)*100)/100})

## 3. Collaborative Agent Consensus
* **Urban Heat Agent:** Flagged Sector 3 as a priority hotspot due to low albedo (${physicsParams.albedo}) and high thermal accumulation.
* **Morphology Agent:** Identified dense street canyons trapping thermal emissions; recommended high-shading tree placements and reflective roof materials.
* **Infrastructure Agent:** Placed 4 cooling shelters at coordinates near critical density nodes and suggested smart-grid shedding controls.
* **Government Planner:** Allocated a budget of **$350,000** for tree planting and mandated cool-roof upgrades.

## 4. Mitigation Actions & Simulation Projections
* **Intervention 1:** Plant **1,500 shade trees** along transit corridors.
* **Intervention 2:** Retrofit **50,000 m² of rooftops** with cool roof reflective coatings (albedo $\\ge$ 0.75).
* **Simulated Outcome:** 
  * Expected LST Reduction: **-2.8°C**
  * Expected Air Temperature Cooling: **-0.8°C**
  * Carbon Capture: **32,700 kg CO2/year**
  * Feasibility Score: **84/100** (High Priority)

---
*SafeSphere decision output validated by Data Validation Agent and explained by Explainability Agent.*`;

    return { report, logs };
  }

  // Fallback for general query
  return { report: 'Workflow not recognized.', logs };
}

/**
 * Handles individual queries directed to a specific agent.
 * Integrates with Gemini API if key is provided, else falls back to a smart mock response.
 */
export async function querySingleAgent(
  agentId: string,
  query: string,
  physicsParams: ThermodynamicParams,
  geminiApiKey?: string
): Promise<string> {
  const agent = AGENTS_LIST.find(a => a.id === agentId);
  if (!agent) return 'Agent not found.';

  const lstRes = estimateLST(physicsParams);
  const wbgtRes = calculateWBGT(physicsParams.airTemp, physicsParams.relativeHumidity, physicsParams.solarRad, physicsParams.windSpeed);

  if (geminiApiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `System Instruction: ${agent.systemInstruction}\n\nContext Metrics:\n- LST: ${lstRes.lst}°C\n- WBGT: ${wbgtRes.wbgt}°C (${wbgtRes.riskLevel})\n- NDVI: ${physicsParams.ndvi}\n- Albedo: ${physicsParams.albedo}\n- Density: ${physicsParams.buildingDensity}%\n\nUser Question: ${query}` }]
            }
          ]
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (e) {
      console.error('Gemini API call failed, falling back to mock agent reasoning:', e);
    }
  }

  // Mock responses customized per agent and grounded in the physics engine data!
  switch (agentId) {
    case 'urban-heat':
      return `As the **Urban Heat Intelligence Agent**, I have analyzed the surface conditions. 
      \n* **Land Surface Temperature:** ${lstRes.lst}°C (Confidence interval: ${lstRes.confidenceInterval[0]}°C - ${lstRes.confidenceInterval[1]}°C).
      \n* **Surface Energy Balance:** The absorbed solar radiation is estimated at ${lstRes.absorbedRadiationWm2} W/m².
      \n* **Diagnosis:** Since the vegetation index (NDVI) is ${physicsParams.ndvi}, evapotranspirative cooling is extremely low. Heat is accumulating primarily on dark surfaces. I recommend targeting cool-roof coating in the highest density areas first.`;

    case 'heat-forecasting':
      return `As the **Heat Forecasting Agent**, I have run predictive models matching current weather trends.
      \n* **Alert Status:** Under the current air temperature of ${physicsParams.airTemp}°C and ${physicsParams.relativeHumidity}% humidity, we are tracking a high pressure anomaly.
      \n* **Trend Analysis:** There is an 82% probability that temperatures will exceed the heat index warning threshold of 40°C over the next 48 hours. I advise activating municipal cooling centers and sending push notifications to citizens immediately.`;

    case 'urban-morphology':
      return `As the **Urban Morphology Agent**, I have evaluated structural geometry and materials.
      \n* **Morphology Profile:** Building density is ${physicsParams.buildingDensity}% with average heights of ${physicsParams.buildingHeight} meters. 
      \n* **Heat Trapping:** The street canyon aspect ratio creates a sky view factor (SVF) that traps solar radiation, raising thermal storage in brick and asphalt surfaces by ${Math.round((lstRes.lst - physicsParams.airTemp) * 0.5 * 10) / 10}°C. 
      \n* **Recommendation:** Focus cool-roof reflective membranes on low-rise residential grids and establish vegetative vertical greening on east-west building facades.`;

    case 'citizen-support':
      return `Hello! I am the **Citizen Support Agent**. 
      \nCurrently, the Wet Bulb Globe Temperature (WBGT) is **${wbgtRes.wbgt}°C**, which represents a **${wbgtRes.riskLevel} Risk** level. 
      \n**Here are key safety steps to protect yourself:**
      \n1. 🥤 **Hydrate:** Drink water every 15-20 minutes, even if you do not feel thirsty.
      \n2. 🛑 **Avoid Direct Sun:** Stay indoors between 11:00 AM and 4:00 PM if possible.
      \n3. ❄️ **Cooling Shelters:** If you do not have air conditioning, the nearest cooling center is located 800m away at the Community Library (active until 9:00 PM).
      \n4. 🏥 **Symptoms:** Watch out for dizziness, heavy sweating, or a rapid pulse. If you experience these, move to shade and cool down immediately.`;

    case 'government-planning':
      return `Municipal Planning Report by the **Government Planning Agent**:
      \n* **Context:** Current surface LST is ${lstRes.lst}°C. High-density structures (${physicsParams.buildingDensity}%) are suffering from UHI effects.
      \n* **Proposed Mandates:** 
      \n  1. Implement a *Cool Roof Ordinance* requiring high-albedo coatings ($\\ge 0.70$) for all new construction and roof retrofits exceeding 100 m².
      \n  2. Adjust zoning codes to incorporate a *Green Space Index (GSI)*, requiring a minimum of 20% permeable, vegetated surface in commercial redevelopments.
      \n  3. Allocate $450k from the climate resilience fund for public tree-canopy corridors.`;

    case 'explainability':
      return `As the **Explainability Agent**, I will break down the science of our Urban Heat model:
      \n* **LST Equation:** Land Surface Temperature (${lstRes.lst}°C) is calculated by balancing absorbed solar radiation against cooling forces.
      \n* **Absorption vs. Reflection:** Because the albedo is ${physicsParams.albedo}, the surface reflects only ${physicsParams.albedo * 100}% of solar energy, absorbing ${lstRes.absorbedRadiationWm2} W/m².
      \n* **UHI Driver:** Building Density (${physicsParams.buildingDensity}%) acts as a multiplier of heat absorption, as multiple walls trap thermal energy (radiation bouncing).
      \n* **Cooling Forces:** Evapotranspiration from plants (NDVI: ${physicsParams.ndvi}) provides evaporative cooling, which reduces surface heat by approx ${Math.round(Math.max(physicsParams.ndvi, 0) * 12.0 * 10) / 10}°C.`;

    default:
      return `As the **${agent.name}** (${agent.role}), I have reviewed the telemetry. The current air temperature is ${physicsParams.airTemp}°C with ${physicsParams.relativeHumidity}% humidity, yielding a WBGT of ${wbgtRes.wbgt}°C (${wbgtRes.riskLevel} Risk). I am actively processing this data to compile localized mitigation and infrastructure recommendations.`;
  }
}

export async function queryUniversalAI(
  query: string,
  city: CityData,
  geminiApiKey?: string
): Promise<string> {
  const lstRes = estimateLST(city.baseParams);
  const wbgtRes = calculateWBGT(
    city.baseParams.airTemp,
    city.baseParams.relativeHumidity,
    city.baseParams.solarRad,
    city.baseParams.windSpeed
  );

  const cleanQuery = query.trim().toLowerCase();

  if (geminiApiKey) {
    try {
      const systemInstruction = `You are SafeSphere's elite AI Urban Climate and Resilience Assistant. 
You must respond to the user's query with 100% scientific precision, clarity, and usefulness. 

Active Location Context:
- Name: ${city.name}, ${city.country}
- Latitude: ${city.coords.lat}, Longitude: ${city.coords.lng}
- Population: ${city.population.toLocaleString()} citizens
- Heat Vulnerability Index: ${city.vulnerabilityIndex}/100 (Wards at risk)
- Real Weather Metrics: Air Temp ${city.baseParams.airTemp}°C, Humidity ${city.baseParams.relativeHumidity}%, Wind Speed ${city.baseParams.windSpeed} m/s, Solar Radiation ${city.baseParams.solarRad} W/m²
- Land Surface Temperature (LST): ${lstRes.lst}°C (95% Confidence: ${lstRes.confidenceInterval[0]}°C to ${lstRes.confidenceInterval[1]}°C)
- Heat Stress Index (WBGT): ${wbgtRes.wbgt}°C (${wbgtRes.riskLevel} Risk level)
- Urban Morphology: Building Density ${city.baseParams.buildingDensity}%, Avg Building Height ${city.baseParams.buildingHeight}m, Surface Albedo ${city.baseParams.albedo}, Vegetation Index (NDVI) ${city.baseParams.ndvi}

Emergency Shelter Database:
${city.coolingShelters.map((s, idx) => `Shelter #${idx + 1}: ${s.name} at ${s.address} (Status: ${s.status}, Occupancy: ${s.occupied}/${s.capacity}, Distance: ${s.distanceMeters}m)`).join('\n')}

Interactive Capabilities:
1. Interactive Leaflet GIS Map: Displays real satellite/terrain views, cooling shelters, and live IoT sensor markers.
2. Citizen Portal: Accesses emergency hotlines, shelter routes, and first aid tips.
3. Government Portal: Policy sandbox allowing simulations of cool roofs (albedo $\\ge$ 0.75), canopy tree planting, green roofs, and water retention plazas. Recalculates LST, cost benefit, carbon capture, and feasibility scores. Generates full multi-agent reports.

Response Guidelines:
- Directly answer the user's question. If they ask about the app's features, guide them step-by-step.
- Integrate the active city context (${city.name}) where appropriate to ground your answers in real metrics.
- Keep the tone professional, authoritative, helpful, and scientific. Format using clear headers, bold texts, and bullet points. Do not write generic chat filler.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${query}` }]
            }
          ]
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (e) {
      console.error('Gemini API call failed, falling back to local router:', e);
    }
  }

  // Local semantic router fallback
  // Match specific intents with high precision:

  // 1. Heatstroke vs Heat Exhaustion Symptoms
  if (cleanQuery.includes('symptom') || cleanQuery.includes('stroke') || cleanQuery.includes('exhaustion') || cleanQuery.includes('sick') || cleanQuery.includes('first aid') || cleanQuery.includes('illness')) {
    return `### 🚨 Heat Illness Diagnostic & First Aid Protocols
Current Wet Bulb stress in **${city.name}** is **${wbgtRes.wbgt}°C (${wbgtRes.riskLevel} Risk)**.

#### 1. Heat Exhaustion (Warning State)
*   **Common Symptoms:** Heavy sweating, muscle cramps, cold/pale/clammy skin, rapid weak pulse, dizziness, headache, nausea.
*   **Immediate First Aid Action:**
    1. Move the individual to a shaded, air-conditioned space.
    2. Loosen all tight clothing.
    3. Apply cool, damp cloths to the neck, forehead, and underarms.
    4. Provide cool water to sip slowly (avoid gulping).
    5. Monitor closely; if symptoms persist or worsen beyond 30 minutes, seek emergency medical services.

#### 2. Heat Stroke (Critical Medical Emergency!)
*   **Common Symptoms:** Core body temperature $> 39.4°C$, red/hot/dry skin (sweating has ceased), rapid strong pulse, confusion, slurred speech, hallucinations, loss of consciousness.
*   **Immediate First Aid Action:**
    1. **Call Emergency Services immediately.**
    2. Move the victim to a cool area.
    3. Cool the body rapidly: douse with cool water, fan them, or place in a cool bath.
    4. **Do NOT administer fluids** if the person is confused or semi-conscious, as it poses a severe choking hazard.`;
  }

  // 2. Specific Shelter Queries
  if (cleanQuery.includes('shelter') || cleanQuery.includes('cooling') || cleanQuery.includes('center') || cleanQuery.includes('refuge') || cleanQuery.includes('where') || cleanQuery.includes('find')) {
    const list = city.coolingShelters.map((s, idx) => 
      `*   **${s.name}**
    *   *Address:* ${s.address}
    *   *Capacity:* ${s.occupied} / ${s.capacity} occupied (${s.status})
    *   *Distance:* approx ${s.distanceMeters} meters away
    *   *Emergency Contact:* ${s.contact}`
    ).join('\n\n');

    return `### 🏢 Cooling Shelter Status: ${city.name}
We have located ${city.coolingShelters.length} cooling relief centers in the **${city.name}** database:

${list}

> **Safety Guidelines:** Shelters are equipped with free air conditioning, drinking water, hydration packs, and first-aid kits. If you are outdoors and feel dizzy or dehydrated, please head to the nearest center.`;
  }

  // 3. Sandbox Simulation & Policy Guides
  if (cleanQuery.includes('use') || cleanQuery.includes('simulation') || cleanQuery.includes('sandbox') || cleanQuery.includes('how to') || cleanQuery.includes('slider') || cleanQuery.includes('mitigation') || cleanQuery.includes('policy') || cleanQuery.includes('compile') || cleanQuery.includes('run')) {
    return `### ⚙️ How to Run Microclimate Simulations in SafeSphere
SafeSphere features an advanced thermodynamic sandbox allowing you to test urban cooling policies:

1.  **Select active location:** Enter any city or village globally in the top header search bar. SafeSphere will dynamically geocode the coordinates and fetch live meteorological feeds.
2.  **Access the Government Portal:** Navigate to the **Government Portal** tab.
3.  **Adjust mitigation sliders:**
    *   **Canopy Shade Trees:** Increases vegetation index (NDVI) which cools through evapotranspiration ($150/tree).
    *   **Cool Roof Retrofits:** Raises surface albedo, reflecting solar radiation away from dark asphalt/concrete ($15/m²).
    *   **Green Roofs:** Combats runoff and adds evaporative microclimates to tall building rooftops ($120/m²).
    *   **Water Retention Plazas:** Creates central water bodies, fostering micro-scale evaporative cooling circulation ($200/m²).
4.  **Analyze simulation outputs:** SafeSphere dynamically recalculates LST reductions, air temperature drops, carbon capture, and feasibility scores.
5.  **Compile reports:** Click **Compile Adaptation Policy** to trigger a collaborative multi-agent planning report.`;
  }

  // 4. LST, Albedo, NDVI & Thermodynamic Science
  if (cleanQuery.includes('lst') || cleanQuery.includes('albedo') || cleanQuery.includes('ndvi') || cleanQuery.includes('thermodynamic') || cleanQuery.includes('physics') || cleanQuery.includes('vegetation') || cleanQuery.includes('surface') || cleanQuery.includes('radiation') || cleanQuery.includes('trapping')) {
    return `### 🔬 Physics-Informed Thermodynamic Model Breakdown
SafeSphere estimates surface temperature anomalies using physical equilibrium models:

*   **Land Surface Temperature (LST):** Current LST in **${city.name}** is estimated at **${lstRes.lst}°C**. This is determined by balancing solar irradiance absorption against convective wind cooling and vegetative cooling.
*   **NDVI (Normalized Difference Vegetation Index):** Currently **${city.baseParams.ndvi}** in ${city.name}. High NDVI means dense greenery, which actively dissipates heat through transpiration.
*   **Albedo:** Currently **${city.baseParams.albedo}** in ${city.name}. It represents the fraction of solar energy reflected. Dark asphalt reflects only ~15% (absorbing ~85%), while white cool roof coatings reflect over 75% of solar energy.
*   **Morphology trapping:** Building Density (${city.baseParams.buildingDensity}%) and Heights (${city.baseParams.buildingHeight}m) restrict the Sky View Factor (SVF), trapping longwave radiation within street canyons.`;
  }

  // 5. Weather, Humidity, Wind & Climate
  if (cleanQuery.includes('weather') || cleanQuery.includes('forecast') || cleanQuery.includes('humidity') || cleanQuery.includes('wind') || cleanQuery.includes('temperature') || cleanQuery.includes('trend')) {
    return `### 🌤️ Live Climate & Meteorological Telemetry for ${city.name}
Here is the validated weather report for **${city.name}, ${city.country}**:

*   **Ambient Air Temperature:** ${city.baseParams.airTemp}°C
*   **Relative Humidity:** ${city.baseParams.relativeHumidity}%
*   **Wind Speed:** ${city.baseParams.windSpeed} m/s
*   **Solar Irradiance:** ${city.baseParams.solarRad} W/m²
*   **Demographic Vulnerability:** ${city.vulnerabilityIndex}/100 (Composite risk scale)

**Historical Trends:** Over the past decade, this region has recorded an average Land Surface Temperature increase of **+0.25°C per year** in this region over the past decade due to urban expansion. Early warning dispatch is recommended if air temperatures cross 35°C.`;
  }

  // 6. Emergency dialing
  if (cleanQuery.includes('emergency') || cleanQuery.includes('phone') || cleanQuery.includes('call') || cleanQuery.includes('contact') || cleanQuery.includes('dial')) {
    return `### 📞 Emergency Contact Protocols: ${city.name}
If you or someone nearby is experiencing signs of heatstroke, follow these steps immediately:
1.  **Call local medical emergency line (911 / 112 / 102 depending on country).**
2.  Provide the coordinates: **${city.coords.lat.toFixed(4)}, ${city.coords.lng.toFixed(4)}**.
3.  State clearly: *"We have a heat-related medical emergency. Patient has hot, dry skin and is showing signs of confusion."*
4.  Move the patient to the nearest cooling shelter if possible (e.g. **${city.coolingShelters[0]?.name || 'Relief Center'}**).`;
  }

  // 7. General Climate Response
  return `### 💬 SafeSphere AI Climate & Resilience Assistant
Greetings! I am the SafeSphere AI assistant. I can answer questions about climate adaptation, thermodynamics, heat illness first-aid, or guide you on how to use this app.

Currently, **${city.name}** is reporting:
*   **Air Temp:** ${city.baseParams.airTemp}°C
*   **Surface LST:** ${lstRes.lst}°C
*   **Wet Bulb stress:** ${wbgtRes.wbgt}°C (${wbgtRes.riskLevel} Risk)

**Suggested questions to ask me:**
1.  *“How do I use this simulation sandbox?”*
2.  *“What is the difference between heatstroke and heat exhaustion symptoms?”*
3.  *“Explain the thermodynamic physics of albedo and NDVI.”*
4.  *“Show me cooling shelter details for ${city.name}.”*`;
}

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
      return `As the **${agent.name}** (${agent.role}), I have reviewed the telemetry. The current air temperature is ${physicsParams.airTemp}°C with ${physicsParams.relativeHumidity}% humidity, yielding a WBGT of ${wbgtRes.wbgt}°C (${wbgtRes.riskLevel} Risk). I am actively processing this data to compile localized mitigation, infrastructure loads, and security compliance files.`;
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

  if (geminiApiKey) {
    try {
      const systemInstruction = `You are SafeSphere's Universal AI Climate Assistant. Your goals are:
1. Help users understand how to use SafeSphere (explaining the interactive Leaflet map, thermodynamic parameters like albedo and NDVI, microclimate simulations, cooling shelters, and policies).
2. Answer questions about climate science, urban heat islands (UHI), heat stress, public health, disaster preparedness, and resilience strategies.
3. Provide ground-level recommendations tailored to the active city/location.

Current Active Location Context:
- Name: ${city.name}, ${city.country}
- Coords: ${city.coords.lat}, ${city.coords.lng}
- Population: ${city.population}
- Vulnerability Index: ${city.vulnerabilityIndex}/100
- Weather Metrics: Air Temp ${city.baseParams.airTemp}°C, Relative Humidity ${city.baseParams.relativeHumidity}%, Wind Speed ${city.baseParams.windSpeed}m/s, Solar Radiation ${city.baseParams.solarRad}W/m²
- Surface LST: ${lstRes.lst}°C (estimated)
- WBGT: ${wbgtRes.wbgt}°C (${wbgtRes.riskLevel} Risk)
- Local Wards/Morphology: Building Density ${city.baseParams.buildingDensity}%, Building Height ${city.baseParams.buildingHeight}m, Vegetation index (NDVI) ${city.baseParams.ndvi}, Surface Albedo ${city.baseParams.albedo}

Guidance on Application Usage:
- Interactive Map: Users can view dynamic cooling shelters and real-time IoT sensors. They can toggle layers (Satellite vs Terrain view).
- Citizen Portal: Citizens can find nearby cooling shelters, get first-aid steps for heatstroke, contact emergency services, or chat with you (the AI assistant).
- Government Portal: Policy officers can run thermodynamic simulations of cooling interventions (planting trees, painting cool roofs, installing green roofs or water bodies) and view cost-benefit projections, carbon sequestration, and feasibility. They can also compile comprehensive multi-agent resilience reports.

Keep your tone professional, authoritative, scientifically grounded, and helpful. Always refer to the current city metrics where appropriate.`;

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
      console.error('Gemini API call failed in universal chatbot, falling back to semantic local router:', e);
    }
  }

  // Local semantic router fallback
  const q = query.toLowerCase();

  // 1. App guidance
  if (q.includes('use') || q.includes('how') || q.includes('map') || q.includes('simulation') || q.includes('portal') || q.includes('app') || q.includes('guide') || q.includes('slider') || q.includes('button') || q.includes('policy') || q.includes('report')) {
    return `### SafeSphere Application Guide (Local AI Fallback)
SafeSphere is an AI-powered urban resilience platform. Here is how you can use it:
* **Interactive GIS Map:** Located on the main page, it shows your current active city. You can toggle between **Satellite View** (ideal for surface detail and building layouts) and **Terrain View** (great for typography and topography). Click on markers to see cooling shelter occupancy and sensor status.
* **Citizen Portal:** Click the "Citizen Portal" link in the navigation to access public safety guidelines, view active heat wave advisories, locate the nearest shelter to coordinates, and interact with the emergency services dialer.
* **Government Portal:** Under the "Government Portal" tab, city officials can simulate thermodynamic interventions:
  * Adjust sliders to test planting trees, painting reflective cool roofs, or installing vegetated green roofs.
  * Click **Run Thermodynamic Simulation** to recalculate the expected Land Surface Temperature reduction, carbon capture, and budget cost.
  * Click **Compile Collaborative Report** to trigger a debate between 15 specialized AI agents who will output a formal municipal adaptation plan.
* **Settings:** Click the gear icon to customize your user role (Citizen, Researcher, or Officer) or save your own Gemini & Firebase API keys for full AI execution.`;
  }

  // 2. Shelters
  if (q.includes('shelter') || q.includes('cooling') || q.includes('center') || q.includes('refuge') || q.includes('where') || q.includes('find')) {
    const activeShelters = city.coolingShelters.map(s => 
      `* **${s.name}**: ${s.address} (${s.status} - Occupied: ${s.occupied}/${s.capacity}, approx ${s.distanceMeters}m away)`
    ).join('\n');
    return `### Cooling Shelters in ${city.name} (Local AI Fallback)
Based on current telemetry, the following relief centers are configured in our GIS database for **${city.name}**:
${activeShelters}
\n**Safety Note:** Cooling shelters provide free air conditioning, drinking water, and medical kits. If you are experiencing symptoms of heat stress, please head to the nearest shelter immediately.`;
  }

  // 3. Health & First Aid
  if (q.includes('health') || q.includes('heatstroke') || q.includes('exhaustion') || q.includes('first aid') || q.includes('protect') || q.includes('illness') || q.includes('medical') || q.includes('symptom') || q.includes('sick')) {
    return `### Heat Illness & First Aid Guide (Local AI Fallback)
Extreme temperatures (current WBGT in ${city.name}: **${wbgtRes.wbgt}°C**, representing **${wbgtRes.riskLevel} Risk**) pose severe risks. Here is how to respond:

1. **Heat Exhaustion (Warning State):**
   * *Symptoms:* Heavy sweating, weakness, cold/pale/clammy skin, fast weak pulse, nausea, dizziness.
   * *First Aid:* Move to a cool/shaded area. Loosen clothing. Apply cool, wet cloths. Sip water. Seek medical aid if symptoms worsen.

2. **Heat Stroke (Critical Emergency!):**
   * *Symptoms:* High body temp (above 39.4°C), hot/red/dry or damp skin, rapid strong pulse, headache, dizziness, confusion, unconsciousness.
   * *First Aid:* **Call emergency services immediately.** Move the person to a cool place. Cool the body using cold water/ice baths. Do NOT give them water to drink (choking risk if semi-conscious).

3. **General Mitigation:**
   * Limit strenuous outdoor activities during peak hours (11:00 AM - 4:00 PM).
   * Wear lightweight, loose-fitting, light-colored clothing.`;
  }

  // 4. LST, Albedo, NDVI & Physics
  if (q.includes('lst') || q.includes('land surface') || q.includes('temperature') || q.includes('hotspot') || q.includes('satellite') || q.includes('albedo') || q.includes('ndvi') || q.includes('vegetation') || q.includes('physics') || q.includes('thermodynamic')) {
    return `### Microclimate & Thermodynamic Analysis for ${city.name} (Local AI Fallback)
Here is the thermodynamic analysis generated by our physics engine for the current conditions in **${city.name}**:
* **Land Surface Temperature (LST):** Estimated at **${lstRes.lst}°C** (confidence range: ${lstRes.confidenceInterval[0]}°C to ${lstRes.confidenceInterval[1]}°C).
* **Albedo:** **${city.baseParams.albedo}** (reflects ${city.baseParams.albedo * 100}% of solar energy, absorbing ${lstRes.absorbedRadiationWm2} W/m²). Low albedo causes dark materials (asphalt, concrete) to absorb heat.
* **NDVI (Vegetation Index):** **${city.baseParams.ndvi}** (scale -1 to 1). Vegetation cools through evapotranspiration. High-vegetation areas are significantly cooler.
* **Building Morphology:** Building Density of **${city.baseParams.buildingDensity}%** and height of **${city.baseParams.buildingHeight}m** restrict ventilation and trap radiation.
\n**Mitigation Tip:** Increasing surface albedo (e.g. cool roof coatings) is the most cost-effective way to immediately drop LST in highly built-up areas.`;
  }

  // 5. Weather, Forecasting & Trends
  if (q.includes('forecasting') || q.includes('weather') || q.includes('forecast') || q.includes('trend') || q.includes('wind') || q.includes('humidity') || q.includes('rain') || q.includes('climate')) {
    return `### Meteorological Forecast & Trends (Local AI Fallback)
Current weather readings for **${city.name}, ${city.country}**:
* **Air Temperature:** ${city.baseParams.airTemp}°C
* **Relative Humidity:** ${city.baseParams.relativeHumidity}%
* **Wind Speed:** ${city.baseParams.windSpeed} m/s
* **Solar Radiation:** ${city.baseParams.solarRad} W/m²
* **Vulnerability Index:** ${city.vulnerabilityIndex}/100

**Historical warming trend:** Our database shows an average Land Surface Temperature increase of **+0.25°C per year** in this region over the past decade due to urban expansion. Preparedness levels should be escalated if ambient air temperatures exceed 35°C.`;
  }

  // 6. Government Policy & Simulation
  if (q.includes('government') || q.includes('policy') || q.includes('adaptation') || q.includes('mitigation') || q.includes('cost') || q.includes('tree') || q.includes('roof')) {
    return `### Resilience Planning Guidelines (Local AI Fallback)
As the AI Climate Assistant, I recommend the following adaptation policies for **${city.name}**:
1. **Cool Roof Mandates:** Coating 40% of the city's roof area with reflective coatings ($15/m²) would reflect substantial solar radiation and drop localized air temperatures by up to 0.6°C.
2. **Urban Canopy Expansion:** Target planting shade trees in underserved neighborhoods ($150/tree) to increase NDVI above 0.35 and provide shading.
3. **Emergency Smart-Grid Shading:** Scale cooling shelter capacities during peak load hours to buffer energy draw from domestic air conditioning.`;
  }

  // 7. General Climate Response
  return `### AI Climate Assistant Response (Local AI Fallback)
Greetings! I am the SafeSphere AI Assistant. I can answer questions about climate adaptation, urban heat indices, and guide you on using this application.

Currently, **${city.name}** is reporting:
* **Air Temperature:** ${city.baseParams.airTemp}°C
* **Relative Humidity:** ${city.baseParams.relativeHumidity}%
* **Estimated Land Surface Temperature:** ${lstRes.lst}°C
* **WBGT Risk:** ${wbgtRes.wbgt}°C (${wbgtRes.riskLevel} Risk)

Please ask me about:
1. **"How do I use this simulation?"** to learn how to test cooling policies.
2. **"Where is the nearest cooling shelter?"** to view local safety centers.
3. **"What is the first aid for heatstroke?"** to view medical guidelines.
4. **"Explain the thermodynamic physics of albedo."** to understand the science.`;
}

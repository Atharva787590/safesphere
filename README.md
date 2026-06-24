# SafeSphere

> **AI-Powered Urban Heat Intelligence, Disaster Resilience, Climate Adaptation and Public Safety Platform**
> 
> *Google "Agents for Good" Capstone Project Submission*

SafeSphere is a globally deployable, enterprise-grade platform designed to help smart cities, governments, emergency managers, researchers, and citizens identify urban heat anomalies, predict disaster impacts, simulate climate interventions, and secure public safety through advanced multi-agent cooperation.

---

## 🌟 Core Features

*   **Urban Heat Island (UHI) Mapping**: Interactive GIS satellite heatmap, NDVI vegetation layers, and building density visualization grids.
*   **Thermodynamic Physics Sandbox**: Adjust parameters (canopy planting, cool roof coating, water retention) and dynamically simulate surface cooling drops, costs, and carbon benefits.
*   **15-Agent Cooperative Intelligence**: Special agents (Data Validation, Morphology, Power Grid, Recovery Planning, etc.) coordinating early warnings and drafting policies.
*   **Incident Telemetry Ingestion**: Live streaming dashboard with threshold alarms (excessive air temp, high PM2.5 AQI) and hazard simulation injectors.
*   **Citizen Gateway & Assistance**: Multilingual safety advisor chat and active cooling shelter directories.
*   **Government Decision Portal**: Collaborative master planning workspace and markdown policy compiler.

---

## 🛠️ Technology Stack

*   **Frontend UI**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, and Framer Motion.
*   **Multi-Agent Engine**: Google ADK 2.0, Vertex AI, Gemini 1.5 Flash, and Python 3.14.
*   **Cloud & Storage**: Cloud Firestore (LocalStorage mock fallback) and Firebase Authentication.
*   **Hosting**: Configured for Vercel deployment.

---

## 📁 Directory Structure

```
capstone/
├── README.md                  # Main overview and directory landing page
├── package.json               # Next.js configuration and packages
├── docs/                      # Specialized documentation guides
│   ├── ARCHITECTURE.md        # 15-agent collaboration system and LST formulas
│   ├── INSTALLATION.md        # Running Next.js and the Python ADK playground
│   ├── SECURITY.md            # OWASP guidelines, RBAC roles, and shield armor
│   └── PRESENTATION_DECK.md   # Slide deck slides for capstone presentation
├── src/                       # Application code
│   ├── app/                   # Next.js pages (Citizens, Gov, Sensors, Settings)
│   │   ├── page.tsx           # Home landing board
│   │   ├── layout.tsx         # Global settings shell & nav header
│   │   ├── citizen/           # Citizen safety portal
│   │   ├── government/        # Municipal planner portal
│   │   ├── agents/            # Multi-agent command terminal
│   │   ├── sensors/           # IoT stream ingestion board
│   │   └── settings/          # Key integrations page
│   ├── components/            # Shared React components
│   │   └── gis-map.tsx        # Interactive canvas map layers overlay
│   └── lib/                   # Systems logic
│       ├── physics-engine.ts  # LST & Wet Bulb globe thermodynamic equations
│       ├── demo-data.ts       # Cities geographics & IoT sensor logs
│       ├── settings-context.tsx # Theme and credentials session context
│       └── agents-orchestrator.ts # Multi-agent query routing & mock logs
└── agent-system/              # Python ADK 2.0 Agent System workspace
    ├── app/                   # ADK agents (coordinator, sub-agents)
    │   └── agent.py           # Python 15-agent configurations & tools
    ├── pyproject.toml         # Python environment packages
    └── tests/                 # Evaluation datasets & test suites
```

---

## 📖 Documentation Directory

For complete setup, technical specifications, and presentation guides, read the manuals:

1.  **[Architecture Documentation](file:///Users/atharvaharode/Library/CloudStorage/OneDrive-Personal/agy2-projects/capstone/docs/ARCHITECTURE.md)**: Multi-agent coordination graphs and thermodynamic physics equations.
2.  **[Installation & Operations Guide](file:///Users/atharvaharode/Library/CloudStorage/OneDrive-Personal/agy2-projects/capstone/docs/INSTALLATION.md)**: Node, Python, ADK toolsets setup, and settings configuration.
3.  **[Security Manual](file:///Users/atharvaharode/Library/CloudStorage/OneDrive-Personal/agy2-projects/capstone/docs/SECURITY.md)**: RBAC safety definitions, telemetry sanitization, and model armor shielding.
4.  **[Presentation Slide Deck](file:///Users/atharvaharode/Library/CloudStorage/OneDrive-Personal/agy2-projects/capstone/docs/PRESENTATION_DECK.md)**: Capstone slide structures, problem statements, and roadmaps.

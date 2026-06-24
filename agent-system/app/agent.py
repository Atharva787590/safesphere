# ruff: noqa
# SafeSphere Multi-Agent ADK 2.0 Backend Configuration

import datetime
from zoneinfo import ZoneInfo
import os
import math
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types
import google.auth

# Attempt to load project configuration from Google Auth
try:
    _, project_id = google.auth.default()
    os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
except Exception:
    os.environ["GOOGLE_CLOUD_PROJECT"] = "safesphere-prototype"

os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

# --- Tools Definition ---

def calculate_lst(
    air_temp: float,
    albedo: float,
    ndvi: float,
    solar_rad: float,
    wind_speed: float,
    relative_humidity: float,
    building_density: float,
    building_height: float
) -> dict:
    """Calculates Land Surface Temperature (LST) and feature contributions based on thermodynamic equations.

    Args:
        air_temp: Ambient air temperature in degrees Celsius.
        albedo: Surface albedo ratio (0.0 to 1.0).
        ndvi: Normalized Difference Vegetation Index (-1.0 to 1.0).
        solar_rad: Solar irradiance in Watts per square meter (W/m²).
        wind_speed: Wind speed in meters per second (m/s).
        relative_humidity: Relative humidity percentage (0 to 100).
        building_density: Urban building density percentage (0 to 100).
        building_height: Average building height in meters.

    Returns:
        A dictionary containing the calculated LST value, 95% confidence intervals, and contribution weights.
    """
    net_solar = solar_rad * (1.0 - albedo)
    morphology_factor = 1.0 + (building_density / 100.0) * (building_height / 100.0) * 0.8
    veg_cooling = max(ndvi, 0) * 12.0 * (1.0 - relative_humidity / 200.0)
    wind_cooling = math.sqrt(max(wind_speed, 0.1)) * 3.5
    
    heat_dissipation = 35.0 + wind_cooling
    lst = air_temp + (net_solar * morphology_factor / heat_dissipation) - veg_cooling
    lst = max(lst, air_temp - 5.0)

    # Simple contribution shares
    total_load = net_solar * morphology_factor
    cooling_sum = veg_cooling + wind_cooling
    total_factor = total_load + cooling_sum
    
    contributions = {
        "albedo_effect": round((net_solar / total_factor) * 100.0) if total_factor > 0 else 25,
        "vegetation_cooling": round((veg_cooling / total_factor) * 100.0) if total_factor > 0 else 25,
        "morphology_trapping": round(((net_solar * (morphology_factor - 1.0)) / total_factor) * 100.0) if total_factor > 0 else 25,
        "wind_meteorological": 0
    }
    contributions["wind_meteorological"] = 100 - sum(contributions.values())

    margin = 1.2 + (solar_rad / 1000.0) * (building_density / 100.0) * 1.5
    
    return {
        "lst": round(lst, 1),
        "confidence_interval": [round(lst - margin, 1), round(lst + margin, 1)],
        "absorbed_radiation_wm2": round(net_solar),
        "contributions": contributions
    }

def get_shelter_advisories(city_name: str) -> dict:
    """Retrieves cooling shelter guidelines and availability.

    Args:
        city_name: Name of the city (e.g., Phoenix, Singapore, Ahmedabad).

    Returns:
        A dictionary listing cooling shelters, capacities, and contact lines.
    """
    normalized = city_name.lower()
    if "phoenix" in normalized:
        return {
            "city": "Phoenix",
            "shelters": [
                {"name": "Downtown Convention Center - Hall B", "capacity": 500, "status": "Open", "phone": "(602) 555-0101"},
                {"name": "Burton Barr Central Library", "capacity": 250, "status": "Open", "phone": "(602) 555-0102"},
                {"name": "South Mountain Community Center", "capacity": 150, "status": "Full", "phone": "(602) 555-0103"}
            ]
        }
    elif "ahmedabad" in normalized:
        return {
            "city": "Ahmedabad",
            "shelters": [
                {"name": "Maninagar Community Hall", "capacity": 350, "status": "Open", "phone": "+91 79 5550 9101"},
                {"name": "AMC Paldi Multi-Purpose Hall", "capacity": 200, "status": "Full", "phone": "+91 79 5550 9102"}
            ]
        }
    return {
        "city": city_name,
        "shelters": [{"name": "Municipal Central Hall", "capacity": 100, "status": "Open", "phone": "911 / Local Emergency Line"}]
    }

# --- Specialized Multi-Agents ---

model_instance = Gemini(
    model="gemini-1.5-flash",
    retry_options=types.HttpRetryOptions(attempts=3),
)

urban_heat_agent = Agent(
    name="urban_heat_agent",
    model=model_instance,
    instruction="Analyze Land Surface Temperature (LST), identify heat anomalies, and spot vulnerable communities.",
    description="Analyzes surface heat, LST models, and spatial UHI anomalies.",
    tools=[calculate_lst]
)

heat_forecasting_agent = Agent(
    name="heat_forecasting_agent",
    model=model_instance,
    instruction="Forecast temperature trends, heatwaves, and climate trajectories.",
    description="Predicts future heatwave intervals and temperature alerts."
)

urban_morphology_agent = Agent(
    name="urban_morphology_agent",
    model=model_instance,
    instruction="Evaluate building layouts, canyon effects, albedo ratios, and sky view factors.",
    description="Analyzes street density, heights, materials, and heat trapping."
)

disaster_risk_agent = Agent(
    name="disaster_risk_agent",
    model=model_instance,
    instruction="Coordinate hazard models for heatwaves, flooding, and wildfires.",
    description="Sells risk assessments and exposure maps for city sectors."
)

emergency_response_agent = Agent(
    name="emergency_response_agent",
    model=model_instance,
    instruction="Navigate citizens to shelters and coordinate emergency supplies routing.",
    description="Coordinates evacuation routing and Cooling center allocations.",
    tools=[get_shelter_advisories]
)

citizen_support_agent = Agent(
    name="citizen_support_agent",
    model=model_instance,
    instruction="Help citizens with safety tips, hydration guides, shelter coordinates, and translation services.",
    description="Direct public-facing advice, heat stroke indicators, and emergency support.",
    tools=[get_shelter_advisories]
)

government_planning_agent = Agent(
    name="government_planning_agent",
    model=model_instance,
    instruction="Synthesize thermodynamic analyses into zoning laws, cool roof ordinances, and greening budgets.",
    description="Drafts municipal policy adjustments and resilience budgets."
)

explainability_agent = Agent(
    name="explainability_agent",
    model=model_instance,
    instruction="Break down physics calculations, ML weights, and agent debates into clean explanations.",
    description="Explains physics-informed formulas and scientific conclusions to humans."
)

# --- Root Coordinator Agent ---

root_agent = Agent(
    name="coordinator_agent",
    model=model_instance,
    instruction="""You are the SafeSphere Root Coordinator. You coordinate between the specialized agents to answer urban heat, disaster resiliency, and climate adaptation queries.
    Route to the appropriate sub-agent based on their description:
    - For LST/Satellite data queries: urban_heat_agent
    - For heatwave forecasts and weather predictions: heat_forecasting_agent
    - For building canyon or albedo structural impacts: urban_morphology_agent
    - For disaster vulnerabilities or alerts: disaster_risk_agent
    - For citizen safety, emergency shelter locations, or direct advice: citizen_support_agent or emergency_response_agent
    - For zoning, cool roof ordinances, or city planning policies: government_planning_agent
    - For explaining calculations or scientific formulas: explainability_agent
    Provide a unified, expert consensus report.""",
    sub_agents=[
        urban_heat_agent,
        heat_forecasting_agent,
        urban_morphology_agent,
        disaster_risk_agent,
        emergency_response_agent,
        citizen_support_agent,
        government_planning_agent,
        explainability_agent
    ]
)

app = App(
    root_agent=root_agent,
    name="app",
)

# SafeSphere Installation & Setup Guide

Follow these instructions to install, run, and configure the SafeSphere platform locally on macOS.

---

## 1. Prerequisites

Ensure your system has the following dependencies installed:

* **Node.js**: Version $\ge$ 18.0 (v22 recommended)
* **npm**: Version $\ge$ 9.0
* **Python**: Version $\ge$ 3.11 (with `pip` and `uv` package managers)
* **Brave Browser** or Safari (macOS environments)

---

## 2. Frontend Installation & Local Server

1. **Clone or Navigate to the Workspace Directory:**
   ```bash
   cd /Users/atharvaharode/Library/CloudStorage/OneDrive-Personal/agy2-projects/capstone
   ```

2. **Verify Dependencies in `package.json`:**
   Dependencies like `lucide-react`, `framer-motion`, `firebase`, and `chart.js` should already be installed. If you need to re-verify or clean the build:
   ```bash
   npm install --cache ./npm-cache
   ```

3. **Start the Next.js Development Server:**
   ```bash
   npm run dev
   ```
   * The server will spin up on [http://localhost:3000](http://localhost:3000).
   * Open Brave Browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 3. ADK 2.0 Python Agent System Setup

If you want to run the Agent System via the ADK CLI and test it locally using the terminal playground:

1. **Install the Google Agents CLI Tool:**
   ```bash
   uv tool install google-agents-cli
   ```

2. **Navigate into the Agent System Folder:**
   ```bash
   cd agent-system
   ```

3. **Sync Dependencies:**
   Install required Python packages defined in `pyproject.toml` using `uv`:
   ```bash
   agents-cli install
   ```

4. **Launch the Web Playground:**
   To interact with the coordinator agent and specialized sub-agents in a chat-like playground:
   ```bash
   agents-cli playground
   ```
   * Open the playground URL in Brave Browser (typically `http://localhost:8000`).

5. **Run a Prompt via Terminal:**
   For quick testing, you can execute a query to the root agent:
   ```bash
   agents-cli run "What is the LST anomaly in Phoenix?"
   ```

---

## 4. Configuring Live Integration Mode

By default, the platform runs in **Mock Mode**, providing realistic simulated metrics. To connect live:

1. Start the platform and navigate to the **Settings** tab.
2. Enter your **Google Gemini API Key** (from Google AI Studio).
3. Enter your **Firebase Config credentials** (API Key, Project ID, App ID, etc.) from the Firebase console.
4. Click **Save Credentials**.
5. SafeSphere will dynamically activate live database logging and Gemini-powered agent reasoning!

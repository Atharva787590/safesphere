# SafeSphere Security & Compliance Guidelines

SafeSphere is engineered with enterprise-grade security controls to protect telemetry pipelines and prevent adversarial attacks.

---

## 1. Role-Based Access Control (RBAC)

SafeSphere enforces strict separation of concerns across four key roles:

| Role | Scope | Privileges | Typical Action |
|------|-------|------------|----------------|
| **Citizen** | Public | Read-only access to safety advisories and shelter locations. Can chat with Citizen Support Agent. | Looks up nearest cooling center or views active heat warnings. |
| **Researcher** | Analysis | Can view scientific telemetry contributions, export historical CSV trend files, and review physics parameters. | Adjusts albedo inputs in sandbox to view theoretical LST impact. |
| **Gov Officer** | Planning | Full write privileges to municipal policies. Can run collaborative master planning workflows and allocate budgets. | Compiles a Cooling Master Plan or triggers emergency load shedding. |
| **Administrator** | System | Can modify system parameters, calibrate sensors, clear logs, and configure Google/Firebase keys. | Integrates a new Firebase project or adds a weather station. |

---

## 2. API & Data Sanitization (OWASP Compliance)

* **Input Validation**: All incoming telemetry packets (IoT air temp, humidity, wind, AQI) are validated using strict type hints and range checks to prevent SQL/NoSQL injection.
* **Output Sanitization**: Model completions and citizen chats are parsed for HTML characters to prevent Cross-Site Scripting (XSS) injection.
* **Rate Limiting**: API routes (e.g., querying agents) limit requests per IP to prevent Denials of Service (DoS) and API abuse.

---

## 3. Multi-Agent Security (Model Shielding)

The **Security Monitoring Agent** constantly audits agent transactions:

* **Prompt Injection Defense**: Evaluates incoming citizen prompts for system jailbreaks (e.g., "Ignore previous instructions").
* **Output Filtering (Model Armor)**: Validates model completions against safety rules to prevent hallucinations or inappropriate language.
* **Audit Logs**: Every query directed to an agent is recorded with a timestamp, active role, and token count, preserving audit compliance.

---

## 4. Encryption & Secret Management

* **Transit Protection**: SSL/TLS (HTTPS) encryption is required for all data transfers between clients, next-serverless routes, and Google APIs.
* **Rest Protection**: Firestore databases are encrypted at rest using Google-managed encryption keys.
* **Client Secrets Storage**: Settings keys (Gemini API, Google Maps, Firebase configs) are encrypted and stored in local state, preventing them from leaking on server logs.

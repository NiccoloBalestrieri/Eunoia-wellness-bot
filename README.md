<div align="center">

# 🌿 EunoAI – Digital Wellness Coach

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![React](https://img.shields.io/badge/React-18--LTS-61DAFB?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

</div>

---

## 🎥 Demo  

<div align="center">

  <video src="https://github.com/user-attachments/assets/941ecc20-3a4e-48a6-b9bc-f5d90ede12d3" width="600" controls>
  </video>
</div>

---

## 🎯 Project Vision  

In a world overloaded with screens and distractions, **EnoAI** redefines digital interaction:  

> Let technology serve **you**, not consume you.

This prototype demonstrates a human-centred AI assistant focused on **digital wellness**, powered entirely by free, serverless technologies.

A key design choice is the use of a **dedicated MCP (Model Context Protocol) server**, deployed as a separate Cloudflare Worker called **Wellness Coach**.  
This separation makes tools:

- **Reusable** by other clients and apps, not only this chatbot  
- **Composable** (you can plug multiple MCP servers into the same chat UI)  
- **Safer & easier to iterate** (tools evolve independently from the LLM backend)

---

## 🏗 Features Overview  

- 🔐 **Authentication via Supabase** – email/password login, per-user storage.  
- 💬 **Chat Interface** – persistent multi-session messaging with automatic scroll and local storage per user.  
- 🧩 **MCP Servers Panel** – add/remove external tool servers dynamically from the UI.  
- ⚙️ **Dynamic Tool Invocation** – messages containing specific keywords trigger direct tool calls instead of plain LLM processing.  

- 🌱 **Dedicated Wellness Coach MCP Server (Cloudflare Worker)**  
  - Implemented as a **separate Cloudflare Worker**, designed purely as an **MCP tool server**.  
  - Exposes simple HTTP endpoints that the chatbot calls via MCP.  
  - Any MCP-compatible client can reuse this server — not just this project.

  Updated available endpoints/tools:

  | Endpoint | Description | Trigger Keywords |
  |-----------|--------------|------------------|
  | `/screen_time_reminder` | Screen-time awareness and rest suggestions | `tired`, `pause`, `rest` |
  | `/digital_detox_tip` | Quick digital detox ideas and micro-breaks | `tip`, `detox`, `consiglio` |
  | `/mindfulness_exercise` | Short breathing or mindfulness exercises | `breathe`, `mindfulness`, `relax` |
  | `/focus_mode` | Pomodoro-style focus timer logic | `focus`, `pomodoro` |
  | `/human_connection_suggestion` | Nudges toward real-world social connection | `friend`, `people`, `social` |

- 🧠 **Fallback LLM Mode** – powered by Cloudflare’s `@cf/meta/llama-3.1-8b-instruct`.  
- ☁️ **100 % Serverless Architecture** – Cloudflare Workers + Cloudflare Pages + Supabase free tier.  

Thanks to this architecture, **any MCP server that exposes compatible endpoints can be plugged into the chat and immediately start working inside this chatbot**.

---

## 🧰 Technology Stack  

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | UI/UX chat application |
| **Styling** | Tailwind CSS | Responsive minimal design |
| **Chat Orchestrator** | Cloudflare Worker (`nicbl`) | Chat API, routing & MCP orchestration |
| **Dedicated Tool Server** | Cloudflare Worker (`wellness-coach`) | MCP tools for digital wellness |
| **Database / Auth** | Supabase (PostgreSQL + Auth API) | Stores users + MCP servers |
| **AI Engine** | Cloudflare AI Gateway (Llama 3.1 8B) | Natural language responses |
| **Tool Protocol** | MCP (Model Context Protocol) | External tool integration |

---

## 🖼 Architecture Diagram  

![Architecture Diagram](docs/architecture-diagram.png)  


---

The **Wellness Coach** MCP Worker is intentionally separated from the main orchestrator so that:

- You can **swap or extend** tools without touching the chat logic  
- Different teams can own different MCP servers (e.g. HR wellness vs. Security vs. Learning)  
- The same MCP agent can serve **many frontends** (web apps, mobile apps, internal tools)

---

## 💡 Why a Dedicated Wellness Coach MCP Server?  

Instead of baking all the wellness logic directly into the chatbot backend, this project:

1. Creates a **stand-alone MCP server** (`wellness-coach` Worker)  
2. Connects it via MCP to the main chat Worker  
3. Lets the UI discover and call tools automatically

This demonstrates a pattern you can reuse in your own organisation:

- Design **one MCP agent per “mission”** (wellness, learning, compliance, productivity…)  
- Keep each agent small, focused and easy to maintain  
- Let different products or teams reuse the same agents through the MCP protocol  

Any MCP agent that follows this pattern and exposes its tools via HTTP can be added in the **MCP Servers** panel and will start working inside this chatbot UI.

---

## 🧪 Example MCP Agents You Could Build  

With more time and resources, the same pattern used for **Wellness Coach** can power many other mission-driven agents:

- 🛌 **Sleep & Recovery Agent**  
  - Tools for evening routines, shutdown rituals, blue-light reduction tips.  
  - Integrations with wearables (when available) to adapt suggestions to real sleep patterns.

- 🎯 **Focus & Deep-Work Agent**  
  - Advanced focus modes, personalised work/break cycles, meeting-load analysis.  
  - Tools to generate “focus plans” for your day based on your calendar.

- 🤝 **Human Connection Agent**  
  - Suggestions to strengthen relationships with colleagues/friends.  
  - Tools to nudge 1:1 coffee chats, weekly check-ins, gratitude messages.

- 🧯 **Burnout Early-Warning Agent**  
  - Tools that analyse interaction patterns (self-report, surveys, usage) and surface risk signals.  
  - Gentle recommendations for rest, boundary-setting, or professional support.

- 🧠 **Learning & Growth Agent**  
  - Tools to turn digital friction into growth opportunities (micro-courses, reflection prompts).  
  - Personalised learning tracks aligned with the company’s mission and values.

- 📱 **Digital Boundaries Agent**  
  - Tools for notification hygiene, app blocking suggestions, “quiet hours” recommendations.  
  - Workspace vs. personal-life separation guidelines.

All of these can be built as **separate MCP servers**, each with its own endpoints, and plugged into this same interface via the MCP panel.  
The chatbot then becomes a **hub of specialised agents** rather than a single monolithic assistant.

---

## 🧩 Keywords Reference – How to Test the Wellness Coach  

Below is a quick reference list of **trigger phrases** you can use to test each endpoint of the Wellness Coach MCP server.

| Intent | Example Phrases | Expected Response |
|--------|-----------------|-------------------|
| 💤 Take a break | “I’m tired”, “Need a pause”, “Should I rest?” | Screen-time reminder |
| 🧘 Mindfulness | “Breathe with me”, “Mindfulness exercise”, “Help me relax” | Guided breathing text |
| 🔋 Digital detox | “Give me a tip”, “Detox from phone”, “Digital detox suggestion” | Detox or focus tip |
| ⏱ Focus mode | “Start pomodoro”, “Focus time”, “I want to concentrate” | Pomodoro timer message |
| 🤝 Social wellness | “Feel lonely”, “I miss people”, “Connect with friends” | Human connection suggestion |

When no MCP server is connected, the chatbot falls back to a natural LLM answer powered by Llama 3.  
When the MCP Wellness Coach is connected, you’ll see `[MCP TEST]` prefixed to tool-based replies.

---

## 🚀 Deployment (Free Tier)  

### 1️⃣ Backend Chat Orchestrator Worker  

1. Create a new Cloudflare Worker named `nicbl`.  
2. Add env vars:  
   - `SUPABASE_URL`  
   - `SUPABASE_ANON_KEY`  
3. Deploy – obtain URL (e.g. `https://nicbl.yourdomain.workers.dev`).  

This Worker:

- Handles auth validation  
- Stores/reads chats from Supabase  
- Routes messages either to the LLM or to MCP tools (like Wellness Coach)

---

### 2️⃣ Wellness Coach MCP Tool Server (Dedicated Worker)  

1. Create another Cloudflare Worker named `wellness-coach`.  
2. Paste the `wellness-coach.js` code – this Worker exposes the MCP tool endpoints:  

   - `GET /screen_time_reminder`  
   - `GET /digital_detox_tip`  
   - `GET /mindfulness_exercise`  
   - `GET /focus_mode`  
   - `GET /human_connection_suggestion`  

3. Deploy and get the URL, e.g.:  

   `https://wellness-coach.yourdomain.workers.dev`

Any MCP-aware client (including this chatbot) can now consume these endpoints as tools.

---

### 3️⃣ Frontend (Cloudflare Pages)  

1. Push the React app to GitHub.  
2. On **Cloudflare Pages** → *Connect Repo*.  
3. Build command: `npm run build`  
4. Output directory: `dist`  
5. Deploy → URL like `https://naturaai.pages.dev`.  

---

### 4️⃣ Connect MCP Servers in the UI  

Set `API_URL` in the frontend to the backend Worker URL (`nicbl`).  

Then, in the web app:

1. Go to **MCP Servers** sidebar.  
2. Click **Add server** and enter:  

   ```text
   Name: Wellness Coach
   URL:  https://wellness-coach.yourdomain.workers.dev

3. Save — the frontend now knows about this MCP agent.
4. Send a message like “I’m tired” or “Give me a detox tip” → the orchestrator Worker routes it to the Wellness Coach MCP server and returns a tool-generated response 🌱

You can repeat this process for any other MCP agent you build in the future.

---

## 💻 Usage Flow
1. **Login** or **Sign Up**  
2. **Add MCP Server(s)** from sidebar  
3. **Start a New Chat**  
4. **Send messages** like:  
   - “I’m tired” → screen‑time reminder  
   - “Give me a detox tip” → detox tip  
   - “Activate focus mode” → focus tool  
   - “I want to feel connected with others” → connection advice  
5. Enjoy instant tool responses or LLM fallback.

---

## 📜 Changelog  
| Version | Date | Changes |
|---------|------|----------|
| **v0.1.0** | 2025‑11‑02 | Initial release – chat, auth, MCP integration. |
| **v0.1.1** | 2025‑11‑02 | UI improvements + added tool discovery panel. |
| **v0.2.0** | 2025‑11‑03 | Implemented Wellness Coach MCP server + focus mode. |

---

## 🔮 Future Roadmap   
- Integration with wearables (Google Fit / Apple Health)  
- MCP Marketplace for external tools  
- Enhanced LLM context awareness
- Email confermartion signup

---

## 🔐 Security & Privacy  
- User auth handled via Supabase Auth (JWT).  
- No sensitive data stored client‑side except token and chat history.  
- CORS & rate‑limiting implemented on Workers.  
- All requests served over HTTPS via Cloudflare.

---

## 🤝 Credits  
Developed by **Niccolò Balestrieri**  
Inspired by the vision of *Natura Umana · Natura AI*  

**License:** MIT  
Feel free to fork and extend.  

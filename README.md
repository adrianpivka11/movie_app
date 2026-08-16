# Movie App

Full-stack movie recommendation app.

## Structure

- `frontend` - React TypeScript client built with Vite.
- `backend` - Express TypeScript API server.
- `database` - Python data pipeline, CSV files, and database preparation scripts.

## Local development

Install JavaScript dependencies:

```powershell
npm run install:all
```

Run frontend and backend together:

```powershell
npm run dev
```

Run only frontend:

```powershell
npm run dev:frontend
```

Run only backend:

```powershell
npm run dev:backend
```



MCP vs. Agentic version: 
How to quickly revert back to the old mode if MCP is causing problems:
in backend/src/app.ts or in the imported agent layer
import { movieChoiceAgentOldVersion as movieChoiceAgent } from "./agentOldVersion.js";
# Mini Store

My individual demo for our research milestone. It is a small storefront with two rule-based "agents" that recommend products, explain why, and stop when the customer turns AI off.

## What I built
A React storefront that talks to an ASP.NET Core API backed by a SQLite database.

- **Product catalog:** nine products in three categories, stored in the database and served by the API.
- **Activity history:** clicking View on a product saves a browse event for the user.
- **User controls:** interest chips and a "Use AI personalization" checkbox, saved per user and enforced by the API.
- **Recommendation Agent:** scores products the user hasn't viewed using their interests and viewing history, and returns a plain-English reason for each             Ex:"Recommended because you viewed Smart Watch"
  
- **Shopping Assistant Agent:** takes a typed request like "camping trip" and returns matching products with a reason for each match.
- **AI off means off:** when the toggle is unchecked, the API returns no personalized results.

## Why this design (link to the client project)
The client wants personalization that is useful and not "creepy": explain recommendations, let users control AI behavior, and keep the intelligent platform separate from the storefront. This demo is a very small version of that.

The agents are rule-based, not an LLM. That keeps the demo free, predictable, and easy to explain.

## Tools and libraries, and why I used them

* React 18 | Builds the storefront UI with components and state (`useState`, `useEffect`) | Our team's chosen frontend |
* Vite | Dev server and build tool for React | Fast setup and the current standard over Create React App |
* @vitejs/plugin-react | Lets Vite compile JSX | Required for React in Vite |
* npm | Installs and manages JavaScript packages | The milestone asks us to learn our package manager |
* ASP.NET Core minimal API (.NET [version]) | Serves JSON endpoints to the frontend | Our team prefers C#/.NET, and it fits the client's Azure-leaning stack
* Dependency injection (built into ASP.NET Core) | Registers the agents against interfaces | Lets an agent implementation be swapped without touching the endpoints |
* Entity Framework Core | Maps C# classes to database tables and runs queries | Standard .NET data access, so no raw SQL needed for this demo |
* SQLite (`Microsoft.EntityFrameworkCore.Sqlite`) | Local single-file database | No server to run. EF Core lets us switch to Azure SQL or Postgres later by changing the provider. |
* NuGet | Installs .NET packages | The .NET equivalent of npm |
* CORS policy | Lets the Vite dev server (port 5173) call the API (port 5080) | Browsers block cross-origin requests by default |

## How to run it
Requires the .NET SDK and Node.js (LTS).

Backend:
```
cd backend
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet run        # http://localhost:5080
```

Frontend (second terminal):
```
cd frontend
npm install
npm run dev       # http://localhost:5173
```

To reset the demo, stop the API and delete `backend/retail-demo.db`. It is recreated on the next start.

## API endpoints
- `GET /api/products`
- `POST /api/events` (log a product view)
- `GET` and `PUT /api/users/{id}/settings` (interests and AI toggle)
- `GET /api/users/{id}/recommendations`
- `GET /api/users/{id}/assistant?q=...`

## Limitations and next steps
- There is a single hard-coded demo user and no login.
- The agents use simple rules, so a next step is an LLM-backed version through **Azure OpenAI**.
- The database is created with `EnsureCreated`, so real EF Core migrations would be a better approach.
- The client's Engagement and Guardrail agents (cart reminders with frequency caps) are not built yet.
- Deployment to Azure was out of scope for this milestone, and also wanted to save credits for real capstone project.

## AI assistance
I used Claude to help plan and learn this project, then I researched, ran, tested, and modified it myself.

# Task Manager (Docker)

## Run

1. (Optional) create a root `.env` from `.env.example` and set a strong `JWT_SECRET`.
2. Start everything:
   - `docker compose up --build`

## Services

- Frontend (nginx): `http://localhost:81`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27014` (bound to localhost; container is `27017`)

The frontend container proxies `/api/*` to the backend, so browser calls can use same-origin `/api/...`.

## Ports

- To use a different host port for the frontend (e.g. `82`), change `frontend.ports` in `docker-compose.yaml`.
- To use a different host port for MongoDB, change `mongodb.ports` in `docker-compose.yaml` (keep container port `27017`).

## Troubleshooting

- If you previously ran MongoDB **without** auth, then enabled auth later, the existing `mongo_data` volume may not have any users yet. The MongoDB healthcheck will try to bootstrap the first root user, but if you changed credentials after the volume was created, you’ll need to recreate the volume (or switch back to the original credentials):
  - `docker compose down -v`
  - `docker compose up --build`

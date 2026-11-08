# Smart Waste Management

A full-stack web platform for managing urban waste collection. It uses geospatial data to track collection points, service areas and routes, and gives administrators and staff a single dashboard to monitor and manage waste operations.

Live demo: <add-link>

## Features

- Map-based view of bins, collection points and zones (PostGIS Point, Polygon and LineString data)
- Route and area management for collection vehicles
- Role-based access for administrators and staff
- REST API consumed by a React frontend
- Background task support with Redis
- Dockerized backend, ready for cloud deployment

(Edit this list so it matches exactly what your project does.)

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django, Django REST Framework, Gunicorn |
| Frontend | React, Vite, Axios |
| Database | PostgreSQL with PostGIS (Supabase) |
| Cache / Queue | Redis |
| Deployment | Docker, Render |

## Architecture

```
React (Vite)  ->  Django REST API  ->  PostgreSQL + PostGIS
                        |
                      Redis
```


![ERD](docs/erd.png)

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL with PostGIS
- GDAL
- Redis

### Backend

```bash
git clone https://github.com/nischitshr/smart-waste-management.git
cd smart-waste-management/backend

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL/PostGIS connection string |
| `REDIS_URL` | Redis connection string |
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Set to `False` in production |
| `VITE_API_URL` | Backend API URL used by the frontend |

## Deployment

- Backend: Docker service on Render
- Frontend: static site on Render
- Database: Supabase (use the Session pooler connection string)
- Redis: Render Key Value

## Screenshots



## Author

Nischit Shrestha - [GitHub](https://github.com/nischitshr)

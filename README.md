# Smart Waste Management

A full-stack web platform for managing urban waste collection. It uses geospatial data to track collection points, service areas and routes, and gives administrators and staff a single dashboard to monitor and manage waste operations.

Live demo: https://swms-frontend.onrender.com/login

## Features

- Map-based view of bins, collection points and zones (PostGIS Point, Polygon and LineString data)
- Route and area management for collection vehicles
- Role-based access for administrators and staff
- REST API consumed by a React frontend
- Background task support with Redis
- Dockerized backend, ready for cloud deployment


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


<img width="975" height="532" alt="image" src="https://github.com/user-attachments/assets/0b4b0dbc-ba94-4f86-9185-873c4b636d45" />


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

<img width="1637" height="753" alt="image" src="https://github.com/user-attachments/assets/0ae3cb94-ab81-44d9-9f3c-3f532558312d" />

<img width="1689" height="775" alt="image" src="https://github.com/user-attachments/assets/bd5644a5-5038-402c-b5c2-55c30a9391cb" />

<img width="975" height="448" alt="image" src="https://github.com/user-attachments/assets/94778931-3b00-410c-a578-09d143662878" />

<img width="975" height="456" alt="image" src="https://github.com/user-attachments/assets/41c45fae-66de-49ee-bb2b-05b42ce02c07" />

<img width="975" height="454" alt="image" src="https://github.com/user-attachments/assets/3771b5dd-0164-44ab-888d-a7d09a3947a0" />

## Author

Nischit Shrestha - [GitHub](https://github.com/nischitshr)

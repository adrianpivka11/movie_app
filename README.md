# MovieChoice – AI Movie Recommendation App

Full-stack educational project that recommends movies based on the user's preferred mood, genres, and type of story.

The application uses **OpenAI text embeddings** and **vector similarity search** to find relevant movies stored in a Supabase PostgreSQL database.

Available and deploy on render.com: https://movie-app-frontend-ks5e.onrender.com/
---

## Overview

MovieChoice allows users to describe:

* The mood they want from a movie
* Their preferred genre or combination of genres
* What they would like the story to be about

The application converts these preferences into a vector embedding and searches the movie database for semantically similar movies.

The recommended movies are displayed with their title, release year, poster, and description.

---

## Key Features

* Movie recommendation form
* Recommendations based on mood, genre, and story preferences
* OpenAI embedding generation
* Semantic similarity search
* Supabase PostgreSQL database with over 12000 movies
* PostgreSQL vector search function
* Multiple movie recommendations per search
* Previous and next movie navigation
* Movie posters loaded from TMDB
* Responsive React user interface
* Separate frontend, backend, and database layers

---

## How It Works

1. The user enters their movie preferences in the React application.
2. The frontend sends the form data to the backend REST API.
3. The backend combines the answers into a recommendation prompt.
4. OpenAI converts the prompt into a vector embedding.
5. Supabase searches the movie database using vector similarity.
6. The five most relevant movies are returned to the frontend.
7. The user can browse through the recommendations.

---

## Technologies

### Frontend

* React
* TypeScript
* Vite
* HTML
* CSS
* Fetch API

### Backend

* Node.js
* Express
* TypeScript
* OpenAI API
* Supabase JavaScript Client
* REST API

### Database and Data Pipeline

* PostgreSQL
* Supabase
* pgvector
* SQL
* Python
* Pandas
* TMDB API
* OpenAI Embeddings

---

## Project Structure

```text
movie_app/
├── frontend/      # React and TypeScript user interface
├── backend/       # Express REST API server
├── database/      # Python data pipeline and SQL scripts
├── package.json
└── README.md
```

The `database` folder contains scripts for:

* Retrieving movie data
* Cleaning and filtering data
* Enriching movie information
* Transforming genres
* Splitting data into batches
* Creating movie embeddings
* Updating the Supabase database

---



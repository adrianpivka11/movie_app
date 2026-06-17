drop function if exists match_movies(vector(1536), float, int);

create or replace function match_movies (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id int4,
  title text,
  original_language varchar,
  genres text,
  overview text,
  vote_average numeric,
  vote_count int4,
  poster_path text,
  runtime int4,
  director text,
  main_cast text,
  release_date date,
  similarity float
)
language sql stable
as $$
  select
    movies.id,
    movies.title,
    movies.original_language,
    movies.genres,
    movies.overview,
    movies.vote_average,
    movies.vote_count,
    movies.poster_path,
    movies.runtime,
    movies.director,
    movies.main_cast,
    movies.release_date,
    1 - (movies.embedding <=> query_embedding) as similarity
  from movies
  where movies.embedding is not null
    and 1 - (movies.embedding <=> query_embedding) > match_threshold
  order by movies.embedding <=> query_embedding
  limit match_count;
$$;


-- deleted movies with low_vote_count. deleted_count = 5451; actual_number_movies: 12596 
DELETE FROM movies
WHERE vote_count < 100;
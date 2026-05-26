-- Local dev only: creates per-service databases on first container start.
-- In production RDS, run this once manually after the first deploy:
--   psql -h <rds-endpoint> -U dbadmin -d postgres -f infra/postgres-init.sql

CREATE DATABASE users_db;
CREATE DATABASE orders_db;

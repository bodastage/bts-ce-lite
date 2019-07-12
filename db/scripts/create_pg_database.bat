Rem 
Rem Create  database base user and database
Rem 
Rem Licence Apache 2.0
Rem Author Emmanuel Robert Ssebaggala <emmanuel.ssebaggala@bodastage.com>
Rem 

Rem set PG_PASSWORD=%PG_PASSWORD%
psql -v ON_ERROR_STOP=1 -v PG_PASSWORD="%1" --username "%2%" <<-EOSQL
    CREATE USER bodastage WITH PASSWORD 'password';
    CREATE DATABASE boda owner bodastage;


	-- CREATE EXTENSION tablefunc;

EOSQL

# Create functions in bodastage schema
psql -v ON_ERROR_STOP=1 -v PG_PASSWORD="password" --username "bodastage" --dbname "boda"  <<-'EOSQL'

   -- Hex to integer
    CREATE OR REPLACE FUNCTION hex_to_int(hexval varchar) RETURNS integer AS $$
    DECLARE
       result  int;
    BEGIN
     EXECUTE 'SELECT x''' || hexval || '''::int' INTO result;
     RETURN result;
    END;
    $$
    LANGUAGE 'plpgsql' IMMUTABLE STRICT;

	-- HEX to character/string
    CREATE OR REPLACE FUNCTION hex_to_char(hexval varchar) RETURNS integer AS $$
    DECLARE
       result  varchar;
    BEGIN
     EXECUTE 'SELECT x''' || hexval || '''::int' INTO result;
     RETURN result;
    END;
    $$
    LANGUAGE 'plpgsql' IMMUTABLE STRICT;
EOSQL
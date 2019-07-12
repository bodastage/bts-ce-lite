#!/bin/bash
#
#Create  database base user and database
#
#Licence Apache 2.0
#Author Emmanuel Robert Ssebaggala <emmanuel.ssebaggala@bodastage.com>
#
#Usage: create_pg_database.sh bodastage password

set PGPASSWORD=%2
psql -v ON_ERROR_STOP=1 --username "$1" <<-EOSQL
    CREATE USER bodastage WITH PASSWORD 'password';
    CREATE DATABASE boda owner bodastage;


	-- CREATE EXTENSION tablefunc;

EOSQL

set PGPASSWORD=password
# Create functions in bodastage schema
psql -v ON_ERROR_STOP=1 --username "bodastage"  --dbname "boda"  <<-'EOSQL'

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
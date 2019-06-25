CREATE USER bodastage WITH PASSWORD 'password';
CREATE DATABASE boda owner bodastage;

-- Switch database and users
\c boda bodastage

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
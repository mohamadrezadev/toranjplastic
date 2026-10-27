SELECT 'CREATE DATABASE toranj_test' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'toranj_test')\gexec
SELECT 'CREATE DATABASE toranj_strapi' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'toranj_strapi')\gexec

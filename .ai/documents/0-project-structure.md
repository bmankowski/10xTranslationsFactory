1. Project is dockerized. And used port is 3000.
2. In Docker compose directory is mapped, so there is no need to COPY files in Dockerfile.
3. If you have new dependancy, install it inside the docker. For example docker exec 10xtranslationsfactory-app-1 npm install date-fns
4. For backend we use supabase

API endpoints list:
    /api/languages - Get available languages
    /api/proficiency-levels - Get available proficiency levels
    /api/texts - Create and manage text exercises

Pages:
    / - Home page/Landing page
    /exercise/generate - Generate new exercises
    /exercises - List exercises
    /kitchen-sink - UI component showcase
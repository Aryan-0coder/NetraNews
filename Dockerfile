# Single-service build for Railway: compiles the Spring Boot backend (which also
# bundles the front-end from ./index.html + ./assets into the jar) and runs it.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN chmod +x backend/mvnw && cd backend && ./mvnw -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/netranews-api-1.0.0.jar app.jar
# Railway injects PORT; application.yml reads ${PORT:8080}.
EXPOSE 8080
CMD ["java","-jar","app.jar"]

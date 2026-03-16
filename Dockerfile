# Etapa 1: Compilación usando el Gradle Wrapper
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .

# Le damos permisos de ejecución al script del wrapper por si acaso
RUN chmod +x ./gradlew

# Compilamos usando EL WRAPPER en lugar del gradle global
RUN ./gradlew clean build -x test

# Etapa 2: Imagen final superligera
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
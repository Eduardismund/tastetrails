FROM openjdk:21-jdk-slim

# Install curl for healthcheck, clean apt cache afterward
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy Gradle wrapper and build files first for dependency caching
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src ./src

# Build the project without running tests
RUN ./gradlew build -x test --no-daemon

# Expose port your Spring Boot app listens on
EXPOSE 8080

# Healthcheck for container health based on Spring Boot actuator endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the built jar file explicitly (replace with your exact JAR name)
CMD ["java", "-jar", "build/libs/TasteTrails_backend-0.0.1-SNAPSHOT.jar"]

FROM amazoncorretto:21 AS builder

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Download dependencies
RUN ./gradlew build -x test --no-daemon || return 0

COPY src src

RUN ./gradlew clean bootJar -x test --no-daemon

FROM amazoncorretto:21-slim

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy only the fat jar
COPY --from=builder /app/build/libs/*.jar app.jar

# Set permissions
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

# Optimized Java command for containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

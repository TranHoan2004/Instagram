FROM gradle:8.13-jdk21-alpine as builder

WORKDIR /app

COPY . .

RUN chmod +x ./gradlew

RUN ./gradlew clean bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy only the fat jar
COPY --from=builder /app/build/libs/*.jar app.jar

# Set permissions
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8000

# Optimized Java command for containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
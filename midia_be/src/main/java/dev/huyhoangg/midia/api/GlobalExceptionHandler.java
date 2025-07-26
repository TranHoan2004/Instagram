package dev.huyhoangg.midia.api;

import jakarta.validation.ConstraintViolationException;

import com.netflix.graphql.types.errors.ErrorType;

import dev.huyhoangg.midia.business.auth.UnauthenticatedException;
import dev.huyhoangg.midia.business.user.RoleNotExistsException;
import dev.huyhoangg.midia.business.user.UserNotExistsException;
import graphql.GraphQLError;

import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @GraphQlExceptionHandler(RuntimeException.class)
    public GraphQLError handleRuntimeException(RuntimeException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.INTERNAL)
                .message(ex.getMessage())
                .extensions(Map.of("errorType", ex.getClass()))
                .build();
    }

    @GraphQlExceptionHandler(UnauthenticatedException.class)
    public GraphQLError handleUnauthenticatedException(UnauthenticatedException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.UNAUTHENTICATED)
                .message(ex.getMessage())
                .build();
    }

    @GraphQlExceptionHandler(IllegalArgumentException.class)
    public GraphQLError handleIllegalArgException(IllegalArgumentException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.BAD_REQUEST)
                .message(ex.getMessage())
                .build();
    }

    @GraphQlExceptionHandler(ConstraintViolationException.class)
    public GraphQLError handleConstraintViolationException(ConstraintViolationException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.BAD_REQUEST)
                .message(ex.getMessage())
                .build();
    }

    @GraphQlExceptionHandler(AuthorizationDeniedException.class)
    public GraphQLError handleAuthorizationDeniedException(AuthorizationDeniedException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.UNAUTHENTICATED)
                .message(ex.getMessage())
                .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleUsernameNotFoundException(UsernameNotFoundException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.BAD_REQUEST)
                .message(ex.getMessage())
                .build();
    }

    @GraphQlExceptionHandler(RoleNotExistsException.class)
    public GraphQLError handleRoleNotExistsExceptionGraphQL(RoleNotExistsException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.BAD_REQUEST)
                .message(ex.getMessage())
                .build();
    }

    @GraphQlExceptionHandler(UserNotExistsException.class)
    public GraphQLError handleUserNotExistsExceptionGraphQL(UserNotExistsException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.BAD_REQUEST)
                .message(ex.getMessage() != null && !ex.getMessage().isEmpty() ? ex.getMessage() : "User not found")
                .build();
    }

    @ExceptionHandler(UserNotExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserNotExistsException(UserNotExistsException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(RoleNotExistsException.class)
    public ResponseEntity<Map<String, String>> handleRoleNotExistsException(RoleNotExistsException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeExceptionRest(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}

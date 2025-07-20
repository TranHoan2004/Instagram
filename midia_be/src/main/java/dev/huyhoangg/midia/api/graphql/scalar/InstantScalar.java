package dev.huyhoangg.midia.api.graphql.scalar;

import com.netflix.graphql.dgs.DgsScalar;
import graphql.GraphQLContext;
import graphql.execution.CoercedVariables;
import graphql.language.StringValue;
import graphql.language.Value;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import org.jetbrains.annotations.NotNull;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Locale;

@DgsScalar(name = "Instant")
public class InstantScalar implements Coercing<Instant, String> {

    @Override
    public String serialize(@NotNull Object dataFetcherResult, @NotNull GraphQLContext graphQLContext, @NotNull Locale locale) throws CoercingSerializeException {
        if (dataFetcherResult instanceof Instant) {
            return ((Instant) dataFetcherResult).toString(); // ISO-8601 format
        }
        throw new CoercingSerializeException("Expected java.time.Instant");
    }

    @Override
    public Instant parseValue(Object input,  @NotNull GraphQLContext graphQLContext, @NotNull Locale locale) throws CoercingParseValueException {
        try {
            return Instant.parse(input.toString());
        } catch (DateTimeParseException e) {
            throw new CoercingParseValueException("Invalid ISO‑8601 Instant: " + input, e);
        }
    }

    @Override
    public Instant parseLiteral(@NotNull Value<?> input, @NotNull CoercedVariables variables, @NotNull GraphQLContext graphQLContext, @NotNull Locale locale) throws CoercingParseLiteralException {
        if (!(input instanceof StringValue)) {
            throw new CoercingParseLiteralException("Expected AST type 'StringValue'");
        }
        try {
            return Instant.parse(((StringValue) input).getValue());
        } catch (DateTimeParseException e) {
            throw new CoercingParseLiteralException("Invalid ISO‑8601 Instant: " + input, e);
        }
    }

    @NotNull
    @Override
    public Value<?> valueToLiteral(@NotNull Object input, @NotNull GraphQLContext graphQLContext, @NotNull Locale locale) {
        String serialized = serialize(input, graphQLContext, locale);
        return new StringValue(serialized);
    }
}

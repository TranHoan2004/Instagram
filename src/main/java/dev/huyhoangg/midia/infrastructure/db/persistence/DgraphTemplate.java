package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.dgraph.DgraphClient;
import io.dgraph.Transaction;
import io.dgraph.TxnException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DgraphTemplate {
    private final DgraphClient dgraphClient;

    /**
     * Open a read-only transaction, run the given action, close the txn,
     * and wrap any JsonProcessingException in a RuntimeException.
     *
     * @param action  a lambda that takes a Transaction and returns R (may throw JsonProcessingException)
     * @param <R>     return type
     * @return        whatever the lambda returned
     * @throws RuntimeException if mapping (JsonProcessingException) fails
     */
    public <R> R executeReadOnlyQuery(FunctionWithJsonException<Transaction, R> action) {
        try (var txn = dgraphClient.newReadOnlyTransaction()) {
            return action.apply(txn);
        } catch (JsonProcessingException | RuntimeException e) {
            throw new RuntimeException("Error mapping Dgraph response", e);
        }
    }

    /**
     * Same as executeReadOnlyQuery, but if the action throws JsonProcessingException, return Optional.empty().
     *
     * @param action  a lambda that takes a Transaction and returns R (may throw JsonProcessingException)
     * @param <R>     return type
     * @return        Optional.of(result) if successful; Optional.empty() on JsonProcessingException
     */
    public <R> Optional<R> executeReadOnlyQueryReturnOptional(FunctionWithJsonException<Transaction, R> action) {
        try (var txn = dgraphClient.newReadOnlyTransaction()) {
            return Optional.of(action.apply(txn));
        } catch (JsonProcessingException | RuntimeException e) {
            return Optional.empty();
        }
    }

    public <R> R executeMutation(FunctionWithJsonOrTxnException<Transaction, R> action) {
        try (var txn = dgraphClient.newTransaction()) {
            try {
                return action.apply(txn);
            } catch (JsonProcessingException | TxnException e) {
                throw new RuntimeException(e);
            } finally {
                txn.discard();
            }
        }
    }

    public void executeMutation(ReturnVoidFunctionWithJsonOrTxnException<Transaction> action) {
        try (var txn = dgraphClient.newTransaction()) {
            try {
                action.apply(txn);
            } catch (JsonProcessingException | TxnException e) {
                throw new RuntimeException(e);
            } finally {
                txn.discard();
            }
        }
    }

    @FunctionalInterface
    public interface FunctionWithJsonException<T, R> {
        R apply(T txn) throws JsonProcessingException;
    }

    @FunctionalInterface
    public interface FunctionWithJsonOrTxnException<T, R> {
        R apply(T txn) throws JsonProcessingException, TxnException;
    }

    @FunctionalInterface
    public interface ReturnVoidFunctionWithJsonOrTxnException<T> {
        void apply(T txn) throws JsonProcessingException, TxnException;
    }
}

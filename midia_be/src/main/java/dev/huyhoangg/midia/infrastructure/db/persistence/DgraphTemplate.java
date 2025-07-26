package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;

import dev.huyhoangg.midia.infrastructure.db.DgraphExecuteException;
import io.dgraph.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DgraphTemplate {
    private final DgraphClient dgraphClient;

    /**
     * Open a read-only transaction, run the given action, close the txn,
     * and wrap any JsonProcessingException in a RuntimeException.
     *
     * @param action a lambda that takes a Transaction and returns R (may throw JsonProcessingException)
     * @param <R>    return type
     * @return whatever the lambda returned
     * @throws RuntimeException if mapping (JsonProcessingException) fails
     */
    public <R> R executeReadOnlyQuery(FunctionWithJsonException<Transaction, R> action) {
        try (var txn = dgraphClient.newReadOnlyTransaction()) {
            return action.apply(txn);
        } catch (JsonProcessingException | RuntimeException e) {
            log.error("Error mapping Dgraph response : {}", e.getMessage(), e);
            throw new RuntimeException("Error mapping Dgraph response", e);
        }
    }

    /**
     * Same as executeReadOnlyQuery, but if the action throws JsonProcessingException, return Optional.empty().
     *
     * @param action a lambda that takes a Transaction and returns R (may throw JsonProcessingException)
     * @param <R>    return type
     * @return Optional.of(result) if successful; Optional.empty() on JsonProcessingException
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
                throw new DgraphExecuteException(e);
            } finally {
                txn.discard();
            }
        }
    }

    public <R> R executeMutationWithRetry(FunctionWithJsonOrTxnException<Transaction, R> action) {
        int maxRetries = 3;
        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try (var txn = dgraphClient.newTransaction()) {
                try {
                    return action.apply(txn);
                } catch (TxnConflictException e) {
                    log.warn("Dgraph TxnConflictException, retrying... attempt {}/{}", attempt + 1, maxRetries);
                    if (attempt == maxRetries - 1) throw new DgraphExecuteException(e);
                    // else, retry
                } catch (JsonProcessingException | TxnException e) {
                    throw new DgraphExecuteException(e);
                } finally {
                    txn.discard();
                }
            }
        }
        throw new DgraphExecuteException("Max retries exceeded");
    }

    public void executeMutation(ReturnVoidFunctionWithJsonOrTxnException<Transaction> action) {
        try (var txn = dgraphClient.newTransaction()) {
            try {
                action.apply(txn);
            } catch (JsonProcessingException | TxnException e) {
                throw new DgraphExecuteException(e);
            } finally {
                txn.discard();
            }
        }
    }

    public void executeUpsert(String query, DgraphProto.Mutation mutation) {
        try (var txn = dgraphClient.newTransaction()) {
            try {
                var request = DgraphProto.Request.newBuilder()
                        .setQuery(query)
                        .addMutations(mutation)
                        .setCommitNow(true)
                        .build();
                txn.doRequest(request);
                txn.close();
            } catch (TxnException e) {
                log.debug("Error executing upsert", e);
                throw new DgraphExecuteException(e);
            } finally {
                txn.discard();
            }
        }
    }

    public boolean executeUpsertReturnSuccess(String query, DgraphProto.Mutation ...mutations) {
        try (var txn = dgraphClient.newTransaction()) {
            try {
                var request = DgraphProto.Request.newBuilder()
                        .setQuery(query)
                        .addAllMutations(Arrays.stream(mutations).toList())
                        .setCommitNow(true)
                        .build();
                txn.doRequest(request);
                txn.close();
                return true;
            } catch (Exception e) {
                log.error("Error executing upsert", e);
                return false;
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

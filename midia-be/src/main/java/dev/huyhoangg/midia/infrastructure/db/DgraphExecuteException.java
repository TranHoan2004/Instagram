package dev.huyhoangg.midia.infrastructure.db;

public class DgraphExecuteException extends RuntimeException {
    public DgraphExecuteException() {
        super("Dgraph execution error");
    }

    public DgraphExecuteException(String message) {
        super(message);
    }

    public DgraphExecuteException(Throwable cause) {
        super("Dgraph execution error", cause);
    }
}

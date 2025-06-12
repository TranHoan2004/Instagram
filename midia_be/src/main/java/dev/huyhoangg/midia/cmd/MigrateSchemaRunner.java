package dev.huyhoangg.midia.cmd;

import io.dgraph.DgraphClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@Slf4j
@RequiredArgsConstructor
public class MigrateSchemaRunner implements CommandLineRunner {
    private final DgraphClient dgraphClient;

    @Override
    public void run(String... args) throws Exception {
        var migrating = Arrays.asList(args).contains("--migrate-schema");

        if (!migrating) {
            return;
        }

        log.info("Migrating schema");
    }
}

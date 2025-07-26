package dev.huyhoangg.midia.cmd;

import com.google.protobuf.ByteString;

import io.dgraph.DgraphClient;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
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

        log.info("--------Migrating schema--------");
        var resource = new ClassPathResource("dgraph-schema/schema.dql");
        var input = resource.getInputStream();

        var schemaOperation = DgraphProto.Operation.newBuilder()
                .setSchemaBytes(ByteString.copyFrom(input.readAllBytes()))
                .setRunInBackground(true)
                .build();

        dgraphClient.alter(schemaOperation);
        log.info("--------Schema migrated--------");
        input.close();
    }
}

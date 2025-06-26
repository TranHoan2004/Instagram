package dev.huyhoangg.midia.cmd;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        var isSeeding = Arrays.asList(args).contains("--seed");

        if (!isSeeding) {
            return;
        }

        log.info("Seeding data...");
    }
}

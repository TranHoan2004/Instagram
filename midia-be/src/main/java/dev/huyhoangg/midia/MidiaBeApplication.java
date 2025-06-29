package dev.huyhoangg.midia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MidiaBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(MidiaBeApplication.class, args);
    }

}

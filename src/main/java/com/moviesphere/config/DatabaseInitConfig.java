package com.moviesphere.config;

import javax.sql.DataSource;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

@Configuration
public class DatabaseInitConfig {

    @Bean
    public ApplicationRunner sqlInitializer(DataSource dataSource) {
        return args -> {
            ResourceDatabasePopulator routinesPopulator = new ResourceDatabasePopulator();
            routinesPopulator.setSeparator("@@");
            routinesPopulator.setContinueOnError(false);
            routinesPopulator.setIgnoreFailedDrops(true);
            routinesPopulator.addScript(new ClassPathResource("procedures.sql"));
            routinesPopulator.addScript(new ClassPathResource("triggers.sql"));
            routinesPopulator.execute(dataSource);

            ResourceDatabasePopulator seedPopulator = new ResourceDatabasePopulator();
            seedPopulator.setSeparator(";");
            seedPopulator.setContinueOnError(false);
            seedPopulator.setIgnoreFailedDrops(true);
            seedPopulator.addScript(new ClassPathResource("seed.sql"));
            seedPopulator.execute(dataSource);
        };
    }
}
package com.moviesphere.config;

import javax.sql.DataSource;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

@Configuration
public class TriggerProcedureSqlConfig {

    @Bean
    public ApplicationRunner sqlInitializer(DataSource dataSource) {
        return args -> {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.setSeparator("@@");
            populator.setContinueOnError(false);
            populator.setIgnoreFailedDrops(true);

            populator.addScript(new ClassPathResource("procedures.sql"));
            populator.addScript(new ClassPathResource("triggers.sql"));

            populator.execute(dataSource);
        };
    }
}
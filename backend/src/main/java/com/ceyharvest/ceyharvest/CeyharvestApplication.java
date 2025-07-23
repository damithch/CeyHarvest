package com.ceyharvest.ceyharvest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@ComponentScan(basePackages = {"com.ceyharvest.ceyharvest", "com.ceyharvest.controller", "com.ceyharvest.dto"})
public class CeyharvestApplication {

	public static void main(String[] args) {
		SpringApplication.run(CeyharvestApplication.class, args);
	}

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

}

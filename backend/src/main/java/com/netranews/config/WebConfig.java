package com.netranews.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Single source of CORS truth (the old CorsConfig was removed to avoid overlapping mappings).
// Any localhost / 127.0.0.1 port is allowed so the front-end works on whatever static-server port
// you pick (5500, 5501, 3000, ...); extra non-local origins come from CORS_ORIGINS.
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Value("${app.cors-origins}") private String origins;
  @Override public void addCorsMappings(CorsRegistry registry) {
    List<String> patterns=new ArrayList<>();
    patterns.add("http://localhost:[*]"); patterns.add("http://127.0.0.1:[*]");
    for(String o:origins.split(",")){String t=o.trim();if(!t.isEmpty())patterns.add(t);}
    registry.addMapping("/api/**").allowedOriginPatterns(patterns.toArray(new String[0]))
      .allowedMethods("GET","POST","PUT","DELETE","OPTIONS").allowedHeaders("*").allowCredentials(true);
  }
}

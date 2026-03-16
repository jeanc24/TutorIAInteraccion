package icc354.pucmm.tutoriainteraccion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Desactivamos CSRF porque es una API REST (no usamos formularios web tradicionales de Spring)
                .csrf(AbstractHttpConfigurer::disable)
                // Configuramos las reglas de autorización
                .authorizeHttpRequests(auth -> auth
                        // Temporalmente permitimos el acceso a TODOS los endpoints sin login
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}

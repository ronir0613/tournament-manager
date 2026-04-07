package com.project.game.config;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {
                })
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // Public
                        .requestMatchers("/api/auth/**").permitAll()

                        // Player
                        .requestMatchers("/api/tournaments/*/register").hasRole("PLAYER")

                        // Admin
                        // 🔥 FIX: Added ** to allow query parameters like ?format=ROUND_ROBIN
                        .requestMatchers("/api/tournaments/*/start**").hasRole("ADMIN")
                        // 🔥 FIX: Added ** to allow query parameters like ?winnerId=0
                        .requestMatchers("/api/matches/*/result**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/tournaments").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/tournaments/**").authenticated()
                        
                        // Shared (authenticated users)
                        .requestMatchers("/api/tournaments/*/bracket").authenticated()
                        .requestMatchers("/api/tournaments/*/leaderboard").authenticated()
                        
                        .requestMatchers("/api/users").permitAll()
                        .requestMatchers("/api/tournaments/*/participants").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/tournaments/*").hasRole("ADMIN")
                        .requestMatchers("/api/matches/my").authenticated()
                        
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
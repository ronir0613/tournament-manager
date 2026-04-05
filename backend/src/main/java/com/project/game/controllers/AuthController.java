package com.project.game.controllers;

import org.springframework.web.bind.annotation.*;

import com.project.game.DTO.LoginRequest;
import com.project.game.DTO.RegisterRequest;
import com.project.game.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
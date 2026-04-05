package com.project.game.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.project.game.model.User;
import com.project.game.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
}
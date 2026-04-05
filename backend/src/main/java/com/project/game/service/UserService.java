package com.project.game.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.project.game.model.User;
import com.project.game.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
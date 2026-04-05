package com.project.game.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.project.game.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
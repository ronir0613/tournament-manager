package com.project.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.game.model.Tournament;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
}
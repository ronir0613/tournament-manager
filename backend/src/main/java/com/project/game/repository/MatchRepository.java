package com.project.game.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.project.game.model.*;

public interface MatchRepository extends JpaRepository<Matches, Long> {

    List<Matches> findByTournament(Tournament tournament);

    List<Matches> findByTournamentAndRound(Tournament tournament, int round);
    List<Matches> findByPlayer1OrPlayer2(User player1, User player2);
}
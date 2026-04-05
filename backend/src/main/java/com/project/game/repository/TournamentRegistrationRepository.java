package com.project.game.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.project.game.model.*;

public interface TournamentRegistrationRepository extends JpaRepository<TournamentRegistration, Long> {

    List<TournamentRegistration> findByTournament(Tournament tournament);

    boolean existsByTournamentAndUser(Tournament tournament, User user);
}
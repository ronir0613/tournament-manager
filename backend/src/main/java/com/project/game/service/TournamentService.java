package com.project.game.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.project.game.DTO.LeaderboardResponse;
import com.project.game.DTO.TournamentRequest;
import com.project.game.model.Tournament;
import com.project.game.model.User;
import com.project.game.model.Matches;
import com.project.game.model.TournamentRegistration;

import com.project.game.repository.TournamentRepository;
import com.project.game.repository.TournamentRegistrationRepository;
import com.project.game.repository.MatchRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final MatchRepository matchRepository;

    public TournamentService(TournamentRepository tournamentRepository,
            TournamentRegistrationRepository registrationRepository,
            MatchRepository matchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.registrationRepository = registrationRepository;
        this.matchRepository = matchRepository;
    }

    public String createTournament(TournamentRequest request) {

        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setGame(request.getGame());
        tournament.setMaxPlayers(request.getMaxPlayers());
        tournament.setStatus(Tournament.Status.UPCOMING);
        tournament.setCreatedBy(user);

        tournamentRepository.save(tournament);

        return "Tournament created successfully";
    }

    public String registerForTournament(Long tournamentId) {

        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getStatus() != Tournament.Status.UPCOMING) {
            return "Tournament already started";
        }

        if (registrationRepository.existsByTournamentAndUser(tournament, user)) {
            return "Already registered";
        }

        List<TournamentRegistration> registrations = registrationRepository.findByTournament(tournament);

        if (registrations.size() >= tournament.getMaxPlayers()) {
            return "Tournament full";
        }

        TournamentRegistration reg = new TournamentRegistration();
        reg.setTournament(tournament);
        reg.setUser(user);
        reg.setRegisteredAt(LocalDateTime.now());

        registrationRepository.save(reg);

        return "Registered successfully";
    }

    public String startTournament(Long tournamentId) {

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getStatus() != Tournament.Status.UPCOMING) {
            return "Tournament already started";
        }

        List<TournamentRegistration> registrations = registrationRepository.findByTournament(tournament);

        if (registrations.size() < 2) {
            return "Not enough players";
        }

        List<User> players = new ArrayList<>();

        for (TournamentRegistration reg : registrations) {
            players.add(reg.getUser());
        }

        Collections.shuffle(players);

        int round = 1;
        int matchOrder = 1;

        for (int i = 0; i < players.size(); i += 2) {

            Matches match = new Matches();
            match.setTournament(tournament);
            match.setRound(round);
            match.setMatchOrder(matchOrder++);

            match.setPlayer1(players.get(i));

            if (i + 1 < players.size()) {
                match.setPlayer2(players.get(i + 1));
            } else {
                match.setPlayer2(null);
                match.setWinnerId(players.get(i).getId());
            }

            matchRepository.save(match);
        }

        tournament.setStatus(Tournament.Status.ONGOING);
        tournamentRepository.save(tournament);

        return "Tournament started and matches created";
    }

    public Map<Integer, List<Matches>> getBracket(Long tournamentId) {

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        List<Matches> matches = matchRepository.findByTournament(tournament);

        Map<Integer, List<Matches>> bracket = new HashMap<>();

        for (Matches match : matches) {
            int round = match.getRound();

            bracket.putIfAbsent(round, new ArrayList<>());
            bracket.get(round).add(match);
        }

        return bracket;
    }

    public List<LeaderboardResponse> getLeaderboard(Long tournamentId) {

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        List<Matches> matches = matchRepository.findByTournament(tournament);

        Map<User, Integer> leaderboardMap = new HashMap<>();

        for (Matches match : matches) {

            if (match.getWinnerId() != null) {

                User winner = null;

                if (match.getPlayer1() != null &&
                        match.getPlayer1().getId().equals(match.getWinnerId())) {
                    winner = match.getPlayer1();
                } else if (match.getPlayer2() != null &&
                        match.getPlayer2().getId().equals(match.getWinnerId())) {
                    winner = match.getPlayer2();
                }

                if (winner != null) {
                    leaderboardMap.put(winner,
                            leaderboardMap.getOrDefault(winner, 0) + 1);
                }
            }
        }

        List<LeaderboardResponse> leaderboard = new ArrayList<>();

        for (Map.Entry<User, Integer> entry : leaderboardMap.entrySet()) {
            leaderboard.add(new LeaderboardResponse(
                    entry.getKey().getUsername(),
                    entry.getValue()));
        }

        // 🔥 FIX: sort leaderboard
        leaderboard.sort((a, b) -> b.getWins() - a.getWins());

        return leaderboard;
    }

    public String updateMatchResult(Long matchId, Long winnerId) {

        Matches match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getWinnerId() != null) {
            return "Result already declared";
        }

        if (match.getPlayer1() == null && match.getPlayer2() == null) {
            return "Invalid match";
        }

        if (match.getPlayer1() != null && match.getPlayer1().getId().equals(winnerId)) {
            match.setWinnerId(winnerId);
        } else if (match.getPlayer2() != null && match.getPlayer2().getId().equals(winnerId)) {
            match.setWinnerId(winnerId);
        } else {
            return "Winner must be one of the players";
        }

        matchRepository.save(match);

        return "Match result updated";
    }

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    public List<User> getParticipants(Long tournamentId) {

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        List<TournamentRegistration> registrations = registrationRepository.findByTournament(tournament);

        List<User> users = new ArrayList<>();

        for (TournamentRegistration reg : registrations) {
            users.add(reg.getUser());
        }

        return users;
    }

    // 🔥 FIXED DELETE (IMPORTANT)
    public String deleteTournament(Long id) {

        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        // delete matches first
        matchRepository.deleteAll(matchRepository.findByTournament(tournament));

        // delete registrations
        registrationRepository.deleteAll(registrationRepository.findByTournament(tournament));

        // delete tournament
        tournamentRepository.delete(tournament);

        return "Tournament deleted";
    }

    public String updateTournamentStatus(Long id, String status) {

        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        try {
            tournament.setStatus(Tournament.Status.valueOf(status));
        } catch (Exception e) {
            return "Invalid status";
        }

        tournamentRepository.save(tournament);

        return "Tournament status updated";
    }
}
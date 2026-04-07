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

    // 🔥 FIX: Overloaded method to accept admin's format choice (KNOCKOUT or
    // ROUND_ROBIN)
    public String startTournament(Long tournamentId, String preferredFormat) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getStatus() != Tournament.Status.UPCOMING) {
            return "Tournament already started";
        }

        List<TournamentRegistration> registrations = registrationRepository.findByTournament(tournament);
        int playerCount = registrations.size();

        // 🔥 Limit Check
        if (playerCount < 2) {
            return "Not enough players";
        }
        if (playerCount > 16) {
            return "Maximum limit is 16 players";
        }

        List<User> players = new ArrayList<>();
        for (TournamentRegistration reg : registrations) {
            players.add(reg.getUser());
        }

        // Determine if power of two (2, 4, 8, 16)
        boolean isPowerOfTwo = (playerCount & (playerCount - 1)) == 0;

        // 🔥 Routing Logic
        if (playerCount == 2 || (isPowerOfTwo && "KNOCKOUT".equalsIgnoreCase(preferredFormat))) {
            generateKnockoutMatches(tournament, players);
        } else {
            generateRoundRobinMatches(tournament, players);
        }

        tournament.setStatus(Tournament.Status.ONGOING);
        tournamentRepository.save(tournament);

        return "Tournament started and matches created";
    }

    // Fallback for your existing controller if format is not provided
    public String startTournament(Long tournamentId) {
        return startTournament(tournamentId, "ROUND_ROBIN");
    }

    // 🔥 NEW: Abstracted Knockout Logic
    private void generateKnockoutMatches(Tournament tournament, List<User> players) {
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
            } else { // BYE handling
                match.setPlayer2(null);
                match.setWinnerId(players.get(i).getId());
            }
            matchRepository.save(match);
        }
    }

    // 🔥 NEW: Round Robin Logic (Circle Method)
    private void generateRoundRobinMatches(Tournament tournament, List<User> players) {
        List<User> list = new ArrayList<>(players);
        if (list.size() % 2 != 0) {
            list.add(null); // Add dummy player for BYEs
        }

        int numRounds = list.size() - 1;
        int halfSize = list.size() / 2;
        int matchOrder = 1;

        for (int round = 0; round < numRounds; round++) {
            for (int i = 0; i < halfSize; i++) {
                User player1 = list.get(i);
                User player2 = list.get(list.size() - 1 - i);

                // If one of them is the dummy player, the real player gets a BYE (auto-win)
                if (player1 != null || player2 != null) {
                    Matches match = new Matches();
                    match.setTournament(tournament);
                    match.setRound(round + 1);
                    match.setMatchOrder(matchOrder++);

                    if (player2 == null) {
                        match.setPlayer1(player1);
                        match.setPlayer2(null);
                        match.setWinnerId(player1.getId()); // Auto win
                    } else if (player1 == null) {
                        match.setPlayer1(player2);
                        match.setPlayer2(null);
                        match.setWinnerId(player2.getId()); // Auto win
                    } else {
                        match.setPlayer1(player1);
                        match.setPlayer2(player2);
                    }
                    matchRepository.save(match);
                }
            }
            // Rotate list (keep index 0 fixed)
            User lastPlayer = list.remove(list.size() - 1);
            list.add(1, lastPlayer);
        }
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

    // 🔥 FIX: Updated to support +3 for Win, +1 for Tie, 0 for Loss
    public List<LeaderboardResponse> getLeaderboard(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        List<Matches> matches = matchRepository.findByTournament(tournament);
        Map<User, Integer> pointsMap = new HashMap<>();

        for (Matches match : matches) {
            if (match.getWinnerId() != null) {
                // TIE CONDITION: If winnerId is explicitly set to 0, it's a draw (+1 pt each)
                if (match.getWinnerId() == 0L) {
                    if (match.getPlayer1() != null) {
                        pointsMap.put(match.getPlayer1(), pointsMap.getOrDefault(match.getPlayer1(), 0) + 1);
                    }
                    if (match.getPlayer2() != null) {
                        pointsMap.put(match.getPlayer2(), pointsMap.getOrDefault(match.getPlayer2(), 0) + 1);
                    }
                }
                // WIN CONDITION: (+3 pts)
                else {
                    User winner = null;
                    if (match.getPlayer1() != null && match.getPlayer1().getId().equals(match.getWinnerId())) {
                        winner = match.getPlayer1();
                    } else if (match.getPlayer2() != null && match.getPlayer2().getId().equals(match.getWinnerId())) {
                        winner = match.getPlayer2();
                    }

                    if (winner != null) {
                        pointsMap.put(winner, pointsMap.getOrDefault(winner, 0) + 3);
                    }
                }
            }
        }

        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        for (Map.Entry<User, Integer> entry : pointsMap.entrySet()) {
            // Assuming your LeaderboardResponse still uses "wins" field,
            // but we are passing total "points" into it now!
            leaderboard.add(new LeaderboardResponse(entry.getKey().getUsername(), entry.getValue()));
        }

        // Sort by highest points
        leaderboard.sort((a, b) -> b.getPoints() - a.getPoints());

        return leaderboard;
    }

    public String updateMatchResult(Long matchId, Long winnerId) {
        Matches match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getWinnerId() != null) {
            return "Result already declared";
        }

        // 🔥 Handle Ties (Pass 0 as winnerId from Frontend to declare a tie)
        if (winnerId == 0L) {
            match.setWinnerId(0L);
        } else if (match.getPlayer1() != null && match.getPlayer1().getId().equals(winnerId)) {
            match.setWinnerId(winnerId);
        } else if (match.getPlayer2() != null && match.getPlayer2().getId().equals(winnerId)) {
            match.setWinnerId(winnerId);
        } else {
            return "Winner must be one of the players or 0 for Tie";
        }

        matchRepository.save(match);
        Tournament tournament = match.getTournament();
        int currentRound = match.getRound();

        List<Matches> currentRoundMatches = matchRepository.findByTournamentAndRound(tournament, currentRound);
        boolean roundCompleted = currentRoundMatches.stream().allMatch(m -> m.getWinnerId() != null);

        if (!roundCompleted) {
            return "Match result updated";
        }

        // 🔥 Check if next round already exists (Determines if we are in Round Robin or Knockout)
        List<Matches> nextRoundCheck = matchRepository.findByTournamentAndRound(tournament, currentRound + 1);
        if (!nextRoundCheck.isEmpty()) {
            // Next round is already generated (This means we are currently in Round Robin).
            List<Matches> allMatches = matchRepository.findByTournament(tournament);
            boolean allCompleted = allMatches.stream().allMatch(m -> m.getWinnerId() != null);
            
            if (allCompleted) {
                // 🔥 ALL ROUND ROBIN MATCHES ARE DONE: Check for a Clear Winner!
                List<LeaderboardResponse> leaderboard = getLeaderboard(tournament.getId());
                if (leaderboard.isEmpty()) {
                    tournament.setStatus(Tournament.Status.COMPLETED);
                    tournamentRepository.save(tournament);
                    return "Tournament completed.";
                }

                int topPoints = leaderboard.get(0).getPoints();
                List<String> topUsernames = new ArrayList<>();
                for (LeaderboardResponse lr : leaderboard) {
                    if (lr.getPoints() == topPoints) {
                        topUsernames.add(lr.getUsername());
                    }
                }

                // CASE 1: Clear Winner! (e.g., Mumbai with 27 pts)
                if (topUsernames.size() == 1) {
                    tournament.setStatus(Tournament.Status.COMPLETED);
                    tournamentRepository.save(tournament);
                    return "Tournament completed! Winner: " + topUsernames.get(0);
                }

                // CASE 2: Tie-Breaker Needed
                List<User> tiedUsers = new ArrayList<>();
                List<TournamentRegistration> registrations = registrationRepository.findByTournament(tournament);
                for (TournamentRegistration reg : registrations) {
                    if (topUsernames.contains(reg.getUser().getUsername())) {
                        tiedUsers.add(reg.getUser());
                    }
                }

                // Find highest round to append tie-breakers
                int maxRound = allMatches.stream().mapToInt(Matches::getRound).max().orElse(currentRound);
                int nextTieBreakerRound = maxRound + 1;
                boolean isPowerOfTwo = (tiedUsers.size() & (tiedUsers.size() - 1)) == 0;
                
                int matchOrder = 1;
                List<Matches> tieBreakerMatches = new ArrayList<>();

                if (isPowerOfTwo) {
                    // Knockout Tie-Breaker (Inlined to avoid conflicts)
                    Collections.shuffle(tiedUsers);
                    for (int i = 0; i < tiedUsers.size(); i += 2) {
                        Matches tbMatch = new Matches();
                        tbMatch.setTournament(tournament);
                        tbMatch.setRound(nextTieBreakerRound);
                        tbMatch.setMatchOrder(matchOrder++);
                        tbMatch.setPlayer1(tiedUsers.get(i));
                        if (i + 1 < tiedUsers.size()) {
                            tbMatch.setPlayer2(tiedUsers.get(i + 1));
                        } else {
                            tbMatch.setPlayer2(null);
                            tbMatch.setWinnerId(tiedUsers.get(i).getId());
                        }
                        tieBreakerMatches.add(tbMatch);
                    }
                    matchRepository.saveAll(tieBreakerMatches);
                    return "Tie detected! Starting Knockout Tie-Breaker.";
                } else {
                    // Mini Round Robin Tie-Breaker (Inlined to avoid conflicts)
                    List<User> list = new ArrayList<>(tiedUsers);
                    if (list.size() % 2 != 0) {
                        list.add(null);
                    }
                    int numRounds = list.size() - 1;
                    int halfSize = list.size() / 2;
                    
                    for (int r = 0; r < numRounds; r++) {
                        for (int i = 0; i < halfSize; i++) {
                            User p1 = list.get(i);
                            User p2 = list.get(list.size() - 1 - i);
                            if (p1 != null || p2 != null) {
                                Matches tbMatch = new Matches();
                                tbMatch.setTournament(tournament);
                                tbMatch.setRound(nextTieBreakerRound + r);
                                tbMatch.setMatchOrder(matchOrder++);
                                if (p2 == null) {
                                    tbMatch.setPlayer1(p1);
                                    tbMatch.setPlayer2(null);
                                    tbMatch.setWinnerId(p1.getId());
                                } else if (p1 == null) {
                                    tbMatch.setPlayer1(p2);
                                    tbMatch.setPlayer2(null);
                                    tbMatch.setWinnerId(p2.getId());
                                } else {
                                    tbMatch.setPlayer1(p1);
                                    tbMatch.setPlayer2(p2);
                                }
                                tieBreakerMatches.add(tbMatch);
                            }
                        }
                        User last = list.remove(list.size() - 1);
                        list.add(1, last);
                    }
                    matchRepository.saveAll(tieBreakerMatches);
                    return "Tie detected! Starting Mini Round Robin Tie-Breaker.";
                }
            }
            return "Match result updated. Proceed to next round.";
        }

        // --- BELOW IS KNOCKOUT LOGIC ONLY (Since next round doesn't exist yet) ---

        List<User> winners = new ArrayList<>();
        for (Matches m : currentRoundMatches) {
            if (m.getWinnerId() != 0L) { // Exclude ties from advancing in knockout
                if (m.getPlayer1() != null && m.getPlayer1().getId().equals(m.getWinnerId())) {
                    winners.add(m.getPlayer1());
                } else if (m.getPlayer2() != null && m.getPlayer2().getId().equals(m.getWinnerId())) {
                    winners.add(m.getPlayer2());
                }
            }
        }

        if (winners.size() <= 1) {
            tournament.setStatus(Tournament.Status.COMPLETED);
            tournamentRepository.save(tournament);
            return "Tournament completed";
        }

        // Create Next Knockout Round
        List<Matches> nextRoundMatches = new ArrayList<>();
        int nextRound = currentRound + 1;
        int matchOrder = 1;

        for (int i = 0; i < winners.size(); i += 2) {
            Matches newMatch = new Matches();
            newMatch.setTournament(tournament);
            newMatch.setRound(nextRound);
            newMatch.setMatchOrder(matchOrder++);
            newMatch.setPlayer1(winners.get(i));

            if (i + 1 < winners.size()) {
                newMatch.setPlayer2(winners.get(i + 1));
            } else {
                newMatch.setPlayer2(null);
                newMatch.setWinnerId(winners.get(i).getId());
            }
            nextRoundMatches.add(newMatch);
        }

        matchRepository.saveAll(nextRoundMatches);
        return "Match result updated. Next round generated.";
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

    public String deleteTournament(Long id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        matchRepository.deleteAll(matchRepository.findByTournament(tournament));
        registrationRepository.deleteAll(registrationRepository.findByTournament(tournament));
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

    public Tournament getTournament(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
    }
}
package com.project.game.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.project.game.DTO.LeaderboardResponse;
import com.project.game.DTO.TournamentRequest;
import com.project.game.model.Matches;
import com.project.game.model.Tournament;
import com.project.game.model.User;
import com.project.game.service.TournamentService;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @PostMapping
    public String createTournament(@RequestBody TournamentRequest request) {
        return tournamentService.createTournament(request);
    }

    @PostMapping("/{id}/register")
    public String register(@PathVariable Long id) {
        return tournamentService.registerForTournament(id);
    }

    @PutMapping("/{id}/start")
    public String startTournament(@PathVariable Long id) {
        return tournamentService.startTournament(id);
    }

    @GetMapping("/{id}/bracket")
    public Map<Integer, List<Matches>> getBracket(@PathVariable Long id) {
        return tournamentService.getBracket(id);
    }

    @GetMapping("/{id}/leaderboard")
    public List<LeaderboardResponse> getLeaderboard(@PathVariable Long id) {
        return tournamentService.getLeaderboard(id);
    }

    @GetMapping
    public List<Tournament> getAllTournaments() {
        return tournamentService.getAllTournaments();
    }

    @GetMapping("/{id}/participants")
    public List<User> getParticipants(@PathVariable Long id) {
        return tournamentService.getParticipants(id);
    }

}
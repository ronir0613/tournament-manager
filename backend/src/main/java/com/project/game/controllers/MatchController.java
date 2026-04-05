package com.project.game.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.project.game.model.Matches;
import com.project.game.service.MatchService;
import com.project.game.service.TournamentService;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final TournamentService tournamentService;
    private final MatchService matchService;

    public MatchController(TournamentService tournamentService,
                           MatchService matchService) {
        this.tournamentService = tournamentService;
        this.matchService = matchService;
    }

    @PutMapping("/{id}/result")
    public String updateResult(@PathVariable Long id,
                              @RequestParam Long winnerId) {
        return tournamentService.updateMatchResult(id, winnerId);
    }

    // 🔥 NEW API
    @GetMapping("/my")
    public List<Matches> getMyMatches() {
        return matchService.getMyMatches();
    }
}
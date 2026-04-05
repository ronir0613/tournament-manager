package com.project.game.controllers;

import org.springframework.web.bind.annotation.*;

import com.project.game.service.TournamentService;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final TournamentService tournamentService;

    public MatchController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @PutMapping("/{id}/result")
    public String updateResult(@PathVariable Long id,
            @RequestParam Long winnerId) {
        return tournamentService.updateMatchResult(id, winnerId);
    }
}
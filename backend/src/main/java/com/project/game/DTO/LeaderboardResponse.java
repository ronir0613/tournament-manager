package com.project.game.DTO;

public class LeaderboardResponse {

    private String username;
    private int wins;

    public LeaderboardResponse(String username, int wins) {
        this.username = username;
        this.wins = wins;
    }

    public String getUsername() { return username; }
    public int getWins() { return wins; }
}
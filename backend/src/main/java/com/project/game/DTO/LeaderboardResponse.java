package com.project.game.DTO;

public class LeaderboardResponse {
    private Long userId;

    private String username;
    private int points; // 🔥 FIX: Renamed from 'wins' to 'points'

    public LeaderboardResponse(String username, int points) {
        this.username = username;
        this.points = points;
    }

    public String getUsername() { return username; }
    public int getPoints() { return points; }
}
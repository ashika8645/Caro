package com.example.demo.controller;

import com.example.demo.model.Game;

public class GameController {
    private Game game;

    public GameController() {
        game = new Game();
    }

    public boolean makeMove(int x, int y) {
        return game.makeMove(x, y);
    }

    public char[][] getBoard() {
        return game.getBoard();
    }

    public char getCurrentPlayer() {
        return game.getCurrentPlayer();
    }

    public boolean isGameWon() {
        return game.isGameWon();
    }

    public boolean isGameDraw() {
        return game.isGameDraw();
    }
}

package com.example.demo.model;

import java.util.Arrays;

public class Game {
    private static final int BOARD_SIZE = 15;
    private char[][] board;
    private char currentPlayer;
    private boolean gameWon;
    private boolean gameDraw;

    public Game() {
        board = new char[BOARD_SIZE][BOARD_SIZE];
        for (char[] row : board) {
            Arrays.fill(row, ' ');
        }
        currentPlayer = 'X';
        gameWon = false;
        gameDraw = false;
    }

    public boolean makeMove(int x, int y) {
        if (board[x][y] == ' ' && !gameWon && !gameDraw) {
            board[x][y] = currentPlayer;
            if (checkWin(x, y)) {
                gameWon = true;
            } else if (checkDraw()) {
                gameDraw = true;
            } else {
                currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';
            }
            return true;
        }
        return false;
    }

    private boolean checkWin(int x, int y) {
        return false;
    }

    private boolean checkDraw() {
        return false;
    }

    public char[][] getBoard() {
        return board;
    }

    public char getCurrentPlayer() {
        return currentPlayer;
    }

    public boolean isGameWon() {
        return gameWon;
    }

    public boolean isGameDraw() {
        return gameDraw;
    }
}

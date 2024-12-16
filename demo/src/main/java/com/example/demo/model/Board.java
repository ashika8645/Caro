package com.example.demo.model;

public class Board {
    private final int size;
    private final String[][] board;

    public Board(int size) {
        this.size = size;
        this.board = new String[size][size];
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                board[i][j] = "";
            }
        }
    }

    public boolean makeMove(int x, int y, String player) {
        if (x < 0 || x >= size || y < 0 || y >= size || !board[x][y].isEmpty()) {
            return false;
        }
        board[x][y] = player;
        return true;
    }

    public boolean checkWin(int x, int y, String player) {
        int count;

        count = 1;
        for (int i = 1; i < 5; i++) {
            if (x + i < size && board[x + i][y].equals(player)) count++;
            else break;
        }
        for (int i = 1; i < 5; i++) {
            if (x - i >= 0 && board[x - i][y].equals(player)) count++;
            else break;
        }
        if (count >= 5) return true;

        count = 1;
        for (int i = 1; i < 5; i++) {
            if (y + i < size && board[x][y + i].equals(player)) count++;
            else break;
        }
        for (int i = 1; i < 5; i++) {
            if (y - i >= 0 && board[x][y - i].equals(player)) count++;
            else break;
        }
        if (count >= 5) return true;

        count = 1;
        for (int i = 1; i < 5; i++) {
            if (x + i < size && y + i < size && board[x + i][y + i].equals(player)) count++;
            else break;
        }
        for (int i = 1; i < 5; i++) {
            if (x - i >= 0 && y - i >= 0 && board[x - i][y - i].equals(player)) count++;
            else break;
        }
        if (count >= 5) return true;

        count = 1;
        for (int i = 1; i < 5; i++) {
            if (x + i < size && y - i >= 0 && board[x + i][y - i].equals(player)) count++;
            else break;
        }
        for (int i = 1; i < 5; i++) {
            if (x - i >= 0 && y + i < size && board[x - i][y + i].equals(player)) count++;
            else break;
        }
        if (count >= 5) return true;

        return false;
    }

    public boolean isFull() {
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                if (board[i][j].isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }
}

package com.example.demo.service;

import com.example.demo.model.TrainingBoard;
import com.example.demo.repository.TrainingBoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class TrainingBoardService {

    @Autowired
    private TrainingBoardRepository trainingBoardRepository;

    private static final int WIN_LENGTH = 5;

    public List<TrainingBoard> getAllBoards() {
        return trainingBoardRepository.findAll();
    }

    public Optional<TrainingBoard> getBoardById(Long id) {
        return trainingBoardRepository.findById(id);
    }

    public TrainingBoard saveBoard(TrainingBoard trainingBoard) {
        return trainingBoardRepository.save(trainingBoard);
    }

    public void deleteBoard(Long id) {
        trainingBoardRepository.deleteById(id);
    }

    public TrainingBoard getRandomBoard() {
        List<TrainingBoard> allBoards = trainingBoardRepository.findAll();
        if (allBoards.isEmpty()) {
            throw new RuntimeException("No training boards available");
        }
        int randomIndex = new Random().nextInt(allBoards.size());
        return allBoards.get(randomIndex);
    }

    public boolean checkWin(String[][] board, int x, int y, String player) {
        int count;

        // Check horizontal
        count = 1;
        for (int i = 1; i < WIN_LENGTH; i++) {
            if (x + i < board.length && board[x + i][y].equals(player)) count++;
            else break;
        }
        for (int i = 1; i < WIN_LENGTH; i++) {
            if (x - i >= 0 && board[x - i][y].equals(player)) count++;
            else break;
        }
        if (count >= WIN_LENGTH) return true;

        // Check vertical
        count = 1;
        for (int i = 1; i < WIN_LENGTH; i++) {
            if (y + i < board[x].length && board[x][y + i].equals(player)) count++;
            else break;
        }
        for (int i = 1; i < WIN_LENGTH; i++) {
            if (y - i >= 0 && board[x][y - i].equals(player)) count++;
            else break;
        }
        if (count >= WIN_LENGTH) return true;

        // Check diagonal (top-left to bottom-right)
        count = 1;
        for (int i = 1; i < WIN_LENGTH; i++) {
            if (x + i < board.length && y + i < board[x].length && board[x + i][y + i].equals(player)) count++;
            else break;
        }
        for (int i = 1; i < WIN_LENGTH; i++) {
            if (x - i >= 0 && y - i >= 0 && board[x - i][y - i].equals(player)) count++;
            else break;
        }
        if (count >= WIN_LENGTH) return true;

        // Check diagonal (top-right to bottom-left)
        count = 1;
        for (int i = 1; i < WIN_LENGTH; i++) {
            if (x + i < board.length && y - i >= 0 && board[x + i][y - i].equals(player)) count++;
            else break;
        }
        for (int i = 1; i < WIN_LENGTH; i++) {
            if (x - i >= 0 && y + i < board[x].length && board[x - i][y + i].equals(player)) count++;
            else break;
        }
        if (count >= WIN_LENGTH) return true;

        return false;
    }

    public boolean isFull(String[][] board) {
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[i].length; j++) {
                if (board[i][j].isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }
}

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
}

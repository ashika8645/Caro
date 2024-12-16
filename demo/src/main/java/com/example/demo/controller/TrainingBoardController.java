package com.example.demo.controller;

import com.example.demo.model.TrainingBoard;
import com.example.demo.service.TrainingBoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/training/boards")
public class TrainingBoardController {

    @Autowired
    private TrainingBoardService trainingBoardService;

    @GetMapping
    public List<TrainingBoard> getAllBoards() {
        return trainingBoardService.getAllBoards();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingBoard> getBoardById(@PathVariable Long id) {
        Optional<TrainingBoard> board = trainingBoardService.getBoardById(id);
        return board.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/random")
    public ResponseEntity<TrainingBoard> getRandomBoard() {
        TrainingBoard randomBoard = trainingBoardService.getRandomBoard();
        return ResponseEntity.ok(randomBoard);
    }

    @PostMapping
    public ResponseEntity<TrainingBoard> createBoard(@RequestBody TrainingBoard trainingBoard) {
        TrainingBoard createdBoard = trainingBoardService.saveBoard(trainingBoard);
        return ResponseEntity.ok(createdBoard);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingBoard> updateBoard(@PathVariable Long id, @RequestBody TrainingBoard trainingBoard) {
        Optional<TrainingBoard> existingBoard = trainingBoardService.getBoardById(id);
        if (existingBoard.isPresent()) {
            trainingBoard.setId(id);
            TrainingBoard updatedBoard = trainingBoardService.saveBoard(trainingBoard);
            return ResponseEntity.ok(updatedBoard);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        trainingBoardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}

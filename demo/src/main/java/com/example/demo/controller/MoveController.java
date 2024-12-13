package com.example.demo.controller;

import com.example.demo.model.Move;
import com.example.demo.service.MoveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moves")
public class MoveController {
    @Autowired
    private MoveService moveService;

    @GetMapping
    public List<Move> getAllMoves() {
        return moveService.getAllMoves();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Move> getMoveById(@PathVariable Long id) {
        Move move = moveService.getMoveById(id);
        if (move != null) {
            return ResponseEntity.ok(move);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Move> createMove(@RequestBody Move moveRequest) {
        Move move = moveService.createMove(moveRequest);
        return ResponseEntity.ok(move);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMove(@PathVariable Long id) {
        moveService.deleteMove(id);
        return ResponseEntity.noContent().build();
    }
}

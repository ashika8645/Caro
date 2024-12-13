package com.example.demo.controller;

import com.example.demo.model.Match;
import com.example.demo.model.Move;
import com.example.demo.service.MatchService;
import com.example.demo.service.MoveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {
    @Autowired
    private MatchService matchService;

    @Autowired
    private MoveService moveService;

    @GetMapping
    public List<Match> getAllMatches() {
        return matchService.getAllMatches();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getMatchById(@PathVariable Long id) {
        Match match = matchService.getMatchById(id);
        if (match != null) {
            return ResponseEntity.ok(match);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> startMatch(@RequestParam Long playerId) {
        Long opponentId = matchService.getOpponent();
        if (opponentId == null) {
            matchService.addToQueue(playerId);
            return ResponseEntity.ok("Waiting for opponent...");
        }
        // Logic để bắt đầu trận đấu với đối thủ
        Match match = matchService.createMatch();
        // Thiết lập thông tin trận đấu
        return ResponseEntity.ok(match);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Long id) {
        matchService.deleteMatch(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/moves")
    public Move makeMove(@PathVariable Long id, @RequestParam Long playerId, @RequestParam int x, @RequestParam int y) {
        return matchService.makeMove(id, playerId, x, y);
    }

    @GetMapping("/{id}/moves")
    public List<Move> getMoves(@PathVariable Long id) {
        return moveService.getMovesByMatchId(id);
    }
}

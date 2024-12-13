package com.example.demo.service;

import com.example.demo.model.Move;
import com.example.demo.repository.MoveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MoveService {
    @Autowired
    private MoveRepository moveRepository;

    public List<Move> getAllMoves() {
        return moveRepository.findAll();
    }

    public Move getMoveById(Long id) {
        return moveRepository.findById(id).orElse(null);
    }

    public Move createMove(Move move) {
        return moveRepository.save(move);
    }

    public void deleteMove(Long id) {
        moveRepository.deleteById(id);
    }

    public List<Move> getMovesByMatchId(Long matchId) {
        return moveRepository.findByMatchId(matchId);
    }
}

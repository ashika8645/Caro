package com.example.demo.service;

import com.example.demo.model.Board;
import com.example.demo.model.Match;
import com.example.demo.model.Move;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.MoveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

@Service
public class MatchService {
    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MoveRepository moveRepository;

    private Queue<Long> waitingPlayers = new LinkedList<>();

    public void addToQueue(Long playerId) {
        waitingPlayers.add(playerId);
    }

    public Long getOpponent() {
        return waitingPlayers.poll();
    }

    public boolean isQueueEmpty() {
        return waitingPlayers.isEmpty();
    }

    public Match createMatch() {
        Match match = new Match();
        match.setCurrentPlayer("X");
        match.setBoard(new Board(15));
        return matchRepository.save(match);
    }

    public Move makeMove(Long matchId, Long playerId, int x, int y) {
        Match match = matchRepository.findById(matchId).orElse(null);
        if (match == null) {
            throw new IllegalArgumentException("Match not found");
        }

        String currentPlayer = match.getCurrentPlayer();
        Board board = match.getBoard();

        if (!board.makeMove(x, y, currentPlayer)) {
            throw new IllegalArgumentException("Invalid move");
        }

        Move move = new Move();
        move.setMatch(match);
        move.setPlayerId(playerId);
        move.setX(x);
        move.setY(y);
        move.setMoveTime(LocalDateTime.now());
        move.setPlayer(currentPlayer);
        moveRepository.save(move);

        if (board.checkWin(x, y, currentPlayer)) {
            match.setWinner(currentPlayer);
        } else if (board.isFull()) {
            match.setWinner("Draw");
        } else {
            match.setCurrentPlayer(currentPlayer.equals("X") ? "O" : "X");
        }

        matchRepository.save(match);
        return move;
    }

    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    public Match getMatchById(Long id) {
        return matchRepository.findById(id).orElse(null);
    }

    public void deleteMatch(Long id) {
        matchRepository.deleteById(id);
    }
}

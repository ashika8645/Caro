package com.example.demo.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;

public class GameHandler extends TextWebSocketHandler {

    private Queue<WebSocketSession> waitingPlayers = new LinkedList<>();
    private Map<String, List<WebSocketSession>> activeMatches = new HashMap<>();
    private Map<String, String> matchCurrentPlayer = new HashMap<>();  // Lưu trữ người chơi hiện tại của mỗi trận đấu
    private Map<String, char[][]> matchBoards = new HashMap<>();       // Lưu trữ trạng thái bàn cờ của mỗi trận đấu

    private static final int BOARD_SIZE = 15;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("A player connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        Map<String, Object> data = new ObjectMapper().readValue(payload, Map.class);
        String type = (String) data.get("type");

        switch (type) {
            case "findMatch":
                if (!waitingPlayers.isEmpty()) {
                    WebSocketSession opponent = waitingPlayers.poll();
                    String matchId = "match-" + System.currentTimeMillis();
                    activeMatches.put(matchId, Arrays.asList(session, opponent));
                    matchCurrentPlayer.put(matchId, "X"); // Bắt đầu với người chơi "X"
                    matchBoards.put(matchId, new char[BOARD_SIZE][BOARD_SIZE]);
                    notifyMatchFound(session, matchId, "X");
                    notifyMatchFound(opponent, matchId, "O");
                } else {
                    waitingPlayers.add(session);
                    session.sendMessage(new TextMessage("{\"type\": \"waiting\", \"message\": \"Waiting for an opponent...\"}"));
                }
                break;
            case "move":
                handleMove(session, data);
                break;
            case "chat":
                relayMessageToOpponent(session, data);
                break;
        }
    }

    private void handleMove(WebSocketSession session, Map<String, Object> data) throws Exception {
        String matchId = (String) data.get("matchId");
        List<WebSocketSession> players = activeMatches.get(matchId);
        char[][] board = matchBoards.get(matchId);
        String player = (String) data.get("player");
        int x = (int) data.get("x");
        int y = (int) data.get("y");

        if (players != null && board != null && matchCurrentPlayer.get(matchId).equals(player)) {
            if (board[x][y] == '\0') { // Nước đi hợp lệ
                board[x][y] = player.charAt(0);
                boolean isWin = checkWin(board, x, y, player.charAt(0));
                boolean isDraw = checkDraw(board);

                Map<String, Object> moveData = new HashMap<>(data);
                moveData.put("type", isWin || isDraw ? "gameOver" : "move");
                if (isWin) {
                    moveData.put("winner", player);
                } else if (isDraw) {
                    moveData.put("winner", "Draw");
                }

                String moveMessage = new ObjectMapper().writeValueAsString(moveData);

                for (WebSocketSession playerSession : players) {
                    playerSession.sendMessage(new TextMessage(moveMessage));
                }

                if (isWin || isDraw) {
                    activeMatches.remove(matchId);
                    matchCurrentPlayer.remove(matchId);
                    matchBoards.remove(matchId);
                } else {
                    matchCurrentPlayer.put(matchId, player.equals("X") ? "O" : "X");
                }
            } else {
                session.sendMessage(new TextMessage("{\"type\": \"error\", \"message\": \"Invalid move!\"}"));
            }
        } else {
            session.sendMessage(new TextMessage("{\"type\": \"error\", \"message\": \"Not your turn!\"}"));
        }
    }

    private boolean checkWin(char[][] board, int x, int y, char player) {
        // Kiểm tra các điều kiện thắng
        int[][] directions = { {0, 1}, {1, 0}, {1, 1}, {1, -1} };

        for (int[] dir : directions) {
            int count = 1;
            count += countConsecutive(board, x, y, dir[0], dir[1], player);
            count += countConsecutive(board, x, y, -dir[0], -dir[1], player);
            if (count >= 5) return true;
        }
        return false;
    }

    private int countConsecutive(char[][] board, int x, int y, int dx, int dy, char player) {
        int count = 0;
        int nx = x + dx;
        int ny = y + dy;
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] == player) {
            count++;
            nx += dx;
            ny += dy;
        }
        return count;
    }

    private boolean checkDraw(char[][] board) {
        for (char[] row : board) {
            for (char cell : row) {
                if (cell == '\0') return false;
            }
        }
        return true;
    }

    private void relayMessageToOpponent(WebSocketSession session, Map<String, Object> data) throws Exception {
        String matchId = (String) data.get("matchId");
        List<WebSocketSession> players = activeMatches.get(matchId);
        if (players != null) {
            WebSocketSession opponent = players.stream().filter(s -> !s.equals(session)).findFirst().orElse(null);
            if (opponent != null) {
                opponent.sendMessage(new TextMessage(new ObjectMapper().writeValueAsString(data)));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("A player disconnected: " + session.getId());
        waitingPlayers.remove(session);
        activeMatches.values().removeIf(players -> players.contains(session));
        notifyOpponentDisconnected(session);
    }

    private void notifyMatchFound(WebSocketSession session, String matchId, String role) throws Exception {
        session.sendMessage(new TextMessage("{\"type\": \"matchFound\", \"matchId\": \"" + matchId + "\", \"role\": \"" + role + "\"}"));
    }

    private void notifyOpponentDisconnected(WebSocketSession session) throws Exception {
        activeMatches.values().forEach(players -> {
            if (players.contains(session)) {
                players.stream().filter(s -> !s.equals(session)).forEach(opponent -> {
                    try {
                        opponent.sendMessage(new TextMessage("{\"type\": \"notification\", \"message\": \"Your opponent has disconnected. You win by default.\"}"));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }
        });
    }
}

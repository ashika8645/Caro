package com.example.demo.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ChatHandler extends TextWebSocketHandler {

    private List<WebSocketSession> sessions = new ArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("Chat session established: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        Map<String, Object> data = new ObjectMapper().readValue(payload, Map.class);
        String type = (String) data.get("type");

        if ("chat".equals(type)) {
            String chatMessage = (String) data.get("message");
            broadcastChatMessage(session, chatMessage);
        }
    }

    private void broadcastChatMessage(WebSocketSession senderSession, String message) throws Exception {
        for (WebSocketSession session : sessions) {
            if (session.isOpen() && !session.getId().equals(senderSession.getId())) {
                Map<String, Object> chatMessage = Map.of(
                        "type", "chat",
                        "message", message
                );
                String chatMessageJson = new ObjectMapper().writeValueAsString(chatMessage);
                session.sendMessage(new TextMessage(chatMessageJson));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("Chat session closed: " + session.getId());
    }
}

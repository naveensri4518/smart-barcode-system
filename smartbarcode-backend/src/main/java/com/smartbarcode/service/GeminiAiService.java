package com.smartbarcode.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAiService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=";

    @Value("${gemini.api.key:}")
    private String apiKey;

    private String getApiKey() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            // Fallback to environment variable if properties is empty
            String envKey = System.getenv("GEMINI_API_KEY");
            if (envKey != null && !envKey.trim().isEmpty()) {
                return envKey.trim();
            }
            throw new RuntimeException("Gemini API key is missing. Please add gemini.api.key=YOUR_KEY to application.properties");
        }
        return apiKey.trim();
    }

    public String generateChatCompletion(String systemPrompt, String userMessage) {
        try {
            // Combine system prompt and user message for Gemini compatibility
            String fullPrompt = "SYSTEM INSTRUCTIONS: " + systemPrompt + "\n\nUSER MESSAGE: " + userMessage;

            var requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", fullPrompt)
                    ))
                )
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + getApiKey()))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() != 200) {
                log.error("Gemini API Error: {}", response.body());
                throw new RuntimeException("Gemini API returned error: " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            return root.path("candidates").get(0)
                       .path("content")
                       .path("parts").get(0)
                       .path("text").asText();

        } catch (Exception e) {
            log.error("Failed to generate chat completion", e);
            throw new RuntimeException("AI processing failed", e);
        }
    }

    public String getProductRecommendations(List<String> cartItems) {
        String systemPrompt = "You are an AI upsell assistant for a retail store. " +
            "Given a list of items currently in a customer's cart, suggest exactly 1 complementary product they might also want to buy. " +
            "Return ONLY the name of the product, with no other text.";
        return generateChatCompletion(systemPrompt, "Cart Items: " + String.join(", ", cartItems));
    }

    public String lookupBarcode(String barcode) {
        String systemPrompt = "You are an AI product catalog assistant. " +
            "Given a barcode (EAN/UPC), try to guess the most likely Product Name, Brand, and Category for a typical Indian supermarket. " +
            "If you do not know, make a highly plausible guess based on common FMCG goods. " +
            "Return the output STRICTLY as a JSON object with keys: 'name', 'brand', 'category'. " +
            "Do not return any markdown blocks or extra text.";
        String res = generateChatCompletion(systemPrompt, "Barcode: " + barcode);
        
        // Clean up potential markdown formatting from Gemini
        if (res.startsWith("```json")) {
            res = res.substring(7);
        }
        if (res.startsWith("```")) {
            res = res.substring(3);
        }
        if (res.endsWith("```")) {
            res = res.substring(0, res.length() - 3);
        }
        return res.trim();
    }
}

package com.skillswap.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SkillswapBackendApplicationTests {

    @Value("${local.server.port}")
    private int port;

    @Test
    void contextLoads() {
    }

    @Test
    void sessionDataRequiresAuthentication() throws Exception {
        HttpResponse<String> response = get("/api/sessions?userId=1");
        assertEquals(401, response.statusCode());
    }

    @Test
    void publicUserDirectoryDoesNotExposeEmailAddresses() throws Exception {
        HttpResponse<String> response = get("/api/users");
        assertEquals(200, response.statusCode());
        assertFalse(response.body().contains("\"email\""));
    }

    @Test
    void registrationAndLoginIssueAWorkingBearerToken() throws Exception {
        String email = "test-" + System.nanoTime() + "@example.com";
        HttpResponse<String> registration = post("/api/users",
                "{\"id\":999999999,\"name\":\"Test User\",\"email\":\"" + email
                        + "\",\"password\":\"password123\"}");
        assertEquals(201, registration.statusCode());
        Matcher userIdMatcher = Pattern.compile("\"id\":(\\d+)").matcher(registration.body());
        org.junit.jupiter.api.Assertions.assertTrue(userIdMatcher.find());
        String userId = userIdMatcher.group(1);
        assertFalse(userId.equals("999999999"));

        HttpResponse<String> login = post("/api/users/login",
                "{\"email\":\"" + email + "\",\"password\":\"password123\"}");
        assertEquals(200, login.statusCode());
        Matcher tokenMatcher = Pattern.compile("\"accessToken\":\"([^\"]+)\"").matcher(login.body());
        org.junit.jupiter.api.Assertions.assertTrue(tokenMatcher.find());
        String token = tokenMatcher.group(1);

        HttpRequest sessionRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/sessions?userId=" + userId))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        assertEquals(200, HttpClient.newHttpClient()
                .send(sessionRequest, HttpResponse.BodyHandlers.ofString()).statusCode());

        HttpRequest deleteRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/users/" + userId))
                .header("Authorization", "Bearer " + token)
                .DELETE()
                .build();
        assertEquals(200, HttpClient.newHttpClient()
                .send(deleteRequest, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    private HttpResponse<String> get(String path) throws Exception {
        return send(HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .GET()
                .build());
    }

    private HttpResponse<String> post(String path, String body) throws Exception {
        return send(HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build());
    }

    private HttpResponse<String> send(HttpRequest request) throws Exception {
        return HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    }
}

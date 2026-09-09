package org.franky.infrastructure.in.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/util")
public class UtilController {

    @GetMapping("/resolve-url")
    public Map<String, String> resolveUrl(@RequestParam String url) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "FrankyApp/1.0 (resolve-url)");
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            conn.connect();

            // Consume response to ensure the redirect chain completes
            int code = conn.getResponseCode();
            if (code >= 400) {
                try (InputStream es = conn.getErrorStream()) {
                    if (es != null) es.readAllBytes();
                }
            } else {
                try (InputStream is = conn.getInputStream()) {
                    is.readAllBytes();
                }
            }

            String resolvedUrl = conn.getURL().toString();
            conn.disconnect();

            if (resolvedUrl == null || resolvedUrl.equals(url)) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "No se pudo resolver la URL. El servidor no redirigió.");
            }

            return Map.of("resolvedUrl", resolvedUrl);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Error al resolver la URL: " + e.getMessage());
        }
    }
}

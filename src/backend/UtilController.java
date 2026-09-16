package org.franky.infrastructure.in.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/v1/util")
public class UtilController {

    private static final Set<String> ALLOWED_HOSTS = Set.of(
            "maps.google.com",
            "www.google.com",
            "google.com",
            "nominatim.openstreetmap.org"
    );

    private static final Pattern PRIVATE_IP_PATTERN = Pattern.compile(
            "^(10\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[01])\\.|127\\.|169\\.254\\.|0\\.|::1|localhost)$"
    );

    @GetMapping("/resolve-url")
    public Map<String, String> resolveUrl(@RequestParam String url) {
        try {
            URL targetUrl = new URL(url);
            String protocol = targetUrl.getProtocol();
            if (!"http".equals(protocol) && !"https".equals(protocol)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Protocolo no permitido. Solo se permiten HTTP y HTTPS.");
            }

            String hostname = targetUrl.getHost().toLowerCase();
            if (!isHostAllowed(hostname)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Host no permitido: " + hostname);
            }
            if (isPrivateHost(hostname)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "No se permite acceso a hosts privados.");
            }

            HttpURLConnection conn = (HttpURLConnection) targetUrl.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "FrankyApp/1.0 (resolve-url)");
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            conn.connect();

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

            URL finalUrl = new URL(resolvedUrl);
            String finalHostname = finalUrl.getHost().toLowerCase();
            if (!isHostAllowed(finalHostname) || isPrivateHost(finalHostname)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "La URL redirige a un host no permitido: " + finalHostname);
            }

            return Map.of("resolvedUrl", resolvedUrl);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Error al resolver la URL: " + e.getMessage());
        }
    }

    private boolean isHostAllowed(String hostname) {
        if (ALLOWED_HOSTS.contains(hostname)) return true;
        if (hostname.endsWith(".google.com")) return true;
        return false;
    }

    private boolean isPrivateHost(String hostname) {
        String lower = hostname.toLowerCase().replaceAll("^\\[|\\]$", "");
        if (PRIVATE_IP_PATTERN.matcher(lower).matches()) return true;
        try {
            InetAddress addr = InetAddress.getByName(lower);
            return addr.isAnyLocalAddress() || addr.isLoopbackAddress()
                    || addr.isSiteLocalAddress() || addr.isLinkLocalAddress();
        } catch (Exception e) {
            return false;
        }
    }
}

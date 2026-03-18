package icc354.pucmm.tutoriainteraccion.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    // CAMBIO AQUÍ: Ahora guarda en una carpeta externa en la raíz del proyecto
    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // LIMPIEZA: Reemplazamos espacios y caracteres raros por guiones bajos
            String originalName = file.getOriginalFilename();
            if (originalName != null) {
                originalName = originalName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            }

            String filename = UUID.randomUUID().toString() + "_" + originalName;
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.write(path, file.getBytes());

            return ResponseEntity.ok(Map.of("url", "/videos/" + filename));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al guardar el video: " + e.getMessage()));
        }
    }
}
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

    // Guarda los videos dentro de la carpeta estática para que puedan ser vistos inmediatamente
    private static final String UPLOAD_DIR = "src/main/resources/static/videos/";

    @PostMapping
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs(); // Crea la carpeta si no existe
            }

            // Generamos un nombre único para evitar sobreescribir videos con el mismo nombre
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.write(path, file.getBytes());

            // Devolvemos la URL con la que el frontend podrá reproducir el video
            return ResponseEntity.ok(Map.of("url", "/videos/" + filename));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al guardar el video en el servidor"));
        }
    }
}

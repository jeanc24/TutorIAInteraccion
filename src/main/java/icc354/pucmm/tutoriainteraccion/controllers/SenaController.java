package icc354.pucmm.tutoriainteraccion.controllers;

import icc354.pucmm.tutoriainteraccion.models.Sena;
import icc354.pucmm.tutoriainteraccion.repositories.SenaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/senas")
@CrossOrigin(origins = "*")
public class SenaController {

    private final SenaRepository senaRepository;

    public SenaController(SenaRepository senaRepository) {
        this.senaRepository = senaRepository;
    }

    @GetMapping
    public List<Sena> listar() {
        return senaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sena> obtener(@PathVariable Long id) {
        return senaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sena> crear(@Valid @RequestBody SenaRequest request) {
        Sena sena = new Sena();
        sena.setNombre(request.nombre());
        sena.setCategoria(request.categoria());
        sena.setDificultad(request.dificultad());
        sena.setVideoReferenciaUrl(request.videoReferenciaUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(senaRepository.save(sena));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sena> actualizar(@PathVariable Long id, @Valid @RequestBody SenaRequest request) {
        return senaRepository.findById(id)
                .map(sena -> {
                    sena.setNombre(request.nombre());
                    sena.setCategoria(request.categoria());
                    sena.setDificultad(request.dificultad());
                    sena.setVideoReferenciaUrl(request.videoReferenciaUrl());
                    return ResponseEntity.ok(senaRepository.save(sena));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!senaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        senaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record SenaRequest(
            @NotBlank String nombre,
            @NotBlank String categoria,
            @NotBlank String dificultad,
            @NotBlank String videoReferenciaUrl
    ) {}
}

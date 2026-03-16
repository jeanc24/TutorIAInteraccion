package icc354.pucmm.tutoriainteraccion.controllers;

import icc354.pucmm.tutoriainteraccion.models.Progreso;
import icc354.pucmm.tutoriainteraccion.services.ProgresoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progreso")
@CrossOrigin(origins = "*") // Permite peticiones desde React y Unity
public class ProgresoController {

    @Autowired
    private ProgresoService progresoService;

    // Endpoint: POST /api/progreso/registrar
    @PostMapping("/registrar")
    public ResponseEntity<Progreso> registrarProgreso(@RequestBody Map<String, Object> payload) {
        Long usuarioId = Long.valueOf(payload.get("usuario_id").toString());
        Long senaId = Long.valueOf(payload.get("sena_id").toString());
        Double puntuacion = Double.valueOf(payload.get("puntuacion").toString());

        Progreso nuevoProgreso = progresoService.registrarIntento(usuarioId, senaId, puntuacion);
        return ResponseEntity.ok(nuevoProgreso);
    }
}
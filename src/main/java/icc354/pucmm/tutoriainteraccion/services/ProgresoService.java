package icc354.pucmm.tutoriainteraccion.services;

import icc354.pucmm.tutoriainteraccion.models.*;
import icc354.pucmm.tutoriainteraccion.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ProgresoService {

    @Autowired
    private ProgresoRepository progresoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private SenaRepository senaRepository;

    public Progreso registrarIntento(Long usuarioId, Long senaId, Double puntuacion) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Sena sena = senaRepository.findById(senaId)
                .orElseThrow(() -> new RuntimeException("Seña no encontrada"));

        // Buscar si ya existe un progreso previo para este usuario y esta seña
        Optional<Progreso> progresoExistente = progresoRepository.findByUsuarioIdAndSenaId(usuarioId, senaId);

        Progreso progreso;
        if (progresoExistente.isPresent()) {
            progreso = progresoExistente.get();
            // Actualizar solo si la nueva puntuación es mejor
            if (puntuacion > progreso.getMejorPuntuacion()) {
                progreso.setMejorPuntuacion(puntuacion);
            }
        } else {
            progreso = new Progreso();
            progreso.setUsuario(usuario);
            progreso.setSena(sena);
            progreso.setMejorPuntuacion(puntuacion);
        }

        // Si la precisión es mayor al 80%, consideramos la seña como dominada
        if (progreso.getMejorPuntuacion() >= 80.0) {
            progreso.setCompletado(true);
        }

        progreso.setFechaUltimoIntento(LocalDateTime.now());
        return progresoRepository.save(progreso);
    }
}

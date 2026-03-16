package icc354.pucmm.tutoriainteraccion.repositories;

import icc354.pucmm.tutoriainteraccion.models.Progreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgresoRepository extends JpaRepository<Progreso, Long> {
    List<Progreso> findByUsuarioId(Long usuarioId);
    Optional<Progreso> findByUsuarioIdAndSenaId(Long usuarioId, Long senaId);
}



package icc354.pucmm.tutoriainteraccion.repositories;

import icc354.pucmm.tutoriainteraccion.models.Sena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SenaRepository extends JpaRepository<Sena, Long> {
    List<Sena> findByCategoria(String categoria);
}
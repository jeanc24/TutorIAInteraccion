package icc354.pucmm.tutoriainteraccion.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progresos")
public class Progreso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "sena_id", nullable = false)
    private Sena sena;

    private Double mejorPuntuacion; // Porcentaje de precisión (ej. 95.5)
    private Boolean completado = false;
    private LocalDateTime fechaUltimoIntento = LocalDateTime.now();

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Sena getSena() { return sena; }
    public void setSena(Sena sena) { this.sena = sena; }
    public Double getMejorPuntuacion() { return mejorPuntuacion; }
    public void setMejorPuntuacion(Double mejorPuntuacion) { this.mejorPuntuacion = mejorPuntuacion; }
    public Boolean getCompletado() { return completado; }
    public void setCompletado(Boolean completado) { this.completado = completado; }
    public LocalDateTime getFechaUltimoIntento() { return fechaUltimoIntento; }
    public void setFechaUltimoIntento(LocalDateTime fechaUltimoIntento) { this.fechaUltimoIntento = fechaUltimoIntento; }
}
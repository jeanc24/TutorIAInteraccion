package icc354.pucmm.tutoriainteraccion.models;

import jakarta.persistence.*;

@Entity
@Table(name = "senas")
public class Sena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre; // Ej: "Hola"
    private String categoria; // Ej: "Saludos"
    private String dificultad; // FACIL, MEDIO, DIFICIL
    private String videoReferenciaUrl;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getDificultad() { return dificultad; }
    public void setDificultad(String dificultad) { this.dificultad = dificultad; }
}
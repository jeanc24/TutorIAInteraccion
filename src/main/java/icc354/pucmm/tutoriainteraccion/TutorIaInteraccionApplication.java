package icc354.pucmm.tutoriainteraccion;

import icc354.pucmm.tutoriainteraccion.models.Usuario;
import icc354.pucmm.tutoriainteraccion.repositories.UsuarioRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class TutorIaInteraccionApplication {
    public static void main(String[] args) {
        SpringApplication.run(TutorIaInteraccionApplication.class, args);
    }

    @Bean
    public org.springframework.boot.CommandLineRunner createDefaultAdmin(UsuarioRepository usuarioRepository,
                                                                         PasswordEncoder passwordEncoder) {
        return args -> {
            if (!usuarioRepository.existsByEmail("admin@tutor.com")) {
                Usuario admin = new Usuario();
                admin.setNombre("Administrador");
                admin.setEmail("admin@tutor.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRol("ADMIN");
                usuarioRepository.save(admin);
            }
        };
    }
}

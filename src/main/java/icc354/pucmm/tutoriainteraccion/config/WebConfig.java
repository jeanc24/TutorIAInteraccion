package icc354.pucmm.tutoriainteraccion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Obtenemos la ruta absoluta de la carpeta "uploads"
        Path uploadDir = Paths.get("uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // Le decimos a Spring que mapee /videos/** a esa carpeta física en tu disco
        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
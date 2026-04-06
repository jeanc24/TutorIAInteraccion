# Propuesta Integral: Plataforma de Aprendizaje del Abecedario en Lengua de Señas

**Nombre del proyecto:** SignTutor — Alfabeto en Lengua de Señas  
**Versión del documento:** 1.0  
**Fecha:** 6 de abril de 2026  
**Tipo:** Propuesta de diseño, arquitectura y definición funcional

---

## Tabla de contenidos

1. [Descripción general de la plataforma](#1-descripción-general-de-la-plataforma)
2. [Objetivos del sistema](#2-objetivos-del-sistema)
3. [Perfil de usuario objetivo](#3-perfil-de-usuario-objetivo)
4. [Funcionalidades principales](#4-funcionalidades-principales)
5. [Propuesta UX/UI](#5-propuesta-uxui)
6. [Estructura de pantallas](#6-estructura-de-pantallas)
7. [Flujo del usuario](#7-flujo-del-usuario)
8. [Arquitectura del sistema](#8-arquitectura-del-sistema)
9. [Recomendación tecnológica](#9-recomendación-tecnológica)
10. [Diseño del backend](#10-diseño-del-backend)
11. [Módulo de reconocimiento de señas](#11-módulo-de-reconocimiento-de-señas)
12. [Propuesta de rediseño completo](#12-propuesta-de-rediseño-completo)
13. [Requisitos funcionales y no funcionales](#13-requisitos-funcionales-y-no-funcionales)
14. [Propuesta de MVP](#14-propuesta-de-mvp)
15. [Roadmap de desarrollo](#15-roadmap-de-desarrollo)
16. [Conclusión profesional](#16-conclusión-profesional)

---

## 1. Descripción general de la plataforma

### Qué es

SignTutor es una plataforma web educativa diseñada para enseñar el abecedario en lengua de señas de forma interactiva, visual y progresiva. La plataforma combina guías visuales de referencia con reconocimiento gestual en tiempo real a través de la cámara del dispositivo, permitiendo al estudiante aprender, practicar y autoevaluar su dominio de cada letra del alfabeto dactilológico.

### Qué problema resuelve

El aprendizaje del lenguaje de señas enfrenta tres barreras fundamentales:

1. **Acceso limitado a instructores presenciales.** La mayoría de personas interesadas en aprender señas no disponen de un tutor o intérprete con disponibilidad continua. Las clases formales suelen ser costosas, limitadas en horario y geográficamente restringidas.

2. **Ausencia de retroalimentación inmediata en la práctica autónoma.** Un estudiante que practica con imágenes estáticas o videos pregrabados no tiene forma de saber si está reproduciendo correctamente la forma de la mano. Sin corrección en tiempo real, los errores se consolidan como hábitos.

3. **Saturación cognitiva en plataformas existentes.** Muchas herramientas disponibles presentan demasiada información simultánea — listas extensas, interfaces recargadas, múltiples modos sin jerarquía clara — lo que genera fatiga y abandono, especialmente en usuarios principiantes o niños.

SignTutor aborda estas tres barreras simultáneamente: ofrece acceso permanente, retroalimentación visual inmediata mediante visión por computadora y una interfaz deliberadamente minimalista que prioriza la concentración y el aprendizaje progresivo.

### A quién va dirigida

La plataforma está orientada a cualquier persona hispanohablante que desee aprender el abecedario dactilológico, incluyendo principiantes absolutos, estudiantes en programas de inclusión, niños en etapa de alfabetización, docentes que buscan herramientas de apoyo y profesionales interesados en accesibilidad. No requiere conocimientos previos en lengua de señas ni en tecnología.

### Por qué sería útil

El alfabeto dactilológico es la puerta de entrada al lenguaje de señas y una habilidad práctica para la comunicación básica con personas sordas o con discapacidad auditiva. Una plataforma que permita aprender este abecedario de forma autónoma, con validación en tiempo real y sin fricción, democratiza el acceso a una competencia de alto valor social e inclusivo.

---

## 2. Objetivos del sistema

### Objetivo general

Desarrollar una plataforma web educativa que permita aprender el abecedario en lengua de señas mediante guía visual interactiva, práctica con cámara y retroalimentación en tiempo real, utilizando visión por computadora para evaluar la formación correcta de cada letra.

### Objetivos específicos

1. **Enseñar las 27 letras del abecedario** (A–Z + Ñ) en lengua de señas mexicana/española, presentando cada letra con su representación visual de referencia y descripción de formación.

2. **Proveer un sistema de práctica interactiva** que utilice la cámara del dispositivo para capturar el gesto del usuario y compararlo con el patrón esperado de cada letra.

3. **Implementar retroalimentación inmediata** que indique al estudiante si su gesto es correcto, parcialmente correcto o incorrecto, con indicaciones específicas de corrección.

4. **Registrar y visualizar el progreso** del estudiante a lo largo del abecedario, mostrando letras dominadas, en progreso y pendientes.

5. **Garantizar una experiencia de usuario limpia y enfocada**, libre de saturación visual, donde cada pantalla tenga un propósito único y claro.

6. **Construir una arquitectura técnica escalable** que permita extender la plataforma hacia palabras, frases, nuevas lenguas de señas y modelos de reconocimiento más sofisticados.

### Beneficios para el usuario

| Beneficio | Descripción |
|-----------|-------------|
| **Autonomía** | Aprender sin depender de un instructor presencial |
| **Retroalimentación inmediata** | Saber al instante si el gesto es correcto |
| **Ritmo propio** | Avanzar según la velocidad de aprendizaje personal |
| **Acceso permanente** | Disponible 24/7 desde cualquier navegador con cámara |
| **Progreso visible** | Motivación a través de indicadores claros de avance |
| **Inclusión** | Contribuir a reducir la barrera comunicativa con personas sordas |

### Alcance inicial del proyecto

El MVP cubre exclusivamente el abecedario dactilológico (letras estáticas de la A a la Z, más la Ñ). No incluye palabras compuestas, frases, señas dinámicas complejas ni interpretación de lengua de señas en contexto conversacional.

### Posibles extensiones futuras

- Módulo de números (0–9)
- Módulo de palabras y frases básicas
- Soporte para múltiples lenguas de señas (LSM, LSE, ASL)
- Modo de desafío con tiempo limitado
- Sistema de logros y gamificación
- Perfil de docente con vista de progreso grupal
- Aplicación móvil nativa (PWA o React Native)
- Modelo de ML entrenado específicamente para el abecedario con mayor precisión

---

## 3. Perfil de usuario objetivo

### 3.1 Principiantes absolutos

Personas sin conocimiento previo en lengua de señas que desean aprender el abecedario como primer acercamiento. Requieren instrucciones claras, ritmo pausado y retroalimentación paciente. Son el usuario principal de la plataforma.

### 3.2 Estudiantes en formación

Alumnos de programas académicos relacionados con educación especial, trabajo social, psicología, pedagogía o lingüística que necesitan una herramienta de práctica complementaria. Valoran la sistematización del progreso y la posibilidad de repasar letras específicas.

### 3.3 Niños y adolescentes (8–17 años)

Usuarios jóvenes en etapa de alfabetización o con interés en lenguaje de señas. Requieren una interfaz especialmente simple, con elementos visuales atractivos pero no distractores, y refuerzos positivos inmediatos. La usabilidad debe contemplar capacidades motoras y atencionales propias de la edad.

### 3.4 Adultos interesados en inclusión

Profesionales, familiares de personas sordas o ciudadanos sensibilizados que desean adquirir una competencia comunicativa básica. Buscan eficiencia, claridad y respeto por su tiempo. Prefieren interfaces limpias y profesionales.

### 3.5 Docentes y facilitadores

Educadores que podrían utilizar la plataforma como herramienta de aula, ya sea proyectando la guía visual o asignando prácticas a sus alumnos. En extensiones futuras, se beneficiarían de un panel de monitoreo grupal.

### Matriz de necesidades por perfil

| Perfil | Necesidad principal | Funcionalidad clave |
|--------|-------------------|-------------------|
| Principiante | Claridad y guía paso a paso | Modo aprendizaje con referencia visual |
| Estudiante | Práctica repetible con métricas | Modo práctica con historial |
| Niño/Adolescente | Simplicidad y refuerzo positivo | Interfaz limpia, animaciones de éxito |
| Adulto | Eficiencia y acceso rápido | Navegación directa por letras |
| Docente | Herramienta didáctica | Vista de guía y posible panel grupal |

---

## 4. Funcionalidades principales

### 4.1 Módulo de aprendizaje del abecedario

El módulo central de la plataforma presenta las 27 letras del abecedario dactilológico de forma secuencial o selectiva. Cada letra constituye una unidad de aprendizaje independiente que incluye:

- **Nombre de la letra** en texto prominente
- **Imagen o ilustración de referencia** mostrando la posición correcta de la mano
- **Descripción textual breve** de cómo formar la seña (qué dedos extender, cuáles cerrar, orientación de la palma)
- **Indicador de dificultad** (baja, media, alta) basado en la complejidad del gesto

El estudiante puede recorrer las letras en orden secuencial o acceder directamente a cualquier letra desde el selector alfabético.

### 4.2 Visualización de cada letra en lengua de señas

Cada letra se presenta mediante una referencia visual de alta calidad:

- **Imagen vectorial o fotografía** de la mano formando la seña, vista desde la perspectiva del observador
- **Imagen espejada** (opcional) para que el usuario pueda imitar directamente lo que ve
- **Animación suave de transición** al cambiar entre letras
- **Overlay con puntos clave** señalando las articulaciones relevantes (opcional, activable)

La visualización ocupa una posición prominente y constante en la interfaz, sirviendo como referencia permanente mientras el usuario practica.

### 4.3 Guía visual simultánea durante la práctica

Durante el modo práctica, la pantalla se divide en dos zonas claramente diferenciadas:

- **Zona de referencia:** muestra la seña objetivo (imagen estática o miniatura flotante tipo picture-in-picture)
- **Zona de cámara:** muestra el feed en vivo de la cámara del usuario con overlay de landmarks

Esta disposición permite al estudiante comparar visualmente su gesto con la referencia sin necesidad de alternar entre pantallas.

### 4.4 Captura por cámara del gesto del usuario

La plataforma solicita acceso a la cámara del dispositivo y muestra el video en vivo en la zona de práctica. El sistema:

- Detecta la presencia de una mano en el encuadre
- Superpone los landmarks (puntos clave de la mano) sobre el video
- Indica visualmente cuando la mano está correctamente posicionada dentro del área de detección
- Proporciona indicaciones si la mano no es visible o está fuera del encuadre

### 4.5 Comparación entre gesto esperado y gesto realizado

El motor de evaluación compara el patrón de landmarks detectado con el patrón esperado para la letra objetivo:

- **Evaluación de dedos:** verifica qué dedos están extendidos y cuáles flexionados
- **Evaluación de posición relativa:** comprueba ángulos y distancias entre articulaciones clave
- **Puntuación de coincidencia:** calcula un porcentaje (0–100%) de similitud con la seña esperada
- **Umbral de aprobación:** el gesto se considera correcto cuando supera un umbral configurable (por defecto 80%)

### 4.6 Retroalimentación inmediata

El sistema proporciona retroalimentación visual y textual en tiempo real:

| Estado | Indicador visual | Mensaje |
|--------|-----------------|---------|
| Sin mano detectada | Marco gris | "Coloca tu mano frente a la cámara" |
| Mano detectada, gesto incorrecto | Marco naranja pulsante | "Ajusta: extiende el índice" (específico) |
| Gesto parcialmente correcto | Marco amarillo | "Casi, corrige la posición del pulgar" |
| Gesto correcto, manteniendo | Marco verde con progreso | "Mantén la postura..." |
| Gesto completado | Animación de éxito | "¡Correcto! Letra X dominada" |

La retroalimentación incluye **correcciones específicas por dedo** cuando el gesto no coincide, indicando exactamente qué dedo extender o flexionar.

### 4.7 Indicadores de avance y progreso

La plataforma mantiene un registro del progreso del estudiante:

- **Mapa del abecedario:** grilla visual de A–Z+Ñ donde cada letra muestra su estado (pendiente, en progreso, dominada)
- **Porcentaje global de avance:** progreso total del abecedario
- **Conteo de intentos por letra:** cuántas veces se ha practicado cada letra
- **Mejor puntuación por letra:** la máxima coincidencia alcanzada
- **Racha de aciertos:** indicador motivacional de letras consecutivas correctas

### 4.8 Navegación por letras

El usuario puede navegar entre letras de tres formas:

1. **Secuencial:** botones "Anterior" y "Siguiente" para recorrer en orden
2. **Selector directo:** grilla alfabética clicable para saltar a cualquier letra
3. **Auto-avance:** tras completar exitosamente una letra, la plataforma avanza automáticamente a la siguiente (configurable)

### 4.9 Modo Aprendizaje

Modo enfocado en la enseñanza, sin evaluación activa:

- Muestra la referencia visual en tamaño completo
- Presenta la descripción textual de formación
- La cámara está disponible como espejo pero no evalúa
- El estudiante puede observar, leer y practicar sin presión

### 4.10 Modo Práctica

Modo enfocado en la evaluación con retroalimentación:

- Activa el motor de reconocimiento gestual
- Muestra la referencia en miniatura (PiP)
- Evalúa el gesto en tiempo real con puntuación
- Proporciona retroalimentación correctiva
- Registra el resultado en el progreso del usuario
- Al completar exitosamente, muestra animación de éxito

### 4.11 Modo Evaluación (Quiz)

Modo de autoevaluación donde el sistema presenta letras al azar:

- No muestra la referencia visual (solo el nombre de la letra)
- El usuario debe formar la seña de memoria
- El sistema evalúa y registra acierto o fallo
- Al finalizar la ronda, muestra un resumen de resultados
- Útil para reforzar la memorización una vez aprendido el gesto

### 4.12 Sistema de ayuda e instrucciones

- **Onboarding inicial:** guía de 3–4 pasos la primera vez que el usuario entra, explicando cómo usar la plataforma
- **Tooltips contextuales:** ayudas breves en botones y elementos clave
- **Botón de ayuda:** accesible desde cualquier pantalla, con instrucciones resumidas
- **Indicaciones de cámara:** si la cámara no detecta mano, sugiere posición y distancia

### 4.13 Funcionalidades opcionales

- **Sonido:** efecto sutil al completar correctamente una letra (desactivable)
- **Texto de apoyo:** descripción verbal de la formación de cada seña
- **Animaciones suaves:** transiciones entre letras, microanimaciones de éxito
- **Historial de aciertos:** registro temporal de prácticas con fecha y resultado
- **Modo oscuro:** alternativa visual para sesiones nocturnas o preferencia personal

---

## 5. Propuesta UX/UI

### 5.1 Estilo visual recomendado

El sistema visual de SignTutor debe comunicar **calma, claridad y profesionalismo educativo**. Se recomienda un estilo que combine:

- **Minimalismo funcional:** cada elemento en pantalla debe justificar su presencia. Si no aporta al aprendizaje o la navegación, se elimina.
- **Diseño editorial:** uso de jerarquía tipográfica clara, espaciado generoso y composición equilibrada, similar a una publicación educativa bien diseñada.
- **Calidez contenida:** no tan frío como una aplicación empresarial, pero lejos de la estridencia de una plataforma gamificada. Tonos suaves con acentos de color intencionales.
- **Consistencia:** un solo lenguaje visual en toda la plataforma, sin variaciones de estilo entre pantallas.

### 5.2 Distribución ideal de pantalla

La distribución principal durante la práctica sigue un modelo de **dos zonas diferenciadas con jerarquía clara:**

```
┌────────────────────────────────────────────────────────┐
│  Header mínimo: Logo + Progreso + Configuración        │
├──────────────────────────┬─────────────────────────────┤
│                          │                             │
│   ZONA DE REFERENCIA     │     ZONA DE CÁMARA          │
│                          │                             │
│   Letra actual (grande)  │     Feed en vivo            │
│   Imagen de la seña      │     Landmarks superpuestos  │
│   Descripción breve      │     Estado de evaluación    │
│                          │                             │
├──────────────────────────┴─────────────────────────────┤
│  Barra inferior: Navegación ← → + Selector de letra   │
└────────────────────────────────────────────────────────┘
```

En dispositivos móviles, las zonas se apilan verticalmente: referencia arriba, cámara abajo.

**Ratio de espacio sugerido:**
- Referencia: 40% del ancho
- Cámara: 60% del ancho
- Header: máximo 56px de alto
- Barra inferior: máximo 64px de alto
- Área de contenido útil: al menos 80% de la altura de viewport

### 5.3 Jerarquía visual

La jerarquía de atención debe seguir este orden estricto:

1. **Feed de cámara** (zona activa principal durante práctica)
2. **Imagen de referencia de la seña** (guía visual constante)
3. **Retroalimentación** (mensajes de corrección o éxito)
4. **Letra actual** (identificador de contexto)
5. **Progreso** (información secundaria de motivación)
6. **Navegación** (acciones de desplazamiento)
7. **Configuración y ayuda** (funciones terciarias)

Los elementos de menor prioridad deben ser visualmente más sutiles (tamaño menor, color neutro, posición periférica).

### 5.4 Paleta de colores sugerida

Se propone una paleta basada en tonos neutros con acentos funcionales:

| Uso | Color | Código | Justificación |
|-----|-------|--------|---------------|
| **Fondo principal** | Blanco cálido | `#FAFAF9` | Reduce fatiga visual vs blanco puro |
| **Fondo de tarjetas** | Blanco | `#FFFFFF` | Diferenciación de capas |
| **Texto principal** | Gris oscuro | `#1C1917` | Alto contraste sin dureza del negro |
| **Texto secundario** | Gris medio | `#78716C` | Jerarquía visual para texto de apoyo |
| **Acento primario** | Índigo | `#4F46E5` | Confianza, profesionalismo educativo |
| **Éxito** | Verde esmeralda | `#059669` | Retroalimentación positiva |
| **Advertencia** | Ámbar | `#D97706` | Gesto parcialmente correcto |
| **Error** | Rojo suave | `#DC2626` | Gesto incorrecto (uso moderado) |
| **Superficies elevadas** | Sombra sutil | `0 1px 3px rgba(0,0,0,0.08)` | Profundidad mínima |

**Modo oscuro:**

| Uso | Color | Código |
|-----|-------|--------|
| Fondo principal | Gris muy oscuro | `#0C0A09` |
| Fondo de tarjetas | Gris oscuro | `#1C1917` |
| Texto principal | Gris claro | `#E7E5E4` |
| Acento primario | Índigo claro | `#818CF8` |

### 5.5 Tipografía

Se recomienda mantener **Inter** como tipografía principal, ya que es la fuente actualmente en uso y cumple con los criterios requeridos:

- **Familia:** Inter (Google Fonts, licencia abierta)
- **Pesos utilizados:** 400 (cuerpo), 500 (énfasis suave), 600 (subtítulos), 700 (títulos)
- **Escala tipográfica:**

| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| Letra actual | 72px / 4.5rem | 800 | Identificador de la letra en modo aprendizaje |
| Título de sección | 24px / 1.5rem | 700 | Encabezados de pantalla |
| Subtítulo | 18px / 1.125rem | 600 | Nombres de sección |
| Cuerpo | 16px / 1rem | 400 | Texto de instrucciones |
| Etiqueta | 13px / 0.8125rem | 500 | Badges, indicadores |
| Feedback | 14px / 0.875rem | 500 | Mensajes de retroalimentación |

- **Interlineado:** 1.5 para cuerpo, 1.2 para títulos
- **Máximo de caracteres por línea:** 65ch para bloques de texto

### 5.6 Uso del espacio en blanco

El espacio en blanco es un elemento de diseño activo, no un vacío. Se aplican los siguientes principios:

- **Margen externo del contenido:** 24–32px en desktop, 16px en móvil
- **Separación entre tarjetas:** 16–20px
- **Padding interno de tarjetas:** 24px
- **Separación entre la zona de referencia y la de cámara:** 24px
- **Espacio alrededor de la retroalimentación:** 16px mínimo, aislando visualmente el mensaje
- **Sin bordes gruesos ni separadores visibles:** el espacio y la sombra sutil cumplen la función de delimitación

**Regla heurística:** si dos elementos se perciben como "apretados", se aumenta el espacio. El espacio excesivo en una plataforma educativa es preferible a la saturación.

### 5.7 Cómo evitar la saturación visual

1. **Una acción principal por pantalla.** La pantalla de aprendizaje enseña. La de práctica evalúa. No se mezclan flujos.
2. **Revelación progresiva.** La información secundaria (historial, configuración, detalles de progreso) solo aparece cuando el usuario la solicita.
3. **Máximo 3 colores activos por pantalla.** El fondo neutro, el acento funcional del estado actual y el texto.
4. **Iconografía mínima.** Se usan íconos solo donde el texto solo no basta (navegación, estados). Se evitan íconos decorativos.
5. **Sin animaciones gratuitas.** Las animaciones existen solo para comunicar estado (transición de letra, éxito, loading). Duración: 200–350ms.
6. **Tipografía como estructura.** El tamaño y peso de la letra comunica jerarquía; no se necesitan bordes, fondos de color ni separadores para distinguir secciones.

### 5.8 Presentación simultánea de la seña objetivo y el intento del usuario

Esta es la decisión de diseño más crítica de la plataforma. Se proponen dos modelos según el modo:

**Modo Aprendizaje (sin evaluación activa):**

```
┌──────────────────────────────────────────┐
│                                          │
│          REFERENCIA (grande)             │
│     Imagen de la seña + descripción      │
│                                          │
├──────────────────────────────────────────┤
│   Cámara como espejo (opcional)          │
│   Sin overlay de evaluación              │
└──────────────────────────────────────────┘
```

La referencia domina la pantalla. La cámara es secundaria y funciona como espejo.

**Modo Práctica (con evaluación):**

```
┌──────────────────────────────────────────┐
│ ┌──────────┐                             │
│ │Referencia│    CÁMARA (dominante)       │
│ │  (PiP)   │    Feed + landmarks         │
│ │  120x120 │    + feedback overlay        │
│ └──────────┘                             │
│            ┌──────────────────────┐      │
│            │ Barra de progreso    │      │
│            │ "Mantén la postura"  │      │
│            └──────────────────────┘      │
└──────────────────────────────────────────┘
```

La cámara domina. La referencia es un recuadro flotante (Picture-in-Picture) que el usuario puede consultar sin perder de vista su propia mano.

### 5.9 Organización de botones, navegación y retroalimentación

- **Navegación entre letras:** barra inferior fija con botones "Anterior" / "Siguiente" y un indicador central de la letra actual (ej: "H — 8 de 27")
- **Selector de letras:** accesible desde un botón en la barra inferior que despliega un panel compacto con la grilla A–Z+Ñ
- **Botones de acción principal:** máximo uno por contexto, siempre con acento primario (índigo)
- **Retroalimentación:** superpuesta sobre la zona de cámara como barra semitransparente, sin bloquear la vista del gesto

**Jerarquía de botones:**

| Tipo | Estilo | Uso |
|------|--------|-----|
| Primario | Fondo índigo, texto blanco | Acción principal: "Iniciar práctica", "Siguiente" |
| Secundario | Borde sutil, fondo transparente | Acciones complementarias: "Anterior", "Seleccionar letra" |
| Fantasma | Solo texto, sin borde | Acciones terciarias: "Ayuda", "Configuración" |

### 5.10 Recomendaciones de accesibilidad visual y cognitiva

1. **Contraste mínimo WCAG AA:** ratio 4.5:1 para texto normal, 3:1 para texto grande. Verificar con la paleta propuesta.
2. **Tamaño mínimo de objetivo táctil:** 44×44px para todos los botones y elementos interactivos.
3. **No depender solo del color:** la retroalimentación incluye siempre texto e ícono además del color (ej: check verde + "Correcto" + ícono ✓).
4. **Navegación por teclado:** todos los elementos interactivos deben ser alcanzables con Tab y activables con Enter/Space.
5. **Etiquetas ARIA:** video, canvas y overlays deben tener atributos `aria-label` descriptivos.
6. **Preferencia de movimiento reducido:** respetar `prefers-reduced-motion` desactivando animaciones para usuarios que lo configuren.
7. **Texto alternativo:** todas las imágenes de referencia de señas deben tener `alt` descriptivo (ej: "Letra A en lengua de señas: puño cerrado con pulgar al lado").
8. **Simplicidad cognitiva:** instrucciones en lenguaje sencillo, oraciones cortas, sin jerga técnica en la interfaz.

---

## 6. Estructura de pantallas

### 6.1 Pantalla de Bienvenida (Landing)

**Propósito:** primera impresión del usuario. Comunicar el valor de la plataforma e invitar a comenzar.

**Elementos visuales:**
- Logo de SignTutor
- Titular: "Aprende el abecedario en lengua de señas"
- Subtítulo breve: "Practica con tu cámara y recibe retroalimentación en tiempo real"
- Ilustración o animación sutil de una mano formando una letra
- Botón primario: "Comenzar ahora" (no requiere registro)
- Enlace secundario: "Iniciar sesión" (para usuarios registrados)

**Interacciones:**
- Clic en "Comenzar ahora" → lleva directamente al módulo de aprendizaje
- Clic en "Iniciar sesión" → abre modal de login
- Scroll opcional → muestra brevemente 3 beneficios clave (aprender, practicar, evaluar)

**Lo que ve el usuario:** una pantalla limpia que en menos de 5 segundos comunica qué hace la plataforma y cómo empezar.

### 6.2 Pantalla de Aprendizaje de una Letra

**Propósito:** enseñar la formación correcta de una letra específica.

**Elementos visuales:**
- Letra actual en tamaño prominente (ej: "A")
- Imagen de referencia de la seña (tamaño mediano-grande, centrada)
- Descripción textual breve: "Cierra el puño con el pulgar extendido al lado"
- Indicador de posición: "1 de 27"
- Indicador de dificultad: badge "Fácil" / "Media" / "Difícil"
- Botón "Practicar esta letra" (primario)
- Navegación: ← Anterior | Siguiente →
- Acceso al selector de letras

**Interacciones:**
- Navegar entre letras con botones o selector
- Iniciar práctica de la letra actual
- Volver a la vista general del abecedario

**Lo que ve el usuario:** una ficha didáctica de la letra, clara y enfocada, con toda la información necesaria para entender cómo formar la seña antes de practicarla.

### 6.3 Pantalla de Práctica con Cámara

**Propósito:** evaluar en tiempo real el gesto del usuario para la letra seleccionada.

**Elementos visuales:**
- Feed de cámara en vivo (área dominante, ~70% de la pantalla)
- Landmarks de la mano superpuestos sobre el video
- Referencia de la seña en PiP (esquina superior izquierda, 100–140px)
- Letra objetivo en badge superior
- Barra de progreso de coincidencia (0–100%)
- Mensaje de retroalimentación en barra inferior semitransparente
- Indicador de estado (tracking / éxito / error) con color e ícono
- Botón "Salir" (esquina superior derecha)
- Botón "Saltar letra" (inferior)

**Interacciones:**
- El usuario coloca la mano frente a la cámara
- El sistema evalúa continuamente y actualiza score + feedback
- Al alcanzar el umbral durante el tiempo requerido → animación de éxito
- Tras éxito → opción de avanzar a la siguiente letra o repetir
- Botón de saltar si la letra resulta demasiado difícil

**Lo que ve el usuario:** su propia mano con overlay de tracking, una referencia consultable en miniatura, y mensajes claros sobre qué corregir o si va bien.

### 6.4 Pantalla de Selector del Abecedario

**Propósito:** permitir acceso directo a cualquier letra y visualizar el progreso global.

**Elementos visuales:**
- Grilla de 27 celdas (A–Z + Ñ), disposición 7×4
- Cada celda muestra: la letra, miniatura de la seña, estado con color
  - Gris: no intentada
  - Amarillo: intentada pero no dominada
  - Verde: dominada (score ≥ 80%)
- Barra de progreso global: "12 de 27 letras dominadas"
- Filtros opcionales: "Todas", "Pendientes", "Dominadas"

**Interacciones:**
- Clic en una letra → navega a la pantalla de aprendizaje de esa letra
- Vista rápida del progreso global
- Filtrar por estado de dominio

**Lo que ve el usuario:** un mapa visual completo de su avance en el abecedario.

### 6.5 Pantalla de Evaluación (Quiz)

**Propósito:** evaluar la retención del estudiante presentando letras sin referencia visual.

**Elementos visuales:**
- Letra objetivo en texto grande (sin imagen de referencia)
- Feed de cámara con evaluación activa
- Contador: "Pregunta 5 de 10"
- Temporizador opcional por letra (15 segundos)
- Indicador de aciertos/fallos en la ronda
- Al finalizar: resumen con letras acertadas y falladas

**Interacciones:**
- El sistema presenta una letra aleatoria (o las que necesitan refuerzo)
- El usuario forma la seña sin ver la referencia
- El sistema evalúa y registra acierto o fallo
- Tras cada letra (acierto o timeout) → avanza a la siguiente
- Al completar la ronda → muestra resumen

**Lo que ve el usuario:** un desafío limpio que prueba su memoria y habilidad sin ayudas visuales.

### 6.6 Pantalla de Progreso

**Propósito:** mostrar el avance acumulado del estudiante con detalle.

**Elementos visuales:**
- Grilla del abecedario con estados (igual que el selector, pero con más datos)
- Porcentaje global de dominio
- Letras más practicadas (top 5)
- Letras que necesitan más práctica (peor score)
- Racha actual de aciertos
- Gráfico sencillo de actividad reciente (últimos 7 días)
- Mejor score por letra (expandible)

**Interacciones:**
- Clic en una letra → ver detalle de intentos y scores
- Navegar directamente a practicar una letra débil

**Lo que ve el usuario:** un resumen motivador de su avance que también señala áreas de mejora.

### 6.7 Pantalla de Configuración

**Propósito:** ajustar preferencias de la plataforma.

**Elementos visuales:**
- Toggle de modo oscuro / claro
- Toggle de sonidos
- Toggle de auto-avance tras éxito
- Selector de mano dominante (izquierda / derecha)
- Selector de cámara (si hay múltiples)
- Tiempo de mantenimiento de pose (slider: 0.5s – 2s)
- Botón para reiniciar progreso
- Información de cuenta (si está registrado)

**Interacciones:**
- Cambiar cualquier preferencia con efecto inmediato
- Cerrar sesión
- Eliminar cuenta (con confirmación)

**Lo que ve el usuario:** opciones claras y pocas, sin abrumar con configuraciones técnicas.

---

## 7. Flujo del usuario

### Flujo principal: primera visita hasta completar una práctica

```
1. LLEGADA
   El usuario accede a la URL de SignTutor.
   → Ve la pantalla de bienvenida.

2. INICIO RÁPIDO
   Hace clic en "Comenzar ahora".
   → No requiere registro. Accede directamente al módulo.
   → (Opcionalmente se muestra un onboarding de 3 pasos la primera vez)

3. PRIMERA LETRA
   La plataforma presenta la letra "A" como punto de partida.
   → Ve la imagen de referencia, la descripción y el indicador de dificultad.
   → Lee cómo formar la seña.

4. EXPLORACIÓN OPCIONAL
   Puede navegar por otras letras con "Siguiente" / "Anterior" o abrir el selector.
   → Cada letra muestra su referencia completa.

5. DECISIÓN DE PRACTICAR
   Hace clic en "Practicar esta letra".
   → La plataforma solicita acceso a la cámara (primera vez).
   → Transición a la pantalla de práctica.

6. PRÁCTICA ACTIVA
   La cámara se activa. Ve su mano en pantalla.
   → El sistema detecta la mano y superpone landmarks.
   → La referencia de la seña aparece en PiP.
   → El usuario intenta replicar la seña.

7. RETROALIMENTACIÓN EN TIEMPO REAL
   El score se actualiza en la barra de progreso.
   → Si el gesto es incorrecto: mensaje específico ("extiende el índice").
   → Si es parcialmente correcto: "Casi, ajusta el pulgar".
   → Si es correcto: barra verde avanzando.

8. MANTENIMIENTO DE POSTURA
   El usuario mantiene la postura correcta durante el tiempo requerido.
   → La barra de progreso se llena completamente.

9. ÉXITO
   Animación de éxito: checkmark + "¡Correcto! Letra A dominada".
   → La letra se marca como dominada en el progreso.
   → Opción: "Siguiente letra" o "Repetir".

10. CONTINUACIÓN
    El usuario avanza a la letra "B" y repite el ciclo.
    → Puede volver al selector en cualquier momento.
    → Puede cerrar y continuar después (progreso guardado si tiene cuenta).
```

### Flujo alternativo: usuario registrado

```
1. Accede a SignTutor → Ve la landing.
2. Hace clic en "Iniciar sesión" → Ingresa credenciales.
3. Accede al módulo → Su progreso previo se carga automáticamente.
4. Ve el selector con letras dominadas en verde → Elige una letra pendiente.
5. Practica → El progreso se actualiza en su cuenta.
6. Accede a la pantalla de progreso → Ve su historial y estadísticas.
```

### Flujo alternativo: modo evaluación

```
1. El usuario accede al modo evaluación desde el menú o tras completar varias letras.
2. El sistema presenta 10 letras aleatorias (priorizando las menos dominadas).
3. Por cada letra: el nombre aparece sin referencia visual.
4. El usuario forma la seña → El sistema evalúa y registra.
5. Tras las 10 letras → Resumen: "8/10 correctas. Refuerza: F, Q".
6. Opción: "Practicar las fallidas" o "Nueva ronda".
```

---

## 8. Arquitectura del sistema

### Diagrama general de componentes

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTE (Navegador)                    │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Interfaz   │  │  Módulo de   │  │  Motor de            │ │
│  │  React/     │  │  Cámara      │  │  Reconocimiento      │ │
│  │  Next.js    │  │  (WebRTC)    │  │  (MediaPipe /        │ │
│  │             │  │              │  │   TensorFlow.js)     │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                │                      │             │
│         └────────────────┼──────────────────────┘             │
│                          │                                    │
│                    API REST / WebSocket                       │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     SERVIDOR (Backend)                         │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  API        │  │  Servicios   │  │  Módulo de           │ │
│  │  FastAPI    │  │  de negocio  │  │  Visión (opcional,   │ │
│  │  (REST +    │  │  (usuarios,  │  │  procesamiento       │ │
│  │   WS)       │  │   progreso,  │  │  server-side si      │ │
│  │             │  │   contenido) │  │  se requiere)        │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                │                      │             │
│         └────────────────┼──────────────────────┘             │
│                          │                                    │
│                    ORM / Query Layer                          │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    PERSISTENCIA                               │
│                                                               │
│  ┌─────────────────────┐  ┌────────────────────────────────┐ │
│  │  PostgreSQL         │  │  Almacenamiento de archivos    │ │
│  │  (usuarios,         │  │  (imágenes de referencia,      │ │
│  │   progreso,         │  │   assets estáticos)            │ │
│  │   contenido,        │  │  S3 / Cloudinary / local       │ │
│  │   métricas)         │  │                                │ │
│  └─────────────────────┘  └────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Decisión arquitectónica clave: procesamiento en cliente vs servidor

El sistema actual procesa la visión por computadora **en el servidor** (el backend captura la cámara local con OpenCV y transmite frames MJPEG al navegador). Este enfoque presenta limitaciones significativas para una plataforma web de alcance público:

1. **Latencia:** cada frame viaja del cliente al servidor y viceversa, introduciendo delay perceptible.
2. **Escalabilidad:** el servidor debe procesar video de cada usuario concurrente, consumiendo CPU/GPU proporcional al número de sesiones activas.
3. **Despliegue:** requiere que el servidor tenga acceso a una cámara local (solo funciona en localhost o con configuraciones especiales).

**La propuesta de rediseño mueve el procesamiento de visión al cliente.** MediaPipe y TensorFlow.js ejecutan directamente en el navegador del usuario, eliminando las tres limitaciones anteriores. El servidor se concentra en persistencia, autenticación y lógica de negocio.

### Componentes del sistema

**Frontend (Cliente):**
- Aplicación SPA (React / Next.js)
- Acceso a cámara vía WebRTC / getUserMedia
- Procesamiento de landmarks con MediaPipe Hands (WASM/WebGL, ejecución local)
- Lógica de evaluación de gestos (JavaScript, ejecución local)
- Comunicación con backend vía API REST para persistencia

**Backend (Servidor):**
- API REST con FastAPI (Python)
- Autenticación y autorización (JWT)
- CRUD de usuarios y perfiles
- Gestión de contenido (letras, referencias, descripciones)
- Registro y consulta de progreso
- Métricas de aprendizaje
- WebSocket opcional para funcionalidades en tiempo real futuras

**Base de datos:**
- PostgreSQL para datos estructurados
- Esquema relacional: usuarios, progreso por letra, sesiones de práctica, intentos

**Almacenamiento de assets:**
- Imágenes de referencia de señas
- Servidas como assets estáticos o desde CDN

**Seguridad:**
- HTTPS obligatorio
- JWT con expiración y refresh tokens
- Validación de inputs en servidor
- Rate limiting en endpoints de autenticación
- CORS configurado para dominios permitidos

**Escalabilidad:**
- El procesamiento pesado (visión) ocurre en el cliente: el servidor escala linealmente con usuarios para operaciones ligeras (CRUD, auth)
- PostgreSQL soporta concurrencia elevada con connection pooling
- La aplicación es stateless en el servidor, permitiendo escalado horizontal
- Assets estáticos servidos desde CDN

---

## 9. Recomendación tecnológica

### Frontend: Next.js (React)

**Justificación:**
- **React** es el framework con el ecosistema más amplio para construir interfaces declarativas y componentizadas. La comunidad, documentación y disponibilidad de talento son superiores a cualquier alternativa.
- **Next.js** añade rendering del lado del servidor (SSR), generación estática (SSG), enrutamiento basado en archivos y optimización de assets. Para una plataforma educativa con landing pública, el SEO del SSR es valioso.
- La integración con bibliotecas de visión por computadora en JavaScript (MediaPipe, TensorFlow.js) está bien documentada y probada.
- El sistema de componentes de React facilita la construcción de una interfaz modular: el feed de cámara, la referencia visual, la retroalimentación y la navegación son componentes reutilizables e independientes.

**Alternativas consideradas y descartadas:**
- *Vanilla JS (actual):* no escala en complejidad de interfaz, dificulta el manejo de estado y la reutilización de componentes.
- *Vue.js:* viable, pero con menor ecosistema para integración de ML en navegador.
- *Svelte:* excelente rendimiento, pero ecosistema aún inmaduro para proyectos con dependencias complejas de visión.

### Backend: FastAPI (Python) — continuidad con mejoras

**Justificación:**
- El proyecto actual ya utiliza **FastAPI**, y la base de código existente (modelos, servicios, módulo de visión) representa una inversión reutilizable.
- FastAPI ofrece rendimiento elevado (basado en Starlette + Uvicorn), tipado estricto con Pydantic, documentación automática (OpenAPI) y soporte nativo para WebSockets.
- Python es el lenguaje dominante en el ecosistema de machine learning y visión por computadora. Si en el futuro se requiere procesamiento server-side de gestos (modelos más complejos, entrenamiento, análisis batch), el backend ya está en el lenguaje adecuado.
- SQLAlchemy como ORM proporciona flexibilidad y madurez para consultas complejas.

**Alternativas consideradas:**
- *Node.js + Express/NestJS:* viable para el backend de persistencia, pero pierde la ventaja del ecosistema ML de Python si se necesita procesamiento server-side futuro.
- *Django:* más pesado y opinionado de lo necesario para una API REST pura.

**Mejora propuesta:** refactorizar el módulo de visión actual para que las reglas de evaluación de letras (abecedario dactilológico) se definan de forma declarativa (archivo JSON/YAML) en lugar de estar hardcodeadas en Python. Esto permite que la evaluación se ejecute tanto en el servidor como en el cliente con la misma fuente de verdad.

### Reconocimiento gestual: MediaPipe Hands (cliente) + TensorFlow.js (opcional)

**Justificación:**
- **MediaPipe Hands** detecta 21 landmarks por mano en tiempo real directamente en el navegador, utilizando WebGL/WASM sin necesidad de servidor. La latencia es de 10–30ms por frame en hardware moderno.
- Para el abecedario dactilológico (señas estáticas), la posición relativa de los 21 landmarks es suficiente para diferenciar cada letra mediante reglas geométricas o un clasificador ligero.
- **TensorFlow.js** se reserva como opción para entrenar o cargar un clasificador específico de las 27 letras del abecedario, mejorando la precisión respecto a reglas manuales. Un modelo de clasificación sobre los 21 landmarks (63 features: x,y,z por punto) es suficientemente pequeño para ejecutarse en el navegador.

**Estrategia en dos fases:**
1. **MVP:** reglas geométricas sobre landmarks de MediaPipe (extensión del sistema actual de `feature_extractor.py` + `evaluator.py`, portado a JavaScript).
2. **Post-MVP:** clasificador entrenado (Random Forest o red neuronal pequeña) sobre el vector de 63 features, cargado como modelo TensorFlow.js para mayor precisión.

### Base de datos: PostgreSQL

**Justificación:**
- Ya está configurada en el `docker-compose.yml` del proyecto actual.
- Modelo relacional adecuado para las entidades del dominio (usuarios, letras, progreso, intentos, sesiones).
- Soporte para JSON (JSONB) si se necesitan campos flexibles (landmarks, metadata de intentos).
- Escalabilidad probada, con extensiones como pg_stat para monitoreo de rendimiento.
- Migraciones gestionables con Alembic (ya declarado como dependencia).

**Alternativa considerada:**
- *MongoDB:* sería adecuado si el esquema fuera altamente variable, pero las entidades de este dominio tienen estructura predecible. PostgreSQL ofrece integridad referencial y consultas analíticas más robustas.

### Autenticación: JWT con refresh tokens

**Justificación:**
- El proyecto ya implementa JWT con PyJWT y passlib.
- JWT permite autenticación stateless, adecuada para un backend que debe escalar horizontalmente.
- Refresh tokens evitan la necesidad de reautenticación frecuente.
- El flujo de la plataforma permite uso sin registro (progreso en localStorage), con opción de crear cuenta para persistir el progreso en servidor.

**Alternativa considerada:**
- *Firebase Auth:* simplifica la implementación pero introduce dependencia de un servicio externo y dificulta la migración futura.

### Despliegue: contenedorizado con Docker, orquestado en la nube

**Justificación:**
- El proyecto ya tiene `Dockerfile` y `docker-compose.yml`.
- Contenedores garantizan reproducibilidad entre desarrollo y producción.
- Opciones de despliegue:
  - **Railway / Render / Fly.io:** para despliegue rápido con mínima configuración (adecuado para MVP).
  - **AWS ECS / GCP Cloud Run:** para escalado automático en producción.
  - **Vercel:** para el frontend Next.js específicamente, con edge functions.

**Propuesta para MVP:** Frontend en Vercel + Backend en Railway/Render + PostgreSQL gestionado (Railway o Supabase).

### Almacenamiento de assets: CDN + repositorio local

**Justificación:**
- Las imágenes de referencia del abecedario (27 imágenes) son un conjunto pequeño y estático. Pueden servirse como assets del frontend (carpeta `public/` de Next.js) sin necesidad de un servicio externo.
- Para extensiones futuras (videos, imágenes generadas por usuarios), se recomendaría Cloudinary o S3, pero no es necesario en el MVP.

### Resumen de stack propuesto

| Capa | Tecnología | Versión sugerida |
|------|-----------|-----------------|
| Frontend | Next.js (React) | 14+ (App Router) |
| Estilos | Tailwind CSS | 3.4+ |
| Reconocimiento | MediaPipe Hands | Latest (Web) |
| ML opcional | TensorFlow.js | 4+ |
| Backend | FastAPI (Python) | 0.110+ |
| ORM | SQLAlchemy | 2.0+ |
| Base de datos | PostgreSQL | 16 |
| Auth | JWT (PyJWT) | — |
| Contenedores | Docker + Compose | — |
| Frontend deploy | Vercel | — |
| Backend deploy | Railway / Render | — |

---

## 10. Diseño del backend

### 10.1 Responsabilidades del backend

El backend de SignTutor tiene un alcance bien delimitado. Al mover el procesamiento de visión al cliente, el servidor se concentra en cuatro dominios:

1. **Gestión de identidad:** registro, autenticación, autorización y gestión de perfiles de usuario.
2. **Gestión de contenido:** catálogo de letras con su metadata (imagen de referencia, descripción, dificultad, reglas de evaluación).
3. **Persistencia de progreso:** almacenar y consultar el avance del estudiante (intentos, scores, letras dominadas, sesiones).
4. **Analítica de aprendizaje:** métricas agregadas (tiempo promedio por letra, tasa de éxito, letras problemáticas, actividad reciente).

El backend **no** debe procesar video ni ejecutar reconocimiento gestual en tiempo real. Esta responsabilidad recae en el cliente.

### 10.2 Cómo recibe y procesa datos del frontend

**Comunicación principal: API REST (HTTP/JSON)**

El frontend envía solicitudes al backend para operaciones de persistencia:

```
POST /api/v2/auth/register          → Crear cuenta
POST /api/v2/auth/login             → Obtener JWT
GET  /api/v2/auth/me                → Perfil del usuario autenticado

GET  /api/v2/alphabet               → Catálogo completo de letras
GET  /api/v2/alphabet/{letter}      → Detalle de una letra (reglas, referencia)

POST /api/v2/progress/attempt       → Registrar un intento de práctica
GET  /api/v2/progress               → Progreso global del usuario
GET  /api/v2/progress/{letter}      → Progreso detallado por letra

GET  /api/v2/analytics/summary      → Resumen de métricas de aprendizaje
GET  /api/v2/analytics/activity     → Actividad reciente (últimos 7/30 días)
```

**Formato de un intento de práctica:**

```json
{
  "letter": "A",
  "score": 0.92,
  "duration_ms": 3400,
  "completed": true,
  "mode": "practice",
  "landmarks_snapshot": [[0.52, 0.31, 0.0], ...],
  "timestamp": "2026-04-06T14:30:00Z"
}
```

El backend valida el payload con Pydantic, registra el intento en la base de datos y actualiza las métricas acumuladas del usuario para esa letra.

**Comunicación opcional: WebSocket**

Para funcionalidades futuras como sesiones guiadas en tiempo real o notificaciones de logros, el backend puede exponer un endpoint WebSocket. No es necesario en el MVP.

### 10.3 Gestión de usuarios, progreso y resultados

**Modelo de datos:**

```
User
├── id (UUID)
├── email
├── name
├── password_hash
├── preferred_hand (LEFT | RIGHT)
├── settings (JSONB)
├── created_at
└── updated_at

LetterProgress
├── id (UUID)
├── user_id → User
├── letter (CHAR)
├── best_score (FLOAT)
├── attempt_count (INT)
├── completed (BOOL)
├── first_completed_at (TIMESTAMP | NULL)
├── last_practiced_at (TIMESTAMP)
└── updated_at

PracticeAttempt
├── id (UUID)
├── user_id → User
├── letter (CHAR)
├── score (FLOAT)
├── duration_ms (INT)
├── completed (BOOL)
├── mode (ENUM: learn | practice | quiz)
├── landmarks_snapshot (JSONB | NULL)
└── created_at

PracticeSession
├── id (UUID)
├── user_id → User
├── started_at (TIMESTAMP)
├── ended_at (TIMESTAMP | NULL)
├── letters_attempted (INT)
├── letters_completed (INT)
├── average_score (FLOAT)
└── mode (ENUM: practice | quiz)
```

**Lógica de actualización de progreso:**

Al recibir un `PracticeAttempt`, el servicio:

1. Inserta el registro en la tabla de intentos.
2. Actualiza `LetterProgress`: incrementa `attempt_count`, actualiza `best_score` si el nuevo score es mayor, marca `completed = true` si `score >= threshold` y no estaba completada, actualiza `last_practiced_at`.
3. Actualiza la sesión activa: incrementa contadores.
4. Retorna al frontend el estado actualizado de la letra.

### 10.4 Almacenamiento de métricas de aprendizaje

Las métricas se calculan a partir de los datos almacenados:

| Métrica | Fuente | Cálculo |
|---------|--------|---------|
| Progreso global (%) | `LetterProgress` | `COUNT(completed=true) / 27 * 100` |
| Letras dominadas | `LetterProgress` | `WHERE completed = true` |
| Letras débiles | `LetterProgress` | `ORDER BY best_score ASC LIMIT 5` |
| Tiempo promedio por letra | `PracticeAttempt` | `AVG(duration_ms) GROUP BY letter` |
| Tasa de éxito por letra | `PracticeAttempt` | `COUNT(completed=true) / COUNT(*) GROUP BY letter` |
| Actividad diaria | `PracticeAttempt` | `COUNT(*) GROUP BY DATE(created_at)` |
| Racha de aciertos | `PracticeAttempt` | Secuencia consecutiva de `completed=true` más reciente |

Para consultas frecuentes (progreso global, letras dominadas), se mantienen campos precalculados en `LetterProgress` que se actualizan atómicamente con cada intento. Para métricas analíticas complejas (tendencias, comparativas), se consultan los registros de `PracticeAttempt` bajo demanda.

### 10.5 Integración del módulo de reconocimiento gestual

**En la arquitectura propuesta, el reconocimiento se ejecuta en el cliente.** El backend participa de forma indirecta:

1. **Servir las reglas de evaluación:** el endpoint `GET /api/v2/alphabet/{letter}` retorna la regla de evaluación de la letra en formato JSON:

```json
{
  "letter": "A",
  "gesture_type": "STATIC",
  "finger_pattern": {
    "thumb": true,
    "index": false,
    "middle": false,
    "ring": false,
    "pinky": false
  },
  "hold_ms": 650,
  "threshold_success": 0.80,
  "description": "Cierra el puño con el pulgar extendido al lado",
  "reference_image": "/alphabet/a.webp",
  "difficulty": "easy"
}
```

2. **Recibir resultados:** el frontend envía el resultado de la evaluación (score, landmarks, duración) al backend para persistencia.

3. **Validación server-side (opcional):** para prevenir trampas o verificar integridad, el backend puede re-evaluar el snapshot de landmarks recibido contra la regla de la letra. Esto no es crítico para el MVP pero añade robustez.

### 10.6 Distribución de responsabilidades: cliente vs servidor

| Responsabilidad | Cliente | Servidor | Justificación |
|----------------|---------|----------|---------------|
| Captura de video | ✅ | ❌ | WebRTC nativo del navegador |
| Detección de landmarks | ✅ | ❌ | MediaPipe WASM, sin latencia de red |
| Evaluación del gesto | ✅ | ❌ (verificación opcional) | Latencia cero, UX fluida |
| Retroalimentación visual | ✅ | ❌ | Renderizado local inmediato |
| Autenticación | Envía credenciales | Valida y emite JWT | Seguridad en servidor |
| Registro de progreso | Envía intento | Persiste y calcula métricas | Fuente de verdad en servidor |
| Gestión de contenido | Consume API | Sirve catálogo | Contenido centralizado |
| Reglas de evaluación | Ejecuta reglas | Define y sirve reglas | Fuente de verdad de reglas en servidor, ejecución en cliente |

### 10.7 Procesamiento local vs nube vs híbrido

| Enfoque | Ventajas | Desventajas | Recomendación |
|---------|----------|-------------|---------------|
| **Local (cliente)** | Latencia cero, escala ilimitada (cada usuario usa su hardware), sin costo de cómputo en servidor, funciona offline | Precisión limitada al hardware del usuario, sin control de la calidad de procesamiento | **Recomendado para MVP y producción** |
| **Nube (servidor)** | Control total, posibilidad de modelos más pesados, auditoría completa | Latencia de red, costo de GPU proporcional a usuarios, complejidad de infraestructura | Solo si se requiere modelo pesado o validación estricta |
| **Híbrido** | Lo mejor de ambos: evaluación rápida local + verificación server-side | Complejidad de sincronización, duplicación de lógica | **Recomendado para versión post-MVP** con validación anti-fraude |

**Recomendación:** para el MVP, procesamiento completamente local. Post-MVP, esquema híbrido donde el cliente evalúa en tiempo real y el servidor verifica periódicamente los snapshots de landmarks para garantizar integridad y ajustar modelos.

### 10.8 Consideraciones de rendimiento, mantenimiento y escalabilidad

**Rendimiento:**
- El backend maneja exclusivamente operaciones de I/O (base de datos, auth). Con FastAPI asíncrono y connection pooling de SQLAlchemy, un solo proceso puede servir cientos de solicitudes concurrentes.
- Endpoints críticos (progreso, intentos) son operaciones simples de INSERT + UPDATE, completables en <50ms.
- El catálogo de letras (27 registros) se puede cachear en memoria (TTL 1h) para eliminar queries repetitivas.

**Mantenimiento:**
- Estructura modular por dominio (auth, content, progress, analytics) facilita la modificación independiente de cada área.
- Reglas de evaluación en formato declarativo (JSON) permiten agregar o ajustar letras sin modificar código.
- Tests automatizados (ya existentes en el proyecto) garantizan estabilidad ante cambios.
- Tipado estricto con Pydantic previene errores de integración frontend-backend.

**Escalabilidad:**
- **Vertical:** incrementar recursos del servidor único cubre las primeras miles de cuentas.
- **Horizontal:** al ser stateless, el backend se replica detrás de un load balancer sin cambios de código. La base de datos escala con read replicas si el volumen de lectura crece.
- **Progresión estimada:**
  - 1–1,000 usuarios: servidor único (Railway/Render tier básico)
  - 1,000–10,000 usuarios: servidor dedicado + PostgreSQL gestionado
  - 10,000+ usuarios: múltiples instancias + CDN + read replicas

---

## 11. Módulo de reconocimiento de señas

### 11.1 Pipeline de reconocimiento

El reconocimiento de una letra del abecedario dactilológico sigue un pipeline de cuatro etapas:

```
Captura → Detección → Extracción → Evaluación
(Cámara)  (Mano)     (Features)   (Comparación)
```

### 11.2 Etapa 1: Captura por cámara

- Se accede a la cámara mediante `navigator.mediaDevices.getUserMedia()`.
- Se configura resolución de 640×480 o 1280×720 según las capacidades del dispositivo.
- Se solicita una tasa de frames estable (30 fps ideal, 15 fps mínimo).
- El video se renderiza en un elemento `<video>` y se procesa frame por frame mediante `requestAnimationFrame`.
- Se aplica flip horizontal para efecto espejo (el usuario ve su mano como en un espejo).

### 11.3 Etapa 2: Detección de mano

**MediaPipe Hands** (ejecutado en el navegador):

- Recibe cada frame del video como input.
- Detecta la presencia de manos en la imagen (0, 1 o 2 manos).
- Para cada mano detectada, identifica 21 landmarks (puntos clave):
  - Muñeca (1 punto)
  - Pulgar (4 puntos: CMC, MCP, IP, TIP)
  - Índice (4 puntos: MCP, PIP, DIP, TIP)
  - Medio (4 puntos)
  - Anular (4 puntos)
  - Meñique (4 puntos)
- Cada landmark tiene coordenadas normalizadas (x, y, z) donde x,y están en [0,1] relativas al frame y z indica profundidad relativa a la muñeca.
- Determina la lateralidad (mano izquierda o derecha).

**Rendimiento esperado:** 20–40ms por frame en hardware moderno (GPU integrada). En dispositivos sin GPU, puede caer a 50–100ms, aún dentro de lo aceptable para retroalimentación en tiempo real.

### 11.4 Etapa 3: Extracción de características (features)

A partir de los 21 landmarks, se extraen features relevantes para la clasificación de letras:

**Features geométricas:**

1. **Estado de cada dedo (extendido/flexionado):**
   - Pulgar: comparación de posición horizontal del TIP vs IP vs MCP (varía según lateralidad).
   - Otros dedos: el TIP debe estar por encima (y menor) del PIP, que a su vez está por encima del MCP.
   
2. **Ángulos entre falanges:**
   - Ángulo de flexión de cada dedo (entre segmentos MCP-PIP y PIP-DIP).
   - Permite diferenciar dedos completamente extendidos de parcialmente flexionados.

3. **Distancias entre puntas de dedos:**
   - Distancia entre TIP del pulgar y TIP de cada dedo (relevante para letras como D, F, O donde dedos se tocan).
   - Distancia entre puntas adyacentes (separación de dedos).

4. **Orientación de la palma:**
   - Vector normal al plano formado por muñeca, base del índice y base del meñique.
   - Diferencia entre palma hacia la cámara vs dorso hacia la cámara.

5. **Posición relativa del pulgar:**
   - Frente a la palma (letras como T, S) vs al lado (A) vs extendido (L).

**Features temporales:**

6. **Estabilidad:** variación de posición de las puntas entre los últimos N frames. Baja variación indica pose estática mantenida.

7. **Historial de movimiento:** desplazamiento de la muñeca (relevante para futuras extensiones con señas dinámicas, no necesario para el abecedario estático).

**Vector de features resultante:** un arreglo de ~70–80 valores numéricos por frame que describe unívocamente la configuración de la mano.

### 11.5 Etapa 4: Evaluación y comparación

Se proponen tres enfoques de evaluación, de menor a mayor complejidad:

#### Enfoque A: Reglas geométricas (heurísticas)

**Descripción:** para cada letra se define una regla que especifica qué dedos deben estar extendidos o flexionados, y opcionalmente distancias o contactos entre dedos.

**Ejemplo para la letra "A":**

```json
{
  "letter": "A",
  "finger_pattern": {
    "thumb": true,
    "index": false,
    "middle": false,
    "ring": false,
    "pinky": false
  },
  "thumb_position": "beside_fist",
  "palm_orientation": "forward"
}
```

**Cálculo de score:**
- Se compara cada feature con la expectativa.
- Score = (coincidencias ponderadas) / (total ponderado).
- Umbral de aprobación: 80%.

**Ventajas:**
- Implementación simple y transparente.
- No requiere datos de entrenamiento.
- Completamente determinístico y depurable.
- Cada error es explicable ("extiende el pulgar").

**Limitaciones:**
- Dificultad para capturar variaciones naturales en la formación de la seña.
- Las reglas deben codificarse manualmente para cada letra.
- Letras con configuraciones similares (M/N, U/V) pueden confundirse.
- La orientación de la palma y el contacto entre dedos son difíciles de evaluar con landmarks 2D.

#### Enfoque B: Clasificador entrenado (Machine Learning)

**Descripción:** se entrena un modelo de clasificación supervisada sobre el vector de 63+ features (landmarks normalizados) para predecir la letra correspondiente.

**Opciones de modelo:**
- **k-Nearest Neighbors (kNN):** simple, interpretable, funcional con pocos datos.
- **Random Forest:** robusto, tolera features ruidosas, no requiere normalización.
- **Red neuronal pequeña (MLP):** 2–3 capas densas, <10K parámetros, exportable a TensorFlow.js.

**Dataset necesario:**
- 100–500 muestras por letra (frames de landmarks, no imágenes).
- Recopilable mediante la propia plataforma: modo de contribución donde usuarios etiquetan sus gestos.
- Datasets públicos disponibles: ASL Alphabet (adaptable), LSM datasets académicos.

**Pipeline de entrenamiento:**
1. Recopilar snapshots de landmarks etiquetados por letra.
2. Normalizar: centrar landmarks en la muñeca, escalar por tamaño de mano.
3. Entrenar clasificador (Python, sklearn/TensorFlow).
4. Exportar modelo a TensorFlow.js (formato JSON + pesos binarios).
5. Cargar en el navegador para inferencia local.

**Ventajas:**
- Mayor precisión con variaciones naturales del gesto.
- Diferencia mejor letras similares.
- Mejora con más datos (aprendizaje continuo).

**Limitaciones:**
- Requiere datos de entrenamiento anotados.
- El modelo es una caja negra: la retroalimentación específica ("extiende el índice") es más difícil de generar.
- Necesita pipeline de reentrenamiento y gestión de versiones del modelo.

#### Enfoque C: Híbrido (recomendado)

**Descripción:** combina reglas geométricas con un clasificador entrenado para obtener lo mejor de ambos enfoques.

**Funcionamiento:**
1. El clasificador ML predice la letra más probable y un score de confianza.
2. Si la confianza es alta (>90%), se acepta el resultado.
3. Si la confianza es media (60–90%), se refuerza con validación de reglas geométricas.
4. Las reglas geométricas se usan siempre para generar retroalimentación específica por dedo, independientemente del score del clasificador.

**Ventajas:**
- Precisión del ML + explicabilidad de las reglas.
- Retroalimentación específica incluso con modelo ML.
- Degradación graceful: si el modelo falla, las reglas son fallback.

### 11.6 Porcentaje de coincidencia y retroalimentación

El score final se presenta al usuario como porcentaje de coincidencia (0–100%):

| Rango | Indicador visual | Acción |
|-------|-----------------|--------|
| 0–30% | Rojo, sin progreso | "Mano detectada. Intenta formar la seña." |
| 30–60% | Naranja, progreso parcial | "Vas bien. Corrige: [dedo específico]." |
| 60–80% | Amarillo, casi correcto | "Casi perfecto. Ajusta ligeramente [detalle]." |
| 80–100% | Verde, manteniendo pose | "¡Correcto! Mantén la postura..." |
| 100% mantenido | Animación de éxito | "¡Letra dominada!" |

La retroalimentación siempre incluye una **corrección específica** cuando el score no alcanza el umbral, basada en el análisis de qué dedos difieren del patrón esperado.

---

## 12. Propuesta de rediseño completo

### 12.1 Diagnóstico de la estructura actual

La plataforma actual presenta las siguientes limitaciones para el propósito de enseñar el abecedario:

1. **Contenido genérico:** las señas actuales (Hola, Adiós, Gracias, etc.) son gestos dinámicos y complejos, no las 27 letras del abecedario. No existe un módulo específico de abecedario.

2. **Procesamiento en servidor:** la cámara se captura en el backend (OpenCV local) y se transmite por MJPEG stream. Esto limita la plataforma a ejecución local y no es viable para despliegue web público.

3. **Interfaz de dos columnas genérica:** el dashboard muestra un "tutor panel" con video guía de YouTube y un "camera panel" con lista de señas. Esta disposición no está optimizada para el flujo de aprendizaje de letras individuales.

4. **UI con elementos innecesarios:** el header incluye precisión global, botones de admin, badges de categoría y elementos que distraen del aprendizaje. La lista de señas ocupa espacio valioso sin aportar al flujo principal.

5. **Modo práctica modal:** la práctica se abre en un modal fullscreen que desconecta al usuario del contexto de aprendizaje.

6. **Sin navegación por abecedario:** no existe un selector alfabético, progreso por letra ni secuenciación pedagógica.

### 12.2 Qué eliminar

| Elemento | Razón de eliminación |
|----------|---------------------|
| Video guía de YouTube | Reemplazar por imagen estática de alta calidad de la seña |
| MJPEG stream desde backend | Reemplazar por cámara local (WebRTC) con procesamiento en navegador |
| Lista de "Señas Disponibles" en sidebar | Reemplazar por selector alfabético compacto |
| Badge de categoría | No aplica al abecedario (todas son "letra") |
| Panel de admin embebido | Separar en ruta independiente (/admin) |
| Precisión global en header | Mover a pantalla de progreso dedicada |
| Modal AR fullscreen para práctica | Integrar práctica en el flujo principal, no como modal desconectado |
| Login/Register como modals en la página principal | Mover a rutas dedicadas (/login, /register) o mantener como overlay solo al acceder a funciones que lo requieran |

### 12.3 Qué simplificar

| Elemento actual | Simplificación propuesta |
|----------------|------------------------|
| Header con múltiples botones | Header mínimo: logo + indicador de progreso + configuración (ícono) |
| Dos columnas permanentes | Layout adaptativo: una columna en aprendizaje, dos en práctica |
| Controles de cámara (activar + modo práctica) | Un solo botón: "Practicar" que activa cámara y evaluación |
| Overlay de feedback complejo | Barra de retroalimentación simple debajo de la cámara |
| Navegación prev/next + lista | Navegación unificada: prev/next + selector alfabético integrado |

### 12.4 Qué bloques reorganizar

**Nuevo layout por pantalla:**

**Pantalla de aprendizaje (una letra):**

```
┌──────────────────────────────────────┐
│ Logo    ● ● ● ● ● ... (progreso)  ⚙ │  ← Header (56px)
├──────────────────────────────────────┤
│                                      │
│              [Letra "A"]             │  ← Letra grande, centrada
│                                      │
│         ┌──────────────────┐         │
│         │                  │         │
│         │  Imagen de la    │         │  ← Referencia visual
│         │  seña (320px)    │         │
│         │                  │         │
│         └──────────────────┘         │
│                                      │
│  "Cierra el puño con el pulgar       │  ← Descripción
│   extendido al lado"                 │
│                                      │
│       [ Practicar esta letra ]       │  ← CTA primario
│                                      │
├──────────────────────────────────────┤
│  ← Anterior   B — 2 de 27  Sig. →   │  ← Navegación (64px)
└──────────────────────────────────────┘
```

**Pantalla de práctica (evaluación activa):**

```
┌──────────────────────────────────────┐
│ Logo    Letra: A          [Salir]    │  ← Header (56px)
├──────────────────────────────────────┤
│ ┌─────┐                             │
│ │ Ref │    ┌──────────────────────┐  │
│ │ PiP │    │                      │  │
│ │120px│    │  Feed de cámara      │  │  ← Zona activa
│ └─────┘    │  + landmarks         │  │
│            │                      │  │
│            └──────────────────────┘  │
│                                      │
│  ████████████░░░░ 72%                │  ← Barra de progreso
│  "Casi perfecto, flexiona el meñique"│  ← Feedback
│                                      │
├──────────────────────────────────────┤
│           [Saltar letra]             │  ← Acción secundaria
└──────────────────────────────────────┘
```

### 12.5 Cómo mejorar la concentración del estudiante

1. **Una tarea, una pantalla.** No mezclar aprendizaje con práctica con evaluación en la misma vista. Cada modo tiene su pantalla con su layout optimizado.

2. **Foco progresivo.** En aprendizaje: la referencia domina. En práctica: la cámara domina. La atención se dirige siempre al elemento relevante.

3. **Eliminación de distracciones periféricas.** Sin listas laterales, sin badges de categoría, sin métricas globales durante la práctica. Solo la letra actual y la retroalimentación.

4. **Transiciones suaves.** Cambiar de letra o de modo con una transición breve (fade 200ms) que evite saltos bruscos pero no retrase al usuario.

5. **Retroalimentación no invasiva.** El feedback aparece como texto en la zona inferior, no como popup ni modal que bloquee la vista de la cámara. La animación de éxito es breve (1.5s) y luego ofrece continuar.

### 12.6 Cómo hacer la interfaz más didáctica

1. **Nomenclatura clara.** "Aprender" / "Practicar" / "Evaluar" como los tres modos principales, con nombres que el usuario entiende sin explicación.

2. **Progreso visual constante.** Los puntos del abecedario en el header muestran en todo momento cuántas letras se han dominado, como breadcrumbs de progreso.

3. **Descripción accesible de cada seña.** No solo la imagen, sino un texto breve que explique la formación con vocabulario cotidiano ("cierra el puño", "extiende el índice y el medio").

4. **Refuerzo positivo calibrado.** Animación de éxito breve pero satisfactoria. No exagerar con confetti ni fanfarrias; un checkmark con pulso verde y el texto "¡Correcto!" es suficiente.

5. **Sugerencia de siguiente acción.** Tras completar una letra: "Siguiente: B →". Tras varias letras: "¿Quieres evaluar lo aprendido?". La plataforma guía sin imponer.

---

## 13. Requisitos funcionales y no funcionales

### 13.1 Requisitos funcionales

| ID | Requisito | Descripción | Prioridad |
|----|----------|-------------|-----------|
| RF-01 | Visualización del abecedario | El sistema debe presentar las 27 letras del abecedario dactilológico (A–Z + Ñ) con imagen de referencia y descripción textual. | Alta |
| RF-02 | Navegación por letras | El usuario debe poder navegar entre letras de forma secuencial (anterior/siguiente) y directa (selector alfabético). | Alta |
| RF-03 | Acceso a cámara | El sistema debe solicitar y gestionar acceso a la cámara del dispositivo para captura de video en tiempo real. | Alta |
| RF-04 | Detección de mano | El sistema debe detectar la presencia de una mano en el encuadre y superponer landmarks visibles sobre el video. | Alta |
| RF-05 | Evaluación del gesto | El sistema debe comparar la configuración detectada de la mano con el patrón esperado para la letra objetivo y calcular un porcentaje de coincidencia. | Alta |
| RF-06 | Retroalimentación inmediata | El sistema debe mostrar al usuario, en tiempo real, si su gesto es correcto, parcialmente correcto o incorrecto, con indicaciones específicas de corrección. | Alta |
| RF-07 | Registro de progreso | El sistema debe almacenar el progreso del usuario (letras intentadas, scores, letras dominadas) de forma persistente. | Alta |
| RF-08 | Modo Aprendizaje | El sistema debe ofrecer un modo donde el usuario observe la referencia y practique sin evaluación activa. | Media |
| RF-09 | Modo Práctica | El sistema debe ofrecer un modo con evaluación activa, retroalimentación y registro de resultado. | Alta |
| RF-10 | Modo Evaluación (Quiz) | El sistema debe ofrecer un modo donde se presentan letras sin referencia visual y el usuario debe formar la seña de memoria. | Media |
| RF-11 | Registro de usuarios | El sistema debe permitir crear cuentas con email y contraseña para persistir el progreso entre sesiones. | Media |
| RF-12 | Autenticación | El sistema debe validar credenciales y emitir tokens JWT para sesiones autenticadas. | Media |
| RF-13 | Uso sin registro | El sistema debe permitir practicar sin crear cuenta, almacenando progreso localmente en el navegador. | Alta |
| RF-14 | Visualización de progreso | El sistema debe presentar una pantalla de progreso con grilla del abecedario, porcentaje global, y métricas por letra. | Media |
| RF-15 | Configuración de preferencias | El sistema debe permitir configurar: mano dominante, modo oscuro/claro, sonidos, tiempo de mantenimiento de pose. | Baja |
| RF-16 | Onboarding inicial | El sistema debe mostrar una guía breve (3–4 pasos) la primera vez que el usuario accede. | Baja |
| RF-17 | Animación de éxito | El sistema debe mostrar una animación breve y satisfactoria al completar correctamente una letra. | Media |
| RF-18 | Auto-avance | El sistema debe permitir avanzar automáticamente a la siguiente letra tras completar exitosamente la actual (configurable). | Baja |

### 13.2 Requisitos no funcionales

| ID | Categoría | Requisito | Criterio de aceptación |
|----|-----------|----------|----------------------|
| RNF-01 | **Usabilidad** | La interfaz debe ser comprensible para un usuario sin experiencia técnica en menos de 30 segundos. | El usuario puede iniciar una práctica sin leer instrucciones. |
| RNF-02 | **Usabilidad** | La plataforma no debe presentar más de 3 elementos de interacción principales por pantalla. | Verificación visual de cada vista. |
| RNF-03 | **Rendimiento** | La detección de landmarks debe ejecutarse a un mínimo de 15 FPS en un equipo con GPU integrada (Intel UHD 630 o equivalente). | Medición con Performance API del navegador. |
| RNF-04 | **Rendimiento** | La latencia de retroalimentación (desde gesto hasta mensaje en pantalla) debe ser inferior a 200ms. | Medición end-to-end en condiciones normales. |
| RNF-05 | **Rendimiento** | Los endpoints del backend deben responder en menos de 200ms para operaciones de lectura y 500ms para escritura. | Pruebas de carga con herramienta tipo k6 o locust. |
| RNF-06 | **Seguridad** | Las contraseñas deben almacenarse hasheadas con bcrypt (costo mínimo 10). | Verificación en código y base de datos. |
| RNF-07 | **Seguridad** | La comunicación cliente-servidor debe ser exclusivamente HTTPS en producción. | Verificación de configuración de despliegue. |
| RNF-08 | **Seguridad** | Los tokens JWT deben expirar en un máximo de 24 horas con posibilidad de refresh. | Verificación de configuración de tokens. |
| RNF-09 | **Accesibilidad** | La plataforma debe cumplir WCAG 2.1 nivel AA en contraste de color, navegación por teclado y etiquetas ARIA. | Auditoría con axe-core o Lighthouse. |
| RNF-10 | **Accesibilidad** | Todos los elementos interactivos deben tener un tamaño mínimo de 44×44px. | Verificación en inspector del navegador. |
| RNF-11 | **Mantenibilidad** | El código frontend debe estar componentizado (React) con responsabilidades separadas. | Code review: cada componente <300 líneas. |
| RNF-12 | **Mantenibilidad** | Las reglas de evaluación de letras deben estar definidas en un archivo de configuración declarativo, no hardcodeadas. | Verificación de que añadir una letra no requiere modificar código de evaluación. |
| RNF-13 | **Escalabilidad** | El backend debe soportar al menos 100 usuarios concurrentes sin degradación perceptible. | Prueba de carga con 100 usuarios simulados. |
| RNF-14 | **Escalabilidad** | La arquitectura debe permitir escalado horizontal del backend sin cambios de código. | Verificación de statelessness del servidor. |
| RNF-15 | **Compatibilidad** | La plataforma debe funcionar en los navegadores Chrome, Firefox, Edge y Safari (versiones de los últimos 2 años). | Testing manual en cada navegador. |
| RNF-16 | **Compatibilidad** | La plataforma debe ser responsive y funcional en pantallas de 360px a 1920px de ancho. | Testing en breakpoints: 360, 768, 1024, 1440, 1920. |
| RNF-17 | **Disponibilidad** | La plataforma debe tener un uptime mínimo del 99% mensual. | Monitoreo con servicio tipo UptimeRobot. |
| RNF-18 | **Internacionalización** | Los textos de la interfaz deben estar centralizados para facilitar traducción futura. | Verificación de que no existen strings hardcodeados en componentes. |

---

## 14. Propuesta de MVP

### Definición del Producto Mínimo Viable

El MVP de SignTutor se enfoca en entregar el ciclo completo de aprendizaje del abecedario con la mínima complejidad funcional y técnica, demostrando el valor central de la plataforma.

### Funcionalidades incluidas en el MVP

| # | Funcionalidad | Alcance MVP |
|---|--------------|-------------|
| 1 | **Catálogo del abecedario** | 27 letras (A–Z + Ñ) con imagen de referencia estática y descripción textual. |
| 2 | **Navegación por letras** | Botones anterior/siguiente y selector directo (grilla A–Z). |
| 3 | **Modo Aprendizaje** | Vista de referencia (imagen + texto) sin evaluación. La cámara funciona como espejo. |
| 4 | **Modo Práctica** | Evaluación con cámara: landmarks, score, retroalimentación por dedo, animación de éxito. |
| 5 | **Detección de landmarks** | MediaPipe Hands ejecutado en el navegador. Sin servidor de visión. |
| 6 | **Evaluación por reglas** | Reglas geométricas para las 27 letras (finger_pattern + distancias básicas). Sin modelo ML. |
| 7 | **Progreso local** | Almacenamiento en `localStorage` del navegador. Sin registro de usuario. |
| 8 | **Mapa de progreso** | Grilla del abecedario con estado por letra (pendiente / dominada). |
| 9 | **Interfaz minimalista** | Layout limpio, responsive, con los dos modos (aprender / practicar). Sin admin, sin quiz, sin configuración avanzada. |
| 10 | **Landing mínima** | Titular + CTA "Comenzar". Sin scroll de marketing. |

### Funcionalidades excluidas del MVP

| Funcionalidad | Razón de exclusión |
|--------------|-------------------|
| Registro/login de usuarios | Complejidad de auth. El progreso local es suficiente para validar el concepto. |
| Modo Evaluación (Quiz) | Secundario al ciclo principal de aprender-practicar. |
| Panel de administración | No necesario sin gestión de usuarios. |
| Configuración avanzada | Valores por defecto bien calibrados son suficientes. |
| Modelo ML | Las reglas geométricas validan el concepto; ML se agrega post-MVP con datos reales. |
| Modo oscuro | Mejora estética, no funcional. Se agrega después. |
| Sonidos | Complemento sensorial, no crítico. |
| Analítica detallada | Las métricas básicas (letras dominadas / total) son suficientes. |

### Arquitectura del MVP

```
┌─────────────────────────────────┐
│  Frontend (Next.js)             │
│  - Páginas: Landing, Aprender,  │
│    Practicar, Progreso          │
│  - MediaPipe Hands (WASM)       │
│  - Evaluador JS (reglas)        │
│  - localStorage para progreso   │
│  - Assets estáticos (imágenes)  │
└─────────────────┬───────────────┘
                  │
                  │  (Sin backend en MVP v1,
                  │   solo assets estáticos)
                  │
                  ▼
┌─────────────────────────────────┐
│  Vercel (Hosting)               │
│  - Next.js SSR/SSG              │
│  - CDN para imágenes            │
└─────────────────────────────────┘
```

**Decisión clave para el MVP:** el backend no es estrictamente necesario si el progreso se almacena localmente y el catálogo de letras se define como datos estáticos en el frontend. Esto simplifica drásticamente el despliegue y elimina costos de servidor. El backend se introduce en la iteración siguiente cuando se añade registro de usuarios y persistencia centralizada.

### Criterios de éxito del MVP

1. Un usuario puede recorrer las 27 letras del abecedario con referencia visual.
2. Un usuario puede activar la cámara y practicar una letra con retroalimentación en tiempo real.
3. La evaluación diferencia correctamente al menos el 70% de las letras del abecedario (18/27).
4. El progreso se persiste entre sesiones (localStorage).
5. La interfaz es funcional en desktop (Chrome) y móvil (Chrome Android).
6. El tiempo de carga inicial es inferior a 3 segundos en conexión 4G.

---

## 15. Roadmap de desarrollo

### Fase 1: Análisis y Diseño (Semanas 1–2)

**Objetivos:**
- Documentar requisitos finales
- Diseñar wireframes de todas las pantallas
- Definir el esquema de datos del catálogo de letras
- Investigar y documentar las reglas de evaluación para las 27 letras
- Crear el design system (colores, tipografía, componentes base)

**Entregables:**
- Documento de requisitos validado
- Wireframes en baja/media fidelidad (Figma o similar)
- JSON schema del catálogo de letras con las 27 reglas de evaluación
- Design tokens definidos

**Equipo sugerido:** 1 diseñador UX/UI + 1 desarrollador (investigación técnica)

### Fase 2: Frontend Base (Semanas 3–5)

**Objetivos:**
- Inicializar proyecto Next.js con Tailwind CSS
- Implementar layout base (header, navegación, responsive)
- Crear componentes: LetterCard, AlphabetGrid, NavigationBar, ProgressDots
- Implementar pantalla de Landing
- Implementar pantalla de Aprendizaje (sin cámara)
- Implementar pantalla de Selector del Abecedario
- Cargar catálogo de letras con imágenes de referencia
- Implementar almacenamiento local de progreso (localStorage)

**Entregables:**
- Aplicación navegable con las 27 letras
- Referencia visual de cada letra accesible
- Progreso local funcional
- Responsive en desktop y móvil

**Equipo sugerido:** 1–2 desarrolladores frontend

### Fase 3: Backend Base (Semanas 4–6, en paralelo con Fase 2)

**Objetivos:**
- Refactorizar el backend FastAPI existente para el nuevo dominio (abecedario)
- Implementar modelos de datos: User, LetterProgress, PracticeAttempt
- Implementar endpoints de autenticación (register, login, me)
- Implementar endpoints de progreso (registrar intento, consultar progreso)
- Implementar endpoint de catálogo (servir letras con reglas)
- Configurar migraciones con Alembic
- Tests unitarios de servicios

**Entregables:**
- API REST documentada (OpenAPI/Swagger)
- Base de datos PostgreSQL con esquema aplicado
- Tests con cobertura >80% en servicios
- Docker compose funcional para desarrollo local

**Equipo sugerido:** 1 desarrollador backend

### Fase 4: Integración de Cámara y Reconocimiento (Semanas 6–9)

**Objetivos:**
- Integrar MediaPipe Hands en el frontend (WebRTC + WASM)
- Implementar el módulo de extracción de features en JavaScript
- Portar y ampliar las reglas de evaluación para las 27 letras
- Implementar el evaluador de gestos en JavaScript
- Crear la pantalla de Práctica con cámara
- Implementar overlay de landmarks sobre video
- Implementar barra de progreso de coincidencia
- Implementar retroalimentación textual y visual
- Implementar animación de éxito
- Integrar envío de resultados al backend (cuando hay cuenta)

**Entregables:**
- Práctica funcional con detección de mano y evaluación
- Retroalimentación en tiempo real para las 27 letras
- Integración frontend-backend para persistencia de progreso
- Performance >15 FPS en hardware de gama media

**Equipo sugerido:** 1–2 desarrolladores (fullstack con experiencia en visión por computadora)

### Fase 5: Pruebas y Mejoras (Semanas 9–11)

**Objetivos:**
- Testing de usabilidad con 5–10 usuarios reales
- Ajuste de umbrales de evaluación por letra según feedback
- Corrección de reglas que no evalúan correctamente
- Optimización de rendimiento (lazy loading de MediaPipe, code splitting)
- Testing cross-browser (Chrome, Firefox, Edge, Safari)
- Testing responsive (móvil, tablet, desktop)
- Auditoría de accesibilidad (Lighthouse, axe-core)
- Corrección de bugs reportados

**Entregables:**
- Reporte de testing de usabilidad con hallazgos y acciones
- Reglas de evaluación calibradas
- Performance audit: Lighthouse score >85
- Accessibility audit: WCAG AA compliance
- Lista de bugs cerrados

**Equipo sugerido:** 1 desarrollador + 1 QA / tester

### Fase 6: Despliegue (Semanas 11–12)

**Objetivos:**
- Configurar entorno de producción
- Desplegar frontend en Vercel
- Desplegar backend en Railway/Render
- Configurar PostgreSQL gestionado
- Configurar dominio personalizado y HTTPS
- Configurar monitoreo (uptime, errores)
- Configurar analytics básico (privacy-respecting)
- Documentar proceso de despliegue
- Lanzamiento controlado (beta privada → beta pública)

**Entregables:**
- Plataforma accesible en URL pública
- Pipeline de CI/CD configurado
- Documentación de operación
- Monitoreo activo

**Equipo sugerido:** 1 desarrollador (DevOps)

### Cronograma visual

```
Semana:  1   2   3   4   5   6   7   8   9   10  11  12
Fase 1:  ████████
Fase 2:          ████████████
Fase 3:              ████████████
Fase 4:                      ████████████████
Fase 5:                                  ████████████
Fase 6:                                          ████████
```

**Duración total estimada:** 12 semanas (3 meses)  
**Equipo mínimo:** 2 desarrolladores + 1 diseñador (parcial)  
**Equipo ideal:** 3 desarrolladores + 1 diseñador + 1 QA

---

## 16. Conclusión profesional

La propuesta presentada describe una plataforma educativa con un propósito claro, una arquitectura técnica coherente y una experiencia de usuario diseñada intencionalmente para el aprendizaje. SignTutor, en su versión enfocada al abecedario dactilológico, resuelve un problema real y accesible: permitir que cualquier persona aprenda las bases de la lengua de señas de forma autónoma, con retroalimentación inmediata y sin barreras de acceso.

### Viabilidad técnica

La solución propuesta se fundamenta en tecnologías maduras y probadas. MediaPipe Hands es una biblioteca mantenida activamente por Google con rendimiento demostrado en navegadores web. React/Next.js y FastAPI son frameworks con comunidades amplias, documentación extensa y trayectoria de estabilidad. La decisión de mover el procesamiento de visión al cliente elimina la principal limitación de la arquitectura actual y permite escalar a miles de usuarios sin costo proporcional de cómputo en servidor.

El enfoque incremental — reglas geométricas primero, clasificador ML después — reduce el riesgo técnico del MVP y establece una base sobre la cual iterar con datos reales de uso.

### Valor educativo

El abecedario dactilológico es la unidad mínima de enseñanza en lengua de señas. Su naturaleza estática (poses de mano sin movimiento) lo convierte en el candidato ideal para reconocimiento gestual automatizado, donde las tasas de precisión superan consistentemente el 85% con técnicas de landmarks. Esto significa que la retroalimentación del sistema es confiable y útil, no un ejercicio de frustración.

La interfaz minimalista no es una decisión estética sino pedagógica: la investigación en diseño instruccional establece que la carga cognitiva extrínseca (causada por una interfaz confusa) compite directamente con la carga cognitiva intrínseca (el contenido que se intenta aprender). Reducir la primera maximiza la segunda.

### Evolución futura

La arquitectura modular permite extender la plataforma de forma natural:

- **Corto plazo (3–6 meses post-MVP):** números, palabras básicas, registro de usuarios, modo quiz.
- **Medio plazo (6–12 meses):** modelo ML entrenado con datos de usuarios, soporte para múltiples lenguas de señas, perfil de docente.
- **Largo plazo (12+ meses):** señas dinámicas (movimiento), aplicación móvil, integración con plataformas educativas, certificación de competencia.

SignTutor tiene el potencial de convertirse en una herramienta de referencia para la enseñanza del lenguaje de señas en el ámbito hispanohablante, contribuyendo de forma concreta a la inclusión social y la accesibilidad comunicativa.

---

*Documento elaborado como base para la documentación formal del proyecto SignTutor.*  
*Versión 1.0 — Abril 2026*

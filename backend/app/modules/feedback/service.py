from __future__ import annotations


class FeedbackService:
    def build_message(self, status: str, score: float, detail: str | None = None) -> str:
        if detail:
            return detail
        if status == "success":
            return "Excelente, completa la seña con buena precisión."
        if status == "tracking":
            return f"Vas bien, precisión estimada {round(score * 100)}%."
        if status == "error":
            return "Ajusta la postura de la mano y repite el gesto."
        return "Coloca tu mano dentro del área de captura."

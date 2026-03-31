import time
from django.core.management.base import BaseCommand
from activities.models import Content, Level, Phase, Question
from activities.services.gemini_question_generator import (
    generate_level_questions,
    get_question_quantity,
)


class Command(BaseCommand):
    help = "Gera fases e questões automaticamente usando Gemini"

    def handle(self, *args, **kwargs):
        contents = Content.objects.all()
        levels = Level.objects.all()

        for content in contents:
            print(f"\nConteúdo: {content.name}")

            for level in levels:
                print(f"  Nível: {level.title}")

                phase_numbers_to_generate = []

                for phase_number in range(1, 21):
                    phase, _ = Phase.objects.get_or_create(
                        content=content,
                        level=level,
                        phase_number=phase_number
                    )

                    existing_questions = Question.objects.filter(
                        phase=phase
                    ).count()

                    expected_quantity = get_question_quantity(phase_number)

                    if existing_questions >= expected_quantity:
                        print(f"    Fase {phase_number} já possui questões")
                        continue

                    phase_numbers_to_generate.append(phase_number)

                if not phase_numbers_to_generate:
                    print("    Todas as fases deste nível já estão completas")
                    continue

                print(
                    f"    Gerando nível completo via Gemini "
                    f"(fases faltantes: {', '.join(map(str, phase_numbers_to_generate))})"
                )

                try:
                    phases_data = generate_level_questions(content.name, level.title)
                except Exception as err:
                    print(
                        f"    Erro ao gerar questões para {content.name} - {level.title}: {err}"
                    )
                    continue

                for phase_data in phases_data:
                    phase_number = phase_data["phase_number"]

                    if phase_number not in phase_numbers_to_generate:
                        continue

                    phase = Phase.objects.get(
                        content=content,
                        level=level,
                        phase_number=phase_number
                    )

                    Question.objects.filter(phase=phase).delete()

                    for index, question_data in enumerate(phase_data["questions"], start=1):
                        Question.objects.create(
                            phase=phase,
                            statement=question_data["statement"],
                            correct_answer=question_data["correct_answer"],
                            tip=question_data["tip"],
                            order=index
                        )

                    print(
                        f"    Fase {phase_number} preenchida com "
                        f"{len(phase_data['questions'])} questões"
                    )

                time.sleep(3)

        print("\n✔ Geração finalizada com sucesso")
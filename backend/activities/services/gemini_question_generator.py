import json
from django.conf import settings
from google import genai
from google.genai import types


client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = "gemini-3.1-flash-lite-preview"


LEVEL_SCHEMA = {
    "type": "ARRAY",
    "items": {
        "type": "OBJECT",
        "properties": {
            "phase_number": {"type": "INTEGER"},
            "questions": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "statement": {"type": "STRING"},
                        "correct_answer": {"type": "STRING"},
                        "tip": {"type": "STRING"},
                    },
                    "required": ["statement", "correct_answer", "tip"],
                },
            },
        },
        "required": ["phase_number", "questions"],
    },
}


def get_question_quantity(phase_number):
    if phase_number <= 5:
        return 5
    if phase_number <= 10:
        return 7
    return 10


def build_level_prompt(content, level):
    phase_rules = []
    for phase_number in range(1, 21):
        quantity = get_question_quantity(phase_number)
        phase_rules.append(f"- fase {phase_number}: {quantity} questões")

    phase_rules_text = "\n".join(phase_rules)

    return f"""
Gere questões de matemática para crianças.

Conteúdo: {content}
Dificuldade: {level}

Você deve gerar um nível completo com 20 fases.

Quantidade de questões por fase:
{phase_rules_text}

Formato obrigatório em JSON:
[
  {{
    "phase_number": 1,
    "questions": [
      {{
        "statement": "...",
        "correct_answer": "...",
        "tip": "..."
      }}
    ]
  }}
]

Regras gerais:
- perguntas curtas, claras e adequadas para crianças
- resposta objetiva
- dica simples e explicativa
- não escrever nada fora do JSON
- não repetir perguntas iguais
- evitar repetir o mesmo padrão de números muitas vezes
- variar bastante os valores numéricos
- evitar contas fáceis demais como 1+0, 1+1, 2+1, exceto raramente
- evitar que muitas questões da mesma fase tenham o mesmo resultado final
- dentro da mesma fase, variar contas e resultados
- manter a mesma dificuldade em todas as fases deste nível
- evitar criar questões "espelhadas" ou equivalentes entre si, como por exemplo:
  9+3, 9-3, 9*3 e 9/3
- se usar os mesmos números, não transformar isso em sequência previsível de operações

Regras por conteúdo:
- se o conteúdo for Adição, crie principalmente contas de soma e também enunciados curtos de adição
- se o conteúdo for Subtração, crie principalmente contas de subtração e também enunciados curtos de subtração
- se o conteúdo for Multiplicação, crie principalmente contas de multiplicação e também enunciados curtos de multiplicação
- se o conteúdo for Divisão, crie principalmente contas de divisão e também enunciados curtos de divisão
- se o conteúdo for Problemas, crie apenas enunciados contextualizados, sem contas soltas

Regras para enunciados:
- os enunciados devem combinar com o conteúdo pedido
- use situações simples do cotidiano infantil, como frutas, brinquedos, lápis, balas, figurinhas, livros
- os enunciados devem ser curtos e claros
- não repetir o mesmo contexto muitas vezes
- as respostas devem variar

Regras específicas para Problemas:
- criar apenas problemas em formato de texto
- conforme a dificuldade aumenta, pode envolver mais de uma etapa de raciocínio
- exemplo de estilo desejado:
  "João tinha 2 maçãs, ganhou mais 4 e depois comeu 3. Quantas sobraram?"
- mesmo nos problemas, manter linguagem simples e adequada para crianças

Regras específicas de dificuldade:
- se o conteúdo for Adição e a dificuldade for Nível 1, use principalmente números entre 2 e 20
- priorize contas como 9 + 2, 5 + 3, 7 + 6, 12 + 4
- não concentre todas as respostas no mesmo número
- distribua os resultados entre valores diferentes
"""


def validate_level_questions(phases_data):
    if len(phases_data) != 20:
        raise Exception(
            f"O Gemini retornou {len(phases_data)} fases, mas eram esperadas 20."
        )

    seen_phase_numbers = set()

    for phase_data in phases_data:
        phase_number = phase_data.get("phase_number")
        questions = phase_data.get("questions")

        if phase_number is None or questions is None:
            raise Exception("Uma ou mais fases vieram com campos faltando.")

        if phase_number in seen_phase_numbers:
            raise Exception(f"A fase {phase_number} veio duplicada.")

        seen_phase_numbers.add(phase_number)

        expected_quantity = get_question_quantity(phase_number)

        if len(questions) != expected_quantity:
            raise Exception(
                f"A fase {phase_number} retornou {len(questions)} questões, "
                f"mas eram esperadas {expected_quantity}."
            )

        for question in questions:
            if not all(key in question for key in ("statement", "correct_answer", "tip")):
                raise Exception(
                    f"A fase {phase_number} possui questão com campos faltando."
                )


def generate_level_questions(content, level):
    prompt = build_level_prompt(content, level)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=LEVEL_SCHEMA,
            temperature=0.7,
        ),
    )

    text = (response.text or "").strip()

    if not text:
        raise Exception("O Gemini retornou uma resposta vazia.")

    try:
        phases_data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise Exception(f"Resposta inválida do Gemini: {text}") from exc

    if not isinstance(phases_data, list):
        raise Exception("O Gemini não retornou uma lista de fases.")

    validate_level_questions(phases_data)

    return phases_data
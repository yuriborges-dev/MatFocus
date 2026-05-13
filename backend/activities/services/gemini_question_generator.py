import json
from django.conf import settings
from google import genai
from google.genai import types
import re
from collections import Counter

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = "gemini-3.1-flash-lite"


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
Gere questões de matemática para crianças do 3º ao 6º ano do ensino fundamental.

Conteúdo: {content}
Dificuldade: {level}

O sistema é voltado para crianças, incluindo alunos com TDAH.
Por isso, as questões devem ter linguagem simples, pouca informação por vez, frases curtas e evitar enunciados longos ou confusos.

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

Regras obrigatórias:
- não escrever nada fora do JSON
- cada fase deve ter exatamente a quantidade solicitada
- dentro da mesma fase, evite respostas corretas repetidas; se for inevitável, a mesma resposta não pode aparecer mais de 3 vezes
- dentro da mesma fase, nenhuma pergunta pode ser repetida ou equivalente
- as respostas corretas devem ser apenas números inteiros, sem texto explicativo
- não usar alternativas, múltipla escolha ou letras
- não usar respostas como "depende", "vários" ou texto
- variar números, contextos e estrutura das perguntas
- evitar sequências previsíveis
- evitar muitas perguntas com o mesmo padrão
- evitar contas fáceis demais como 1+0, 1+1, 2+1, exceto raramente
- não usar números negativos como resposta
- não usar números decimais ou frações
- não usar textos muito longos
- variar fortemente a estrutura visual e textual das perguntas
- dentro da mesma fase, as questões devem parecer diferentes entre si
- misturar formatos diferentes de pergunta
- evitar repetir muitas perguntas começando com o mesmo verbo
- evitar usar o mesmo modelo de frase várias vezes seguidas
- misturar:
  - contas diretas
  - perguntas rápidas
  - completar operações
  - situações com objetos
  - grupos
  - comparações simples
  - pequenos desafios
  - frases curtas do cotidiano
- variar bastante a forma de perguntar mesmo quando a habilidade matemática for a mesma

Regras para crianças com TDAH:
- usar frases curtas e diretas
- evitar excesso de informações no enunciado
- evitar mais de duas etapas de raciocínio
- usar vocabulário simples
- manter comandos claros, como "Calcule", "Some", "Divida" ou "Quantos sobraram?"
- evitar pegadinhas
- evitar contexto com muitos personagens ou muitos objetos diferentes
- preferir enunciados com uma ação principal
- manter tom positivo e acolhedor
- fazer perguntas visualmente variadas para manter engajamento
- evitar sensação de repetição excessiva

Regras das dicas:
- a dica deve ajudar o aluno a pensar, mas NUNCA pode entregar a resposta
- a dica não deve conter números; ela deve orientar a estratégia, não entregar resultado
- a dica não pode mostrar a conta resolvida
- a dica não pode dizer "a resposta é..."
- a dica deve ser curta, positiva e pedagógica
- a dica deve orientar estratégia, não resultado
- exemplos de boas dicas:
  "Tente resolver uma parte de cada vez."
  "Observe quais números precisam ser somados."
  "Pense em grupos com a mesma quantidade."
  "Leia com calma e procure as quantidades."
  "Veja quanto foi tirado do total."

Regras por conteúdo:
- se o conteúdo for Adição, misture:
  - contas diretas
  - juntar quantidades
  - completar somas
  - perguntas rápidas
  - situações simples do cotidiano
- se o conteúdo for Subtração, misture:
  - contas diretas
  - retirar quantidades
  - comparar valores
  - descobrir quanto sobrou
- se o conteúdo for Multiplicação, misture:
  - multiplicações diretas
  - grupos iguais
  - dobro, triplo e agrupamentos
  - completar multiplicações
  - situações com objetos e coleções
- se o conteúdo for Divisão, misture:
  - divisões exatas
  - repartir igualmente
  - separar em grupos
  - descobrir quantos cabem em cada grupo
- se o conteúdo for Problemas, crie apenas enunciados contextualizados, sem contas soltas

Regras para enunciados:
- usar situações do cotidiano infantil: frutas, brinquedos, lápis, balas, figurinhas, livros, jogos e escola
- não repetir o mesmo contexto muitas vezes
- os enunciados devem ser curtos e claros
- as respostas dentro da mesma fase devem variar bastante
- evitar enunciados com mais de 25 palavras, exceto se necessário em problemas
- variar bastante os verbos utilizados
- variar bastante a estrutura textual das frases

Regras de dificuldade:
- Nível 1: adequado ao 3º ano, números pequenos e raciocínio direto
- Nível 2: adequado ao 4º ano, números médios e enunciados simples
- Nível 3: adequado ao 5º ano, números maiores e mais variedade
- Nível 4: adequado ao 6º ano, desafios um pouco maiores, mas ainda claros e acessíveis

Importante:
Antes de finalizar cada fase:
- confira se nenhuma resposta aparece mais de 3 vezes
- confira se as dicas não possuem números nem entregam respostas
- confira se as perguntas da fase parecem variadas visualmente e linguisticamente
- confira se as perguntas não seguem sempre o mesmo modelo textual
"""


def get_safe_tip(content):
    tips = {
        "Adição": "Observe quais quantidades precisam ser juntadas.",
        "Subtração": "Veja quanto foi retirado do total.",
        "Multiplicação": "Pense em grupos com a mesma quantidade.",
        "Divisão": "Pense em repartir em partes iguais.",
        "Problemas": "Leia com calma e procure as quantidades importantes.",
    }

    return tips.get(content, "Tente resolver uma parte de cada vez.")


def tip_has_answer(tip, answer):
    if not answer:
        return False

    return re.search(rf"\b{re.escape(str(answer))}\b", tip) is not None


def validate_level_questions(phases_data, content):
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

        answers = []
        statements = set()

        for question in questions:
            if not all(key in question for key in ("statement", "correct_answer", "tip")):
                raise Exception(
                    f"A fase {phase_number} possui questão com campos faltando."
                )

            statement = str(question["statement"]).strip()
            normalized_statement = statement.lower()

            answer = str(question["correct_answer"]).strip()
            tip = str(question["tip"]).strip()

            if normalized_statement in statements:
                raise Exception(f"A fase {phase_number} possui pergunta repetida.")

            statements.add(normalized_statement)

            if not answer.isdigit():
                raise Exception(
                    f"A fase {phase_number} possui resposta inválida: {answer}"
                )

            answers.append(answer)

            if tip_has_answer(tip, answer) or re.search(r"\d", tip):
                question["tip"] = get_safe_tip(content)

        repeated_answers = Counter(answers)

        severe_repetitions = [
            (answer, amount)
            for answer, amount in repeated_answers.items()
            if amount > 3
        ]

        if severe_repetitions:
            raise Exception(
                f"A fase {phase_number} possui respostas repetidas demais: "
                f"{severe_repetitions}"
            )


def generate_level_questions(content, level):
    last_error = None

    for attempt in range(1, 3):
        prompt = build_level_prompt(content, level)

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LEVEL_SCHEMA,
                temperature=0.8,
            ),
        )

        text = (response.text or "").strip()

        if not text:
            last_error = "O Gemini retornou uma resposta vazia."
            continue

        try:
            phases_data = json.loads(text)
        except json.JSONDecodeError as exc:
            last_error = f"Resposta inválida do Gemini: {text}"
            continue

        if not isinstance(phases_data, list):
            last_error = "O Gemini não retornou uma lista de fases."
            continue

        try:
            validate_level_questions(phases_data, content)
            return phases_data
        except Exception as err:
            last_error = err
            print(f"      Tentativa {attempt} inválida: {err}")

    raise Exception(last_error)
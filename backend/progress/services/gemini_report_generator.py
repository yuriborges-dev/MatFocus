from django.conf import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = "gemini-3.1-flash-lite-preview"


def generate_default_student_report(data):
    period_map = {
        "7d": "7 dias",
        "14d": "14 dias",
        "30d": "30 dias",
    }

    period_label = period_map.get(data["period"], data["period"])

    return f"""Relatório de desempenho — últimos {period_label}

Aluno: {data["name"]}
Ano escolar: {data["grade"]}

Resumo do desempenho
O aluno apresentou um bom acompanhamento pedagógico no período analisado, com desempenho geral de {data["accuracy"]}% de taxa de acerto nas atividades realizadas.

Atividades realizadas
Foram concluídas {data["activities"]} atividades no período, com tempo médio de {data["avg_time"]} segundos por questão.

Desempenho por conteúdo
O melhor desempenho foi observado em {data["best_content"]}. Já o conteúdo que precisa de mais atenção é {data["worst_content"]}.

Pontos fortes
O aluno demonstra dedicação, continuidade nas atividades e avanço no processo de aprendizagem.

Áreas para melhorar
É importante continuar reforçando principalmente o conteúdo de {data["worst_content"]}, com foco em compreensão e prática gradual.

Sugestão prática pedagógica
Recomenda-se realizar pequenas atividades de revisão com apoio do responsável, incentivando a leitura atenta dos enunciados e a resolução com calma, para fortalecer a confiança e o desempenho do aluno.
"""


def generate_student_report(data):
    period_map = {
        "7d": "7 dias",
        "14d": "14 dias",
        "30d": "30 dias",
    }

    period_label = period_map.get(data["period"], data["period"])

    student_name = data["name"]
    school_grade = data["grade"]

    prompt = f"""
Gere um relatório educacional simples para o responsável de um aluno.

IMPORTANTE:
- NÃO usar markdown
- NÃO usar ### ou ---
- NÃO usar listas com *
- NÃO usar assinatura institucional
- NÃO formatar como carta
- NÃO usar emojis
- usar linguagem simples e objetiva
- destacar subtópicos e palavras importantes com negrito
- formato ideal para exibição dentro de um sistema educacional

Dados:

Nome do aluno: {data["name"]}
Ano escolar: {data["grade"]}
Período analisado: últimos {data["period"]}

Total de atividades: {data["activities"]}
Taxa de acerto: {data["accuracy"]}%
Conteúdo com melhor desempenho: {data["best_content"]}
Conteúdo com menor desempenho: {data["worst_content"]}
Tempo médio: {data["avg_time"]} segundos

Estrutura do relatório:

Título:
Relatório de desempenho — últimos {period_label}

Aluno: {student_name}
Ano escolar: {school_grade}

Resumo do desempenho
Atividades realizadas
Desempenho por conteúdo
Pontos fortes
Áreas para melhorar
Sugestão prática pedagógica

Texto claro, positivo e apropriado para responsáveis.

Não inventar números.
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        text = (response.text or "").strip()

        if not text:
            return generate_default_student_report(data)

        return text

    except Exception as error:
        print(f"Erro ao gerar relatório com Gemini: {error}")
        return generate_default_student_report(data)
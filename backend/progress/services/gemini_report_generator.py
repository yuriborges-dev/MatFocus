from django.conf import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = "gemini-3.1-flash-lite-preview"


def generate_student_report(data):

    period_map = {
        "7d": "7 dias",
        "14d": "14 dias",
        "30d": "30 dias",
    }

    period_label = period_map.get(data["period"], data["period"])

    # corrigindo parâmetros que estavam faltando
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
- destacar palavras importantes com negrito usando ** **
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

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    return response.text
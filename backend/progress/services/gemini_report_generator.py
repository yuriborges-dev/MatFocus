from django.conf import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL_NAME = "gemini-3.1-flash-lite"


def generate_default_student_report(data):
    period_map = {
        "7d": "7 dias",
        "14d": "14 dias",
        "30d": "30 dias",
    }

    period_label = period_map.get(data["period"], data["period"])
    accuracy = data["accuracy"]
    avg_time = data["avg_time"]

    if accuracy >= 85:
        desempenho = "muito positivo"
        resumo = "O aluno apresentou ótimo aproveitamento no período analisado, demonstrando boa compreensão das atividades realizadas."
    elif accuracy >= 60:
        desempenho = "satisfatório"
        resumo = "O aluno apresentou um desempenho satisfatório no período analisado, com bons avanços e alguns pontos que ainda podem ser reforçados."
    else:
        desempenho = "em desenvolvimento"
        resumo = "O aluno está em processo de desenvolvimento nas habilidades avaliadas, sendo importante manter uma rotina de prática com apoio e incentivo."

    if avg_time and avg_time >= 10:
        tempo_texto = f"O tempo médio foi de {avg_time} segundos por questão, indicando o ritmo observado durante as atividades."
    else:
        tempo_texto = "O tempo médio foi baixo, indicando rapidez nas respostas durante as atividades."

    return f"""Relatório de desempenho — últimos {period_label}

Aluno: {data["name"]}
Ano escolar: {data["grade"]}

Resumo do desempenho
{resumo}

Atividades realizadas
Foram concluídas {data["activities"]} atividades, com taxa de acerto de {accuracy}%. {tempo_texto}

Desempenho por conteúdo
O melhor desempenho foi observado em {data["best_content"]}. O conteúdo que merece mais atenção neste momento é {data["worst_content"]}.

Pontos fortes
O aluno demonstrou participação nas atividades e apresentou desempenho {desempenho}, especialmente nas tarefas relacionadas a {data["best_content"]}.

Áreas para melhorar
É importante reforçar {data["worst_content"]} com atividades curtas, exemplos simples e revisão gradual, respeitando o ritmo de aprendizagem do aluno.

Sugestão prática pedagógica
Recomenda-se realizar pequenas práticas com acompanhamento do responsável, usando enunciados curtos e leitura pausada. Essa estratégia ajuda a organizar o pensamento, manter o foco e fortalecer a confiança durante a resolução das atividades.
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
Gere um relatório educacional para o responsável de um aluno do ensino fundamental.

Contexto:
O sistema MatFocus apoia o estudo de matemática por meio de atividades curtas, feedback positivo e recursos pensados para crianças, incluindo alunos com TDAH. O relatório deve ter tom pedagógico, acolhedor e objetivo, sem parecer laudo clínico.

IMPORTANTE:
- NÃO usar markdown
- NÃO usar ### ou ---
- NÃO usar listas com *
- NÃO usar assinatura institucional
- NÃO formatar como carta
- NÃO usar emojis
- NÃO inventar números ou informações
- NÃO afirmar diagnóstico, sintomas ou condições clínicas
- NÃO usar termos médicos
- usar linguagem simples, positiva e adequada para responsáveis
- evitar frases genéricas demais
- variar a construção das frases
- escrever como uma análise pedagógica breve
- pode destacar subtópicos com texto simples, sem símbolos
- formato ideal para exibição dentro de um sistema educacional
- usar símbolo % ao invés de escrever "por cento"
- evitar linguagem acadêmica excessivamente formal
- cada seção deve ter no máximo 3 frases curtas
- preferir frases menores e leitura fluida

Dados do aluno:
Nome: {data["name"]}
Ano escolar: {data["grade"]}
Período analisado: últimos {period_label}
Total de atividades concluídas: {data["activities"]}
Taxa de acerto: {data["accuracy"]}%
Conteúdo com melhor desempenho: {data["best_content"]}
Conteúdo que precisa de mais atenção: {data["worst_content"]}
Tempo médio por questão: {data["avg_time"]} segundos

Regras de interpretação:
- Se a taxa de acerto for maior ou igual a 85%, descreva desempenho muito positivo.
- Se a taxa de acerto estiver entre 60% e 84%, descreva desempenho satisfatório, com pontos a reforçar.
- Se a taxa de acerto for menor que 60%, descreva desempenho em desenvolvimento, com necessidade de prática gradual.
- Se o tempo médio for menor que 10 segundos, não enfatize o número exato; diga apenas que houve rapidez nas respostas.
- Se o melhor conteúdo e o conteúdo que precisa de atenção forem iguais, explique que ainda há poucos dados ou pouca variedade de atividades para comparar conteúdos com segurança.
- Recomendações devem ser práticas, curtas e possíveis de aplicar em casa ou na escola.
- A sugestão pedagógica deve considerar foco, leitura pausada, organização do raciocínio e reforço positivo.

Estrutura obrigatória:

Relatório de desempenho — últimos {period_label}

Aluno: {student_name}
Ano escolar: {school_grade}

Resumo do desempenho
Escreva 1 parágrafo curto, personalizado pelos dados.

Atividades realizadas
Informe atividades, acertos e ritmo de resposta. Não exagere na interpretação do tempo.

Desempenho por conteúdo
Compare o melhor conteúdo e o conteúdo que precisa de atenção, com cuidado para não parecer julgamento negativo.

Pontos fortes
Aponte um ponto forte relacionado ao desempenho observado.

Áreas para melhorar
Explique o que pode ser reforçado, com linguagem acolhedora.

Sugestão prática pedagógica
Dê uma orientação concreta para o responsável acompanhar o estudo.

Tamanho:
- máximo de 450 palavras
- parágrafos curtos
- texto natural, sem parecer template repetitivo
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
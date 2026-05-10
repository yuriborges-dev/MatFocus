# Backend — MatFocus

Este diretório contém a API do MatFocus, desenvolvida com Django e Django REST Framework.

## Responsabilidades

- Autenticação de usuários com JWT
- Cadastro e gerenciamento de alunos
- Organização de conteúdos, níveis, fases e questões
- Registro de progresso dos alunos
- Controle de pontuação e conquistas
- Geração de relatórios de desempenho
- Integração com banco de dados PostgreSQL

## Tecnologias

- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- ReportLab

## Execução local

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# 📘 MatFocus

MatFocus é uma aplicação web gamificada desenvolvida com foco no apoio à aprendizagem matemática de crianças do Ensino Fundamental, especialmente estudantes com Transtorno do Déficit de Atenção e Hiperatividade (TDAH).

O sistema utiliza conteúdos organizados em níveis e fases progressivas, elementos de gamificação, feedback imediato e acompanhamento de desempenho para tornar o processo de aprendizagem mais interativo, acessível e motivador.

---

# 🚀 Funcionalidades

- ✅ Sistema de autenticação de usuários
- ✅ Organização de conteúdos matemáticos por níveis e fases
- ✅ Questões matemáticas progressivas
- ✅ Sistema de pontuação
- ✅ Desbloqueio progressivo de fases
- ✅ Sistema de conquistas
- ✅ Níveis matemáticos baseados em pontuação
- ✅ Feedback imediato nas atividades
- ✅ Dashboard de acompanhamento
- ✅ Relatórios de desempenho
- ✅ Sugestão automática de pausas
- ✅ Configurações de estímulos visuais e sonoros
- ✅ Interface responsiva e adaptável
- ✅ Geração automática de questões com IA
- ✅ Geração de relatórios pedagógicos com IA

---

# 🧠 Objetivo do Projeto

O MatFocus foi desenvolvido como Trabalho de Conclusão de Curso (TCC) com o objetivo de criar uma ferramenta educacional digital que auxilie no ensino da matemática de forma mais acessível, dinâmica e motivadora para crianças com dificuldades de atenção e concentração.

---

# 🏗️ Arquitetura

O sistema segue o modelo de arquitetura cliente-servidor:

```text
Frontend (React + TypeScript)
        ↓
API REST (Django REST Framework)
        ↓
PostgreSQL
```

---

# 🛠️ Tecnologias Utilizadas

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React

---

## Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- ReportLab

---

## Ferramentas

- Git
- GitHub
- Figma
- Draw.io
- Lucidchart

---

# 🎮 Sistema de Gamificação

O MatFocus utiliza diversos elementos de gamificação para aumentar o engajamento dos estudantes:

- Sistema de pontos
- Conquistas desbloqueáveis
- Níveis matemáticos
- Progressão por fases
- Feedback visual imediato
- Acompanhamento da evolução do aluno

---

# ♿ Acessibilidade e TDAH

O sistema foi desenvolvido considerando aspectos importantes relacionados ao TDAH, como:

- Redução de distrações visuais
- Interface limpa e objetiva
- Controle de animações
- Controle de estímulos sonoros
- Sugestão automática de pausas
- Feedbacks rápidos e motivacionais
- Navegação simplificada

---

# 📊 Relatórios

O sistema gera relatórios automáticos contendo:

- Desempenho do aluno
- Quantidade de acertos e erros
- Taxa de aproveitamento
- Evolução nas atividades
- Análises pedagógicas geradas com IA

Também é possível exportar relatórios em PDF.

---

# 📂 Estrutura do Projeto

```text
matfocus/
│
├── backend/
│   ├── activities/
│   ├── progress/
│   ├── students/
│   ├── users/
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
└── README.md
```

---

# ⚙️ Como Executar o Projeto

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Variáveis de Ambiente

Exemplo de `.env`:

```env
SECRET_KEY=sua_chave
DEBUG=True

DB_NAME=matfocus
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432

GEMINI_API_KEY=sua_chave_api
```

---

# 🌐 Deploy

Link da aplicação após implantação:

```text
[ADICIONAR LINK AQUI]
```

---

# 👨‍💻 Autor

Samuel Henrique Borges

Graduando em Tecnologia em Análise e Desenvolvimento de Sistemas  
Instituto Federal Baiano — Campus Guanambi

---

# 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e educacionais.
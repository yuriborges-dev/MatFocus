import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Code2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"

function AboutPage() {
  const navigate = useNavigate()

  const iconStyle = "h-9 w-9 shrink-0 text-[#3b82d0]"

  return (
    <AppLayout showProfileCard={false}>
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <h1 className="text-4xl font-extrabold text-slate-900">
            Sobre o MatFocus
          </h1>

          <p className="mt-2 text-lg text-slate-400">
            Informações institucionais do projeto
          </p>
        </header>

        <section className="space-y-6">

          {/* Desenvolvedor */}
          <div className="rounded-[1.75rem] bg-white p-7 shadow-md">
            <div className="flex items-start gap-4">
              <GraduationCap className={iconStyle} />

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Desenvolvedor
                </h2>

                <p className="mt-2 text-slate-600 leading-relaxed">
                  O sistema <i><strong>MatFocus</strong></i> foi desenvolvido por
                  <strong> Yuri Lima Borges</strong>, estudante do curso de
                  Tecnologia em Análise e Desenvolvimento de Sistemas do
                  Instituto Federal de Educação, Ciência e Tecnologia Baiano –
                  Campus Guanambi, como parte do Trabalho de Conclusão de Curso
                  (TCC). O projeto foi concebido com o objetivo de contribuir
                  para o desenvolvimento de ferramentas educacionais digitais
                  voltadas ao apoio do processo de aprendizagem matemática.
                </p>
              </div>
            </div>
          </div>

          {/* Objetivo */}
          <div className="rounded-[1.75rem] bg-white p-7 shadow-md">
            <div className="flex items-start gap-4">
              <BookOpen className={iconStyle} />

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Objetivo do sistema
                </h2>

                <p className="mt-2 text-slate-600 leading-relaxed">
                  O MatFocus tem como objetivo auxiliar estudantes do ensino
                  fundamental no processo de aprendizagem da matemática por meio
                  de atividades estruturadas em níveis progressivos de
                  dificuldade. O sistema adota princípios de simplicidade
                  visual, organização por fases e redução de estímulos
                  distratores, buscando oferecer suporte especialmente a alunos
                  com Transtorno do Déficit de Atenção e Hiperatividade (TDAH),
                  promovendo maior foco e engajamento durante a realização das
                  atividades propostas.
                </p>
              </div>
            </div>
          </div>

          {/* Tecnologias */}
          <div className="rounded-[1.75rem] bg-white p-7 shadow-md">
            <div className="flex items-start gap-4">
              <Code2 className={iconStyle} />

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Tecnologias utilizadas
                </h2>

                <p className="mt-2 text-slate-600 leading-relaxed">
                  O sistema foi desenvolvido utilizando tecnologias modernas
                  voltadas à construção de aplicações web. No frontend foram
                  utilizados React com TypeScript e TailwindCSS para construção
                  da interface responsiva e acessível. No backend foi utilizado
                  Django REST Framework para implementação da API responsável
                  pela comunicação entre cliente e servidor, juntamente com o
                  banco de dados PostgreSQL para armazenamento das informações.
                  A autenticação de usuários é realizada por meio de tokens JWT,
                  garantindo maior segurança no acesso à aplicação.
                </p>
              </div>
            </div>
          </div>

        </section>
      </div>
    </AppLayout>
  )
}

export default AboutPage
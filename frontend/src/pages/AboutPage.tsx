import {
  BookOpen,
  GraduationCap,
  Code2,
} from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import BackButton from "../components/BackButton"
import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel, getPageAnimation } from "../utils/animation"

function AboutPage() {

  const { student } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)
  const iconStyle =
    "h-8 w-8 shrink-0 text-[#3b82d0] sm:h-9 sm:w-9"

  return (
    <AppLayout showProfileCard={false}>
      <div className={`mx-auto max-w-4xl ${getPageAnimation(animationLevel)}`}>
        <header className="mb-6 sm:mb-8">
          <BackButton fallbackPath="/perfil" />

          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Sobre o MatFocus
          </h1>

          <p className="mt-1 text-sm text-slate-400 sm:mt-2 sm:text-base lg:text-lg">
            Informações institucionais do projeto
          </p>
        </header>

        <section className="space-y-5 sm:space-y-6">
          <div className="rounded-[1.6rem] bg-white p-5 shadow-md sm:rounded-[1.75rem] sm:p-7">
            <div className="flex items-start gap-4">
              <GraduationCap className={iconStyle} />

              <div>
                <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                  Desenvolvedor
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                  O sistema <i><strong>MatFocus</strong></i> foi desenvolvido por
                  <strong> Yuri Lima Borges</strong>, estudante do curso de
                  Tecnologia em Análise e Desenvolvimento de Sistemas e orientado por
                  <strong> Paula Patricia Oliveira da Silva</strong>, professora do
                  Instituto Federal de Educação, Ciência e Tecnologia Baiano –
                  Campus Guanambi, como parte do Trabalho de Conclusão de Curso
                  (TCC). O projeto foi concebido com o objetivo de contribuir
                  para o desenvolvimento de ferramentas educacionais digitais
                  voltadas ao apoio do processo de aprendizagem matemática.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] bg-white p-5 shadow-md sm:rounded-[1.75rem] sm:p-7">
            <div className="flex items-start gap-4">
              <BookOpen className={iconStyle} />

              <div>
                <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                  Objetivo do sistema
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                  O <i>MatFocus</i> tem como objetivo auxiliar estudantes do ensino
                  fundamental no processo de aprendizagem da matemática por meio
                  de atividades estruturadas em níveis progressivos de
                  dificuldade. O sistema adota princípios de simplicidade
                  visual, organização por fases e redução de estímulos
                  distratores, buscando oferecer suporte especialmente a alunos
                  com Transtorno do <i>Déficit</i> de Atenção e Hiperatividade (TDAH),
                  promovendo maior foco e engajamento durante a realização das
                  atividades propostas.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] bg-white p-5 shadow-md sm:rounded-[1.75rem] sm:p-7">
            <div className="flex items-start gap-4">
              <Code2 className={iconStyle} />

              <div>
                <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                  Tecnologias utilizadas
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                  O sistema foi desenvolvido utilizando tecnologias modernas
                  voltadas à construção de aplicações <i>web</i>. No <i>frontend</i> foram
                  utilizados React com TypeScript e TailwindCSS para construção
                  da interface responsiva e acessível. No <i>backend</i> foi utilizado
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
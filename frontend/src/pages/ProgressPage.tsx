import AppLayout from "../layouts/AppLayout"
import ProgressCircle from "../components/ProgressCircle"
import { CheckCircle2, CircleX } from "lucide-react"

function ProgressPage() {
  const totalCorrect = 22
  const totalWrong = 7
  const totalQuestions = totalCorrect + totalWrong
  const totalActivities = 7
  const accuracyRate =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  const contentProgress = [
    { name: "Adição", progress: 70, color: "bg-blue-500" },
    { name: "Subtração", progress: 40, color: "bg-green-500" },
    { name: "Multiplicação", progress: 15, color: "bg-yellow-400" },
    { name: "Divisão", progress: 0, color: "bg-purple-500" },
    { name: "Problemas", progress: 0, color: "bg-red-500" },
  ]

  const activityHistory = [
    { title: "Subtração - Nível 1", details: "5/5 acertos • 14s", points: "+50 pts" },
    { title: "Adição - Nível 1", details: "4/5 acertos • 18s", points: "+40 pts" },
    { title: "Adição - Nível 1", details: "3/5 acertos • 22s", points: "+30 pts" },
  ]

  return (
    <AppLayout>
      <div>
        <h1 className="text-[2.5rem] font-extrabold text-slate-900">
          Meu Progresso
        </h1>
        <p className="mt-1 text-[1.1rem] text-slate-400">
          Acompanhe seu desempenho
        </p>
      </div>

      <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
        <h2 className="text-[1.2rem] font-bold text-slate-800">
          Taxa de acerto geral
        </h2>

        <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <ProgressCircle value={accuracyRate} />

            <div>
              <p className="text-[1.2rem] font-semibold text-slate-700">
                {totalCorrect} acertos de {totalQuestions} questões
              </p>
              <p className="mt-1 text-[1.05rem] text-slate-400">
                {totalActivities} atividades realizadas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:min-w-[340px]">
            <div className="rounded-[1.4rem] bg-[#eefaf2] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff4e8] text-[#49b67f]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-[1rem] font-medium text-slate-400">
                    Acertos
                  </p>
                  <p className="text-[1.8rem] font-bold text-slate-800">
                    {totalCorrect}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] bg-[#fff2f2] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe3e3] text-[#ef6262]">
                  <CircleX className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-[1rem] font-medium text-slate-400">
                    Erros
                  </p>
                  <p className="text-[1.8rem] font-bold text-slate-800">
                    {totalWrong}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
        <h2 className="text-[1.2rem] font-bold text-slate-800">
          Progresso por conteúdo
        </h2>
        <p className="mt-1 text-[1rem] text-slate-400">
          Veja sua evolução em cada conteúdo
        </p>

        <div className="mt-6 space-y-5">
          {contentProgress.map((item) => (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[1.05rem] font-semibold text-slate-700">
                  {item.name}
                </span>

                <span className="text-[1rem] text-slate-400">
                  {item.progress}%
                </span>
              </div>

              <div className="h-3 w-full rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
        <h2 className="text-[1.2rem] font-bold text-slate-800">
          Histórico de atividades
        </h2>

        {activityHistory.length > 0 ? (
          <div className="mt-6 space-y-4">
            {activityHistory.map((activity, index) => (
              <div
                key={`${activity.title}-${index}`}
                className="flex flex-col gap-3 rounded-[1.4rem] bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-[1.1rem] font-bold text-slate-800">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-[1rem] text-slate-400">
                    {activity.details}
                  </p>
                </div>

                <span className="text-[1.2rem] font-bold text-[#79c6a1]">
                  {activity.points}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center">
            <p className="text-[1.15rem] text-slate-400">
              Nenhuma atividade realizada ainda.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default ProgressPage
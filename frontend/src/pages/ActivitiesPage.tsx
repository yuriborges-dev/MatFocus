import AppLayout from "../layouts/AppLayout"
import ActivityCard from "../components/ActivityCard"

function ActivitiesPage() {
  return (
    <AppLayout>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[2.5rem] font-extrabold text-slate-900">
            Escolha o conteúdo
          </h1>
          <p className="mt-1 text-[1.1rem] text-slate-400">
            O que vamos praticar hoje?
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-3xl bg-white px-5 py-4 shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7e7c8] text-xl">
            👦🏽
          </div>

          <div>
            <p className="font-semibold text-slate-700">
              Yuri Borges
            </p>
            <p className="text-sm text-slate-400">0 pts</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <ActivityCard
          title="Adição"
          description="Aprenda a somar números"
          icon="+"
          borderColor="border-blue-400"
          bgColor="bg-blue-100"
          textColor="text-blue-500"
        />

        <ActivityCard
          title="Subtração"
          description="Aprenda a subtrair números"
          icon="-"
          borderColor="border-green-400"
          bgColor="bg-green-100"
          textColor="text-green-500"
        />

        <ActivityCard
          title="Multiplicação"
          description="Aprenda a multiplicar"
          icon="×"
          borderColor="border-yellow-400"
          bgColor="bg-yellow-100"
          textColor="text-yellow-500"
        />

        <ActivityCard
          title="Divisão"
          description="Aprenda a dividir"
          icon="÷"
          borderColor="border-purple-400"
          bgColor="bg-purple-100"
          textColor="text-purple-500"
        />

        <ActivityCard
          title="Problemas"
          description="Resolva desafios matemáticos"
          icon="?"
          borderColor="border-red-400"
          bgColor="bg-red-100"
          textColor="text-red-500"
        />
      </div>
    </AppLayout>
  )
}

export default ActivitiesPage
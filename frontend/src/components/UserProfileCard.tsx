function UserProfileCard() {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white px-5 py-4 shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7e7c8] text-xl">
        👦🏽
      </div>

      <div className="leading-tight">
        <p className="text-[1.05rem] font-semibold text-slate-700">
          Yuri Borges
        </p>
        <p className="text-sm text-slate-400">0 pts</p>
      </div>
    </div>
  )
}

export default UserProfileCard
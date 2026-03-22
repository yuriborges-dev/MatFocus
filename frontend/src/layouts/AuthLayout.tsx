type AuthLayoutProps = {
  children: React.ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
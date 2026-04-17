type AuthLayoutProps = {
  children: React.ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 px-4 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto flex w-full max-w-7xl justify-center lg:min-h-[calc(100vh-3rem)] lg:items-center">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
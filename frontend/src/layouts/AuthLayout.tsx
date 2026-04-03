type AuthLayoutProps = {
  children: React.ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-sky-50 to-emerald-50 px-4">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
import { AuthForm } from "@/components/auth-form"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            PineScript Analytics
          </h1>
          <p className="text-slate-400">Professional Strategy Backtesting Platform</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}

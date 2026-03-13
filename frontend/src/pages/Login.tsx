import LoginButton from "../components/LoginButton";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            OmegaWeb
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Cloud-native translation memory assistant. Match your documents
            against professional translation memories instantly.
          </p>
        </div>

        <div className="flex justify-center">
          <LoginButton />
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Sign in with your Google account to access Google Docs and start
          translating.
        </p>
      </div>
    </div>
  );
}

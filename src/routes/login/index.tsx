import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { Building2, Lock, Mail } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export const Route = createFileRoute("/login/")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const setAuthToken = useAuthStore((state) => state.setAuthToken);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation(
    trpc.login.mutationOptions({
      onSuccess: (data) => {
        setAuthToken(data.authToken);
        toast.success(`Welcome back, ${data.user.firstName}!`);
        void navigate({ to: "/app/dashboard" });
      },
      onError: (error) => {
        toast.error(error.message || "Login failed");
      },
    })
  );

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 text-white">
            <Building2 className="w-10 h-10" />
            <span className="text-3xl font-bold">{t("app.assetMaster")}</span>
          </div>
        </div>
        <div className="relative z-10 text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            {t("app.tagline")}
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            {t("app.description")}
          </p>
        </div>
        <div className="relative z-10 text-blue-100 text-sm">
          {t("app.copyright")}
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center items-center space-x-2 mb-6">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{t("app.assetMaster")}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("auth.welcomeBack")}</h2>
            <p className="text-gray-600">{t("auth.signInMessage")}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("auth.emailAddress")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@company.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("auth.dontHaveAccount")}{" "}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  {t("auth.createOneNow")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

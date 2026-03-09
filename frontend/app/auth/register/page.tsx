// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Code2, Eye, EyeOff, Loader2 } from "lucide-react";
// import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
// import { registerUser, clearError } from "@/store/slices/authSlice";

// export default function RegisterPage() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const [showPass, setShowPass] = useState(false);

//   useEffect(() => {
//     if (isAuthenticated) router.push("/dashboard");
//     return () => { dispatch(clearError()); };
//   }, [isAuthenticated, router, dispatch]);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     dispatch(registerUser(form));
//   }

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <Link href="/" className="inline-flex items-center gap-2 mb-6">
//             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
//               <Code2 className="w-6 h-6 text-primary-foreground" />
//             </div>
//             <span className="font-bold text-2xl">Codestream</span>
//           </Link>
//           <h1 className="text-2xl font-bold">Create your account</h1>
//           <p className="text-muted-foreground mt-1">Start coding together in minutes</p>
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
//           {error && (
//             <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-6 border border-destructive/20">{error}</div>
//           )}
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium mb-1.5">Full Name</label>
//               <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 placeholder="Jane Smith"
//                 className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1.5">Email</label>
//               <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 placeholder="jane@example.com"
//                 className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1.5">Password</label>
//               <div className="relative">
//                 <input type={showPass ? "text" : "password"} required minLength={6} value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   placeholder="Min. 6 characters"
//                   className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition pr-10" />
//                 <button type="button" onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
//                   {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>
//             <button type="submit" disabled={isLoading}
//               className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
//               {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
//               Create Account
//             </button>
//           </form>
//         </div>

//         <p className="text-center text-sm text-muted-foreground mt-6">
//           Already have an account?{" "}
//           <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   );
// }
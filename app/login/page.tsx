import { Suspense } from "react";
import CustomerAuthForm from "@/components/customer-auth-form";
export default function LoginPage() { return <Suspense fallback={<main className="min-h-screen bg-[#06101d]" />}><CustomerAuthForm mode="login" /></Suspense>; }
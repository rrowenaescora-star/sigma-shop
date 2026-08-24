import { Suspense } from "react";
import CustomerAuthForm from "@/components/customer-auth-form";
export default function ForgotPasswordPage() { return <Suspense fallback={<main className="min-h-screen bg-[#06101d]" />}><CustomerAuthForm mode="forgot" /></Suspense>; }
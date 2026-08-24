import { Suspense } from "react";
import VerifyRegistrationOtp from "@/components/verify-registration-otp";
export default function VerifyEmailPage(){return <Suspense fallback={<main className="min-h-screen bg-[#06101d]"/>}><VerifyRegistrationOtp/></Suspense>}
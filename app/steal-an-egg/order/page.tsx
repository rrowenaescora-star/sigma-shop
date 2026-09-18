import { Suspense } from "react";
import StealAnEggOrderClient from "./order-client";
export default function Page(){return <Suspense fallback={<main className="min-h-screen bg-[#07111f] p-8 text-white">Loading order…</main>}><StealAnEggOrderClient/></Suspense>}
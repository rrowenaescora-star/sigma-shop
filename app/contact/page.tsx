import LegalPageShell from "@/components/legal-page-shell";
export const metadata = {
  title: "Contact Us | Bloxhop",
  description: "Contact Bloxhop support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-white px-6 py-12">
      <LegalPageShell className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

        <div className="space-y-4 text-white/90 leading-7">
          <p>Need help? We are here for you.</p>

          <section>
            <h2 className="text-xl font-semibold mb-2">Support Email</h2>
            <p>bloxhop@bloxhop.site</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Discord</h2>
            <p>Replace this with your Discord invite link or support username.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Support Hours</h2>
            <p>Monday to Sunday: 9:00 AM to 11:00 PM PHT</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Response Time</h2>
            <p>Usually within 5 to 30 minutes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Business Information</h2>
            <p>Replace this with your registered business name and Philippine address.</p>
          </section>
        </div>
      </LegalPageShell>
    </main>
  );
}
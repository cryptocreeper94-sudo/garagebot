import { useState } from "react";
import { Phone, MessageSquare, ShieldCheck } from "lucide-react";

export default function SMSOptInDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-sans">
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Phone className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-page-title">
            GarageBot Sign Up
          </h1>
          <p className="text-slate-400 text-sm">
            Create your account to search parts from 68+ retailers
          </p>
        </div>

        {submitted ? (
          <div className="text-center p-8 rounded-2xl bg-white/[0.03] border border-white/10">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold mb-1" data-testid="text-success">Thank you!</h2>
            <p className="text-slate-400 text-sm">Your demo submission has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 text-sm"
                  data-testid="input-name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 text-sm"
                  data-testid="input-email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 text-sm"
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-start gap-3">
                <input
                  id="sms-opt-in"
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/40 cursor-pointer shrink-0"
                  data-testid="checkbox-sms-opt-in"
                />
                <label htmlFor="sms-opt-in" className="text-sm text-slate-300 leading-relaxed cursor-pointer" data-testid="text-sms-consent">
                  I agree to receive SMS messages from GarageBot about account updates, appointments, and promotions. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to unsubscribe, HELP for help. Consent is not required to use GarageBot.
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  SMS consent is separate from our{" "}
                  <a href="/terms" className="text-cyan-400 underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-cyan-400 underline">Privacy Policy</a>.
                  You may use GarageBot without opting in to SMS messages.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
              data-testid="button-submit"
            >
              Create Account
            </button>

            <p className="text-center text-xs text-slate-500">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-cyan-400 underline">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" className="text-cyan-400 underline">Privacy Policy</a>.
            </p>
          </form>
        )}

        <div className="mt-12 text-center">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} GarageBot &mdash; DarkWave Studios LLC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Phone, MessageSquare, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";

export default function SMSOptInDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError("Please enter a valid 10-digit US phone number");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Please enter a valid 10-digit US phone number");
      return;
    }
    if (!smsOptIn) return;

    try {
      await fetch("/api/sms-opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: `+1${digits}`,
          smsOptIn: true,
          consentTimestamp: new Date().toISOString(),
          consentSource: "web_form",
          consentUrl: window.location.href,
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <img
            src="/garagebot-logo.png"
            alt="GarageBot"
            className="h-12 mx-auto mb-4"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-page-title">
            GarageBot SMS Notifications
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Sign up to receive text message notifications from GarageBot, operated by DarkWave Studios LLC
          </p>
        </div>

        <div className="mb-8 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/15">
          <div className="flex items-start gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <h2 className="text-lg font-semibold text-blue-300" data-testid="text-program-description">
              About Our SMS Program
            </h2>
          </div>
          <div className="ml-8 space-y-2 text-sm text-slate-300">
            <p>
              GarageBot by <strong>DarkWave Studios LLC</strong> sends text messages related to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 text-slate-400">
              <li><strong className="text-slate-300">Account Notifications:</strong> Login verifications, security alerts, and account updates</li>
              <li><strong className="text-slate-300">Order Updates:</strong> Status notifications for parts orders placed through GarageBot</li>
              <li><strong className="text-slate-300">Appointment Reminders:</strong> Service appointment reminders from TORQUE partner shops</li>
              <li><strong className="text-slate-300">Vehicle Alerts:</strong> Maintenance reminders and recall notifications for your saved vehicles</li>
            </ul>
          </div>
        </div>

        {submitted ? (
          <div className="text-center p-8 rounded-2xl bg-white/[0.03] border border-emerald-500/20">
            <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2" data-testid="text-success">You're Signed Up!</h2>
            <p className="text-slate-400 text-sm mb-4">
              You will receive a confirmation text message shortly at the number you provided.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left">
              <p className="text-xs text-slate-500 leading-relaxed">
                You can opt out at any time by replying <strong className="text-slate-300">STOP</strong> to any message.
                Reply <strong className="text-slate-300">HELP</strong> for assistance.
                For support, email <a href="mailto:support@garagebot.io" className="text-cyan-400">support@garagebot.io</a>.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 text-sm"
                  data-testid="input-name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 text-sm"
                  data-testid="input-email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Mobile Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 bg-white/[0.05] border border-white/10 px-3 py-2.5 rounded-xl">+1</span>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 text-sm"
                    data-testid="input-phone"
                  />
                </div>
                {phoneError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {phoneError}
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-cyan-500/15">
              <div className="flex items-start gap-3">
                <input
                  id="sms-opt-in"
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  required
                  className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/40 cursor-pointer shrink-0"
                  data-testid="checkbox-sms-opt-in"
                />
                <label htmlFor="sms-opt-in" className="text-sm text-slate-200 leading-relaxed cursor-pointer" data-testid="text-sms-consent">
                  By checking this box, I consent to receive automated text messages from <strong>GarageBot (DarkWave Studios LLC)</strong> at the mobile number provided above. Messages may include account notifications, order updates, appointment reminders, and vehicle alerts. Message frequency varies (estimated 1–10 messages/month). <strong>Message and data rates may apply.</strong> Reply <strong>STOP</strong> to cancel at any time. Reply <strong>HELP</strong> for help. Consent to receive text messages is not a condition of any purchase.
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-400 leading-relaxed space-y-1.5">
                  <p><strong className="text-slate-300">Message Frequency:</strong> Varies based on your account activity. Estimated 1–10 messages per month.</p>
                  <p><strong className="text-slate-300">Message & Data Rates:</strong> Standard message and data rates from your wireless carrier may apply.</p>
                  <p><strong className="text-slate-300">Opt-Out:</strong> Text <strong className="text-white">STOP</strong> to any message to unsubscribe immediately.</p>
                  <p><strong className="text-slate-300">Help:</strong> Text <strong className="text-white">HELP</strong> to any message or email <a href="mailto:support@garagebot.io" className="text-cyan-400 underline">support@garagebot.io</a></p>
                  <p><strong className="text-slate-300">Supported Carriers:</strong> AT&T, T-Mobile, Verizon, US Cellular, and most major US carriers.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!smsOptIn || phone.replace(/\D/g, "").length !== 10}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-blue-600"
              data-testid="button-submit"
            >
              Sign Up for SMS Notifications
            </button>

            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500">
                By signing up, you also agree to our{" "}
                <a href="/terms" className="text-cyan-400 underline">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="text-cyan-400 underline">Privacy Policy</a>.
              </p>
              <p className="text-xs text-slate-500">
                View our full{" "}
                <a href="/sms-consent" className="text-cyan-400 underline">SMS Consent & Terms</a>{" "}
                for complete program details.
              </p>
            </div>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-white/5 space-y-3">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium mb-2">
              DarkWave Studios LLC
            </p>
            <p className="text-xs text-slate-600">
              Email: <a href="mailto:support@garagebot.io" className="text-cyan-400/60 hover:text-cyan-400">support@garagebot.io</a>
              {" "}&bull;{" "}
              Website: <a href="https://garagebot.io" className="text-cyan-400/60 hover:text-cyan-400">garagebot.io</a>
            </p>
          </div>
          <p className="text-center text-[10px] text-slate-600">
            &copy; {new Date().getFullYear()} GarageBot &mdash; DarkWave Studios LLC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
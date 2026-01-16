import { useState, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignaturePad, type SignaturePadRef } from "./SignaturePad";
import { Turnstile } from "@marsidev/react-turnstile";
import { Eraser, Send, CheckCircle, AlertCircle } from "lucide-react";
import type { Language } from "@/types/petition";

interface SignatureFormProps {
  language: Language;
  onSubmit: (data: {
    name: string;
    idCard: string;
    signature: string;
    turnstileToken: string;
  }) => Promise<void>;
}

export function SignatureForm({ language, onSubmit }: SignatureFormProps) {
  const [name, setName] = useState("");
  const [idCardDigits, setIdCardDigits] = useState("");
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signaturePadRef = useRef<SignaturePadRef>(null);
  const isRtl = language === "dv";

  const handleClear = () => {
    signaturePadRef.current?.clear();
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate signature
    if (signaturePadRef.current?.isEmpty()) {
      showMessage(
        language === "en" ? "Please provide your signature." : "ސޮއި ލިޔުއްވާ.",
        "error",
      );
      return;
    }

    // Validate consent
    if (!consent) {
      showMessage(
        language === "en"
          ? "Please confirm that your submission will be sent to the Parliament Petition Committee and that your information is true."
          : "މައުލޫމާތު ކަށަވަރުކޮށް، ޕެޓިޝަން ކޮމިޓީއަށް ފޮނުވުމަށް އެއްބަސްވެލައްވާ.",
        "error",
      );
      return;
    }

    // Validate ID card (6 digits)
    const idCardPattern = /^\d{6}$/;
    if (!idCardPattern.test(idCardDigits)) {
      showMessage(
        language === "en"
          ? "Please enter your ID number as 6 digits (numbers only)."
          : "ކާޑު ނަންބަރު 6 އަކުރު ޖައްސަވާ.",
        "error",
      );
      return;
    }

    // Validate turnstile
    if (!turnstileToken && !import.meta.env.DEV) {
      showMessage(
        language === "en"
          ? "Please complete the captcha challenge."
          : "ކެޕްޗާ ފުރިހަމަ ކުރައްވާ.",
        "error",
      );
      return;
    }

    const signature = signaturePadRef.current?.toSVG();
    if (!signature) {
      showMessage(
        language === "en" ? "Please provide your signature." : "ސޮއި ލިޔުއްވާ.",
        "error",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        idCard: "A" + idCardDigits,
        signature,
        turnstileToken: turnstileToken || "DEV_BYPASS_TOKEN",
      });

      showMessage(
        language === "en"
          ? "Signature submitted successfully!"
          : "ސޮއި ކޯމިއުކުރެވިއްޖެ!",
        "success",
      );

      // Reset form
      setName("");
      setIdCardDigits("");
      setConsent(false);
      signaturePadRef.current?.clear();
    } catch (error) {
      showMessage(
        language === "en"
          ? `Failed to submit signature: ${error instanceof Error ? error.message : "Unknown error"}`
          : "ސޮއި ހުށަހެޅުމުން ކުށެއް ދިމާވެއްޖެ.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-100">
      <h3
        className={`text-xl font-semibold text-slate-900 mb-8 ${isRtl ? "dhivehi" : ""}`}
      >
        {language === "en"
          ? "Sign this Petition"
          : "މި މައްސަލައިގައި ސޮއި ކުރައްވާ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-3">
          <Label
            htmlFor="name"
            className={`text-slate-700 ${isRtl ? "dhivehi" : ""}`}
          >
            {language === "en" ? "Full Name (As on ID card)" : "ފުރިހަމަ ނަން"}
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            maxLength={30}
            required
            className={isRtl ? "text-right" : ""}
            placeholder={language === "en" ? "Enter your full name" : ""}
          />
        </div>

        {/* ID Card Field */}
        <div className="space-y-3">
          <Label
            htmlFor="idCard"
            className={`text-slate-700 ${isRtl ? "dhivehi" : ""}`}
          >
            {language === "en" ? "ID Card Number" : "ކާޑު ނަންބަރު"}
          </Label>
          <div
            className={`flex items-center w-full sm:w-64 border border-input rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <span className="px-4 py-2 font-semibold text-slate-500 bg-slate-50 border-r border-slate-100">
              A
            </span>
            <Input
              id="idCard"
              type="tel"
              inputMode="numeric"
              pattern="\d{6}"
              value={idCardDigits}
              onChange={(e) =>
                setIdCardDigits(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
              placeholder="XXXXXX"
              className="border-0 focus-visible:ring-0 text-left shadow-none"
              dir="ltr"
            />
          </div>
        </div>

        {/* Signature Pad */}
        <div className="space-y-3">
          <Label className={`text-slate-700 ${isRtl ? "dhivehi" : ""}`}>
            {language === "en" ? "Signature" : "ސޮއި"}
          </Label>
          <div className="border border-input rounded-lg overflow-hidden shadow-sm hover:border-ring/50 transition-colors">
            <SignaturePad ref={signaturePadRef} />
          </div>
          <p className="text-xs text-slate-500">
            {language === "en"
              ? "Sign in the box above"
              : "މަތީގައިވާ ގޮޅީގައި ސޮއި ކުރައްވާ"}
          </p>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked === true)}
            className="mt-1"
          />
          <Label
            htmlFor="consent"
            className={`text-sm leading-relaxed cursor-pointer text-slate-600 ${isRtl ? "dhivehi" : ""}`}
          >
            {language === "en"
              ? "I acknowledge my signature and information will be sent to the Parliament Petition Committee, and that the information I provide is true."
              : "މި ޕެޓިޝަނުގައިވާ މައުލޫމާތާއި އަޅުގަނޑުގެ ސޮއި ރައްޔިތުންގެ މަޖިލީހުގެ ޕެޓިޝަން ކޮމިޓީއަށް ހުށަހެޅޭނެކަން އަޅުގަނޑު އިޤްރާރުވަމެވެ. އަދި އަޅުގަނޑު ދީފައިވާ މައުލޫމާތަކީ ތެދު މައުލޫމާތެވެ."}
          </Label>
        </div>

        {/* Message Display */}
        {message && (
          <Alert
            variant={message.type === "error" ? "destructive" : "default"}
            className="animate-in fade-in slide-in-from-top-2"
          >
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Turnstile */}
        <div className="flex justify-center sm:justify-start">
          <Turnstile
            siteKey="0x4AAAAAACHH4QC3wIhkCuhd"
            onSuccess={setTurnstileToken}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
          />
        </div>

        {/* Form Buttons */}
        <div className={`flex gap-4 pt-4 ${isRtl ? "flex-row-reverse" : ""}`}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className={`text-slate-500 hover:text-slate-900 ${isRtl ? "dhivehi" : ""}`}
          >
            <Eraser className="h-4 w-4 mr-2" />
            {language === "en" ? "Clear Signature" : "ފޮހެލާ"}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className={`min-w-[140px] shadow-md hover:shadow-lg transition-all ${isRtl ? "dhivehi" : ""}`}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {language === "en" ? "Submit Petition" : "ހުށަހެޅުއް"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { PetitionDetails, Language } from "@/types/petition";

// X/Twitter icon from Simple Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

interface TweetModalProps {
  open: boolean;
  onClose: () => void;
  petition: PetitionDetails;
  language: Language;
}

export function TweetModal({
  open,
  onClose,
  petition,
  language,
}: TweetModalProps) {
  const generateTweetText = () => {
    const petitionName =
      language === "dv" ? petition.nameDhiv : petition.nameEng;
    const petitionUrl = `${window.location.origin}${window.location.pathname}?id=${petition.id}`;

    return `I just signed "${petitionName}"! \n\nAdd your signature: ${petitionUrl}`;
  };

  const openTwitterIntent = () => {
    const tweetText = generateTweetText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, "_blank");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={language === "dv" ? "dhivehi" : ""}>
            {language === "en"
              ? "Share this petition!"
              : "މި ޕެޓިޝަން ހިއްސާކުރައްވާ!"}
          </DialogTitle>
          <DialogDescription className={language === "dv" ? "dhivehi" : ""}>
            {language === "en"
              ? "Help spread the word by sharing this petition with your friends."
              : "މި ޕެޓިޝަންގައި ވީހާވެސް ގިނަ ބަޔަކު ބައިވެރިކުރުމަށްޓަކައި އެކްސްގައި ޕޯސްޓް ކޮށްދެއްވާ."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={openTwitterIntent}
            className={`w-full bg-black hover:bg-neutral-800 ${language === "dv" ? "dhivehi" : ""}`}
          >
            {language === "en" ? "Share on" : "ޕޯސްޓް ކުރައްވާ"}
            <XIcon className="h-4 w-4 ml-2" />
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
            className={`w-full ${language === "dv" ? "dhivehi" : ""}`}
          >
            {language === "en" ? "Maybe Later" : "ފަހުން"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

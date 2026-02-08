export function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
          <span>Powered by Mv Devs Union</span>
          <a
            href="https://github.com/MvDevsUnion/WPetition/blob/master/privacy_policy.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-700 transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}

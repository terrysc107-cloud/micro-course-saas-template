import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "./labs.css";

export default function LabShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lab-shell">
      <a className="lab-skip" href="#lab-main">
        Skip to content
      </a>
      <header className="lab-header">
        <div className="lab-container lab-nav">
          <Link
            href="/build-lab"
            className="lab-wordmark"
            aria-label="AIxDesign Build Lab home"
          >
            <span className="lab-mark" aria-hidden="true">
              a<span>×</span>
            </span>
            <span>
              AI<span className="lab-times">×</span>Design
              <small>THE BUILD LAB SERIES</small>
            </span>
          </Link>
          <nav aria-label="Build Lab">
            <Link href="/build-lab#the-method">The method</Link>
            <Link href="/build-lab#labs">Explore labs</Link>
            <a href="https://aixdesign.dev/guide">Free guide</a>
            <Link className="lab-nav-studio" href="/lab-studio">
              My workspace <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
      <main id="lab-main">{children}</main>
      <footer className="lab-footer lab-container">
        <div>
          <Link href="https://aixdesign.dev" className="lab-footer-brand">
            AI×Design
          </Link>
          <p>Build the system. Learn to lead it.</p>
        </div>
        <div>
          <Link href="/">My AI Board course</Link>
          <Link href="/build-lab/privacy">Your information</Link>
          <Link href="mailto:hello@aixdesign.dev">Contact us</Link>
        </div>
        <p className="lab-small">
          Independent education by AI by Design. Not affiliated with or endorsed
          by OpenAI or Anthropic.
        </p>
      </footer>
    </div>
  );
}

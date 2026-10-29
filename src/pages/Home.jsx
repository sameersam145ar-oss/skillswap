import { Link } from "react-router-dom";
import "./Home.css";

const FEATURES = [
  {
    icon: "👤",
    title: "Show what you know",
    text: "Build a profile around the skills you love sharing and the ones you want to discover.",
  },
  {
    icon: "🔍",
    title: "Find your people",
    text: "Search by skill and connect with learners who are a great fit for you.",
  },
  {
    icon: "🤝",
    title: "Make a fair swap",
    text: "Agree on an exchange that works for both of you—no money, just shared know-how.",
  },
  {
    icon: "📅",
    title: "Learn together",
    text: "Plan sessions, keep track of your progress and make every skill count.",
  },
  {
    icon: "⭐",
    title: "Grow with trust",
    text: "Share feedback after a session and help make the community even better.",
  },
  {
    icon: "🌱",
    title: "Keep discovering",
    text: "Every new connection is a chance to learn something you never expected.",
  },
];

const STEPS = [
  {
    title: "Share your skills",
    text: "Tell the community what you can teach and what you are curious to learn.",
  },
  {
    title: "Meet your match",
    text: "Browse profiles and find someone whose skills complement yours.",
  },
  {
    title: "Swap and grow",
    text: "Set up a session, exchange knowledge and celebrate your progress.",
  },
];

function Home() {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            A community built on sharing
          </span>
          <h1 className="hero-title">
            Your next skill is <span className="hero-highlight">one swap away.</span>
          </h1>
          <p className="hero-subtitle">
            Teach something you love. Learn something you have always wanted.
            SkillSwap brings curious people together—no money, just know-how.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="home-button home-button-primary">
              Start swapping <span aria-hidden="true">→</span>
            </Link>
            <Link to="/users" className="home-button home-button-outline">
              Explore skills
            </Link>
          </div>
          <div className="hero-note">
            <span className="hero-note-icon" aria-hidden="true">✦</span>
            Your knowledge has value. Share it.
          </div>
        </div>

        <div className="hero-visual" aria-label="A sample skill exchange">
          <div className="visual-orbit visual-orbit-one" />
          <div className="visual-orbit visual-orbit-two" />
          <div className="swap-card">
            <div className="swap-card-heading">
              <span className="swap-card-label">A little give, a lot to gain</span>
              <span className="swap-sparkle" aria-hidden="true">✦</span>
            </div>
            <div className="swap-person">
              <div className="swap-avatar swap-avatar-lavender" aria-hidden="true">A</div>
              <div className="swap-person-copy">
                <span className="swap-person-name">Alex teaches</span>
                <span className="swap-skill">🎨 &nbsp;Watercolor painting</span>
              </div>
              <span className="swap-arrow" aria-hidden="true">↗</span>
            </div>
            <div className="swap-divider">
              <span>SKILL SWAP</span>
            </div>
            <div className="swap-person">
              <div className="swap-avatar swap-avatar-peach" aria-hidden="true">J</div>
              <div className="swap-person-copy">
                <span className="swap-person-name">Jamie teaches</span>
                <span className="swap-skill">💻 &nbsp;Web development</span>
              </div>
              <span className="swap-arrow" aria-hidden="true">↙</span>
            </div>
            <div className="swap-card-footer">
              <span className="swap-check" aria-hidden="true">✓</span>
              <span>Two curious minds. One great exchange.</span>
            </div>
          </div>
          <div className="floating-note floating-note-top">
            <span aria-hidden="true">✧</span> Learn something new
          </div>
          <div className="floating-note floating-note-bottom">
            <span aria-hidden="true">♥</span> Share what you love
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="section-eyebrow">Make your know-how go further</span>
          <h2 className="section-title">Good things happen when we share.</h2>
          <p className="section-subtitle">
            Find a thoughtful way to learn, teach and meet people who are just as curious as you.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((feature, index) => (
            <article key={feature.title} className="feature-card">
              <div className={`feature-icon feature-icon-${index + 1}`} aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-text">{feature.text}</p>
              <span className="feature-card-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <div className="home-section steps-section-inner">
          <div className="section-heading">
            <span className="section-eyebrow">Simple by design</span>
            <h2 className="section-title">Three steps to a new skill.</h2>
            <p className="section-subtitle">
              Start with what you know. Leave with something new.
            </p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, index) => (
              <article key={step.title} className="step-card">
                <div className="step-number">{String(index + 1).padStart(2, "0")}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-text">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-decoration" aria-hidden="true">✦</div>
        <span className="cta-eyebrow">Your next chapter starts here</span>
        <h2 className="cta-title">Ready to share a little brilliance?</h2>
        <p className="cta-text">
          Join SkillSwap and turn what you know into what you would love to learn.
        </p>
        <Link to="/register" className="cta-button">
          Create your free account <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}

export default Home;

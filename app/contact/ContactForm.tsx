"use client";

import { useState } from "react";

// no backend: the form composes a mail draft in the visitor's own client
export default function ContactForm({ to }: { to: string }) {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const subject = String(f.get("subject") || "Project inquiry");
        const body = `${f.get("message")}\n\n— ${f.get("name")} (${f.get("email")})`;
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setSent(true);
      }}
    >
      <div className="field-row">
        <label>
          Your Name
          <input name="name" required placeholder="John Doe" />
        </label>
        <label>
          Email Address
          <input name="email" type="email" required placeholder="john@example.com" />
        </label>
      </div>

      <label>
        Subject
        <input name="subject" placeholder="Project Inquiry / Collaboration" />
      </label>

      <label>
        Message
        <textarea name="message" rows={6} required placeholder="Tell me about your vision..." />
      </label>

      <button type="submit">Send Message ↗</button>
      {sent && <p className="form-note">Opening your mail app — if nothing happens, write to {to}.</p>}
    </form>
  );
}

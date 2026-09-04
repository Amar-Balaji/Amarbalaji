import ContactForm from "./ContactForm";
import PillNav from "../PillNav";
import Credit from "../Credit";
import { sanityFetch } from "../../lib/sanity";

export const revalidate = 60;

type Contact = {
  heading?: string;
  email?: string;
  phone?: string;
  availability?: string;
  socials?: { _key: string; label: string; href: string }[];
};

export default async function ContactPage() {
  const c = await sanityFetch<Contact>(`*[_type=="contact"][0]`);
  const email = c?.email ?? "amarbalaji.r@gmail.com";

  return (
    <main className="contact">
      <h1>CONTACT</h1>

      <div className="contact-grid">
        <div className="contact-details">
          <div>
            <p className="c-label">Email</p>
            <a href={`mailto:${email}`}>{email}</a>
          </div>

          {c?.phone && (
            <div>
              <p className="c-label">Phone</p>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a>
            </div>
          )}

          {c?.availability && (
            <div>
              <p className="c-label">Availability</p>
              <p className="c-value">{c.availability}</p>
            </div>
          )}

          {!!c?.socials?.length && (
            <div>
              <p className="c-label muted">Connect</p>
              <div className="chips">
                {c.socials.map((s) => (
                  <a className="chip" key={s._key} href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <ContactForm to={email} />
      </div>

      <Credit />

      <PillNav />
    </main>
  );
}

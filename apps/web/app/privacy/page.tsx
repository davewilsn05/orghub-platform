import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — OrgHub",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "40px 20px",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 4 }}>
        Privacy Policy
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Last updated: March 6, 2026
      </p>

      <p>
        OrgHub (&quot;the Platform,&quot; &quot;we,&quot; &quot;us&quot;)
        provides a members portal platform for nonprofit organizations, lodges,
        and community groups. This policy explains what personal information we
        collect, how we use it, and your choices regarding that information.
      </p>

      <p>
        OrgHub is a multi-tenant platform. Each organization on OrgHub manages
        its own member data. This policy covers the data we collect and process
        on behalf of organizations using OrgHub.
      </p>

      <Section title="1. Information We Collect">
        <h4>Organization Admin Account</h4>
        <ul>
          <li>Full name, email address, and password (hashed, never stored in plain text)</li>
          <li>Organization name, type, and URL slug</li>
        </ul>

        <h4>Member Profile Data (per organization)</h4>
        <ul>
          <li>Full name and email address</li>
          <li>Phone number (optional)</li>
          <li>Profile photo / avatar (optional)</li>
          <li>Membership role (member, committee chair, board, admin)</li>
          <li>Membership status and join date</li>
          <li>Dues payment status (if Stripe is configured)</li>
        </ul>

        <h4>Activity Data</h4>
        <ul>
          <li>Event RSVPs</li>
          <li>Newsletter interactions</li>
          <li>Committee memberships</li>
          <li>Messages sent through the portal</li>
          <li>Volunteer activities</li>
        </ul>

        <h4>Payment Data</h4>
        <ul>
          <li>
            Membership dues and event ticket payments are processed by{" "}
            <strong>Stripe</strong>. Each organization connects its own Stripe
            account. We do not store credit card numbers or bank account
            details. Stripe&apos;s privacy policy governs payment data:{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb" }}
            >
              stripe.com/privacy
            </a>
          </li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul>
          <li>Operate and maintain member accounts and portal access</li>
          <li>Process membership dues and event ticket purchases</li>
          <li>Send transactional emails (invitations, confirmations, password resets, renewal reminders, newsletters)</li>
          <li>Display member information within the organization&apos;s portal (subject to org admin settings)</li>
          <li>Coordinate committees, events, and volunteer activities</li>
          <li>Improve the platform</li>
        </ul>
      </Section>

      <Section title="3. Data Isolation">
        <p>
          OrgHub enforces strict data isolation between organizations.
          Row-level security policies ensure that members of one organization
          cannot access data belonging to another organization. Each
          organization&apos;s data is scoped to its own tenant boundary.
        </p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>
          We use the following services to operate the platform. Each has its
          own privacy policy:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — database hosting and authentication
          </li>
          <li>
            <strong>Google Sign-In</strong> — optional OAuth login (organizations
            may enable Google sign-in for their members)
          </li>
          <li>
            <strong>Stripe</strong> — payment processing (configured per
            organization)
          </li>
          <li>
            <strong>Resend</strong> — transactional email delivery
          </li>
          <li>
            <strong>OpenAI</strong> — AI assistant feature (admin-initiated;
            conversations may reference event and member summary data)
          </li>
          <li>
            <strong>Zoom</strong> — virtual meeting integration (optional per
            organization)
          </li>
          <li>
            <strong>Vercel</strong> — web application hosting
          </li>
        </ul>
        <p>
          We do not sell, rent, or trade personal information to any third party
          for marketing purposes.
        </p>
      </Section>

      <Section title="5. Cookies &amp; Tracking">
        <p>
          OrgHub uses only <strong>essential cookies</strong> required for
          authentication (Supabase session tokens). We do not use Google
          Analytics, advertising pixels, or any third-party tracking scripts.
        </p>
      </Section>

      <Section title="6. Calendar Feed">
        <p>
          Organizations may enable a public iCal calendar subscription feed
          containing event titles, dates, locations, and descriptions. Calendar
          feeds do not include any member personal data.
        </p>
      </Section>

      <Section title="7. Data Retention">
        <p>
          Member data is retained for as long as the member&apos;s account is
          active within their organization. Organization admins may deactivate
          or remove member accounts. If an organization closes its OrgHub
          account, all associated data is deleted within 30 days, except where
          required for legal purposes (e.g., financial transaction records).
        </p>
      </Section>

      <Section title="8. Data Security">
        <p>
          We protect information with industry-standard measures including
          encrypted connections (HTTPS), hashed passwords, row-level database
          security policies, and role-based access controls. Organization data
          is isolated at the database level using Supabase row-level security.
        </p>
      </Section>

      <Section title="9. Your Rights">
        <p>You may at any time:</p>
        <ul>
          <li>View and edit your profile information</li>
          <li>Request a copy of the personal data we hold about you</li>
          <li>Request deletion of your account and personal data</li>
        </ul>
        <p>
          California residents may have additional rights under the California
          Consumer Privacy Act (CCPA). To exercise any of these rights, contact
          your organization&apos;s administrator or email us directly.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We may update this privacy policy from time to time. Material changes
          will be communicated via the platform or email. Continued use of the
          platform after changes are posted constitutes acceptance of the
          updated policy.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          Questions about this privacy policy or your personal data? Contact us:
        </p>
        <ul>
          <li>
            Email:{" "}
            <a href="mailto:support@orghub.app" style={{ color: "#2563eb" }}>
              support@orghub.app
            </a>
          </li>
        </ul>
      </Section>

      <div style={{ marginTop: 32 }}>
        <Link href="/" style={{ color: "#2563eb" }}>
          ← Back to home
        </Link>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

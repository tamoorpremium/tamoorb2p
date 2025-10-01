// src/pages/PrivacyPolicy.tsx
import React from "react";
import { motion } from "framer-motion";
import { PdfGenerator } from "../utils/PdfGenerator";

const sections = [
  { id: "intro", title: "Introduction & Scope" },
  { id: "collection", title: "1. Information We Collect" },
  { id: "use", title: "2. How We Use Your Information" },
  { id: "cookies", title: "3. Cookies, Tracking & Similar Technologies" },
  { id: "sharing", title: "4. Sharing, Disclosure & Third Parties" },
  { id: "thirdparty", title: "5. Links to Other Websites and Services" },
  { id: "security", title: "6. Security Measures and Risk Acknowledgement" },
  { id: "retention", title: "7. Data Retention and Deletion" },
  { id: "rights", title: "8. Your Rights & Choices" },
  { id: "children", title: "9. Children and Minors" },
  { id: "ads", title: "10. Advertising, Analytics & Marketing" },
  { id: "consent", title: "11. Consent and Legal Basis" },
  { id: "crossborder", title: "12. International & Cross-Border Transfers" },
  { id: "grievance", title: "13. Grievance Officer / Data Protection Officer" },
  { id: "changes", title: "14. Changes to this Policy" },
  { id: "contact", title: "15. Contact Us" },
];

const contentMap: Record<string, string> = {
  intro: `Tamoor ("Tamoor", "we", "us", or "our") respects the privacy of visitors to our website, users of our mobile applications, and customers who purchase products or services through our platform (collectively, the "Platform"). This Privacy Policy explains the types of information we collect, how we use and protect that information, the choices you have regarding our use of your information, and how you can contact us. This Privacy Policy is incorporated into and subject to Tamoor’s Terms of Service and is governed by applicable Indian laws, including the Information Technology Act, 2000, and related rules. By accessing or using the Platform or by providing information to us, you consent to the collection, use, disclosure, and processing of your information in accordance with this Privacy Policy. If you do not agree with the practices described in this Policy, please do not use the Platform or provide personal information to us.`,

  collection: `We collect information that you voluntarily provide to us, information collected automatically when you use the Platform, and information obtained from third parties or partners. Voluntary information includes registration and profile data (such as name, email, mobile number, delivery and billing addresses), transaction information (order details, payment method identifiers, invoices), KYC and government-issued identifiers when required (such as PAN, GSTIN, Aadhaar or other IDs for B2B/GST invoicing or regulatory compliance), customer support correspondence (emails, chat transcripts, call recordings when you contact support), feedback, and any other content you choose to provide (reviews, photos, contest entries).

Automatically collected information may include device identifiers, IP addresses, browser and operating system details, cookie identifiers, location data (as permitted by your device settings), clickstream and usage patterns, referral URLs, and aggregated behavioural data. We may also receive information about you from third-party sources, including payment processors, logistics partners, analytics providers, advertising partners, and public databases. Where we combine information from multiple sources, we aim to maintain accurate and up-to-date records and to use such combined information consistent with the purposes described in this Policy.`,

  use: `We use personal information for a range of operational purposes necessary to provide our services, to improve the Platform, and to protect Tamoor and our users. These purposes include: (a) processing and fulfilling orders, processing payments, issuing invoices, and communicating order status; (b) providing customer support, resolving disputes, and investigating complaints; (c) personalizing the user experience, recommending products, and providing targeted offers where permitted; (d) conducting analytics, market research, and business intelligence to enhance product offerings and Platform performance; (e) preventing, detecting and investigating fraud, abuse, security incidents and other illegal activities; (f) enforcing our Terms of Service and other policies; (g) complying with legal and regulatory obligations, including tax, customs, KYC, anti-money laundering, and credit checks where required; and (h) contacting you with transactional or promotional messages where permitted and where you have not opted out.

We will only use sensitive personal information (such as government identifiers, authentication data or financial account numbers) where we have a lawful basis for doing so, which may include your consent, the necessity to perform a contract, compliance with legal obligations, or other legal bases permitted under applicable law.`,

  cookies: `We, and our service providers, use cookies, web beacons, local storage, device identifiers and similar technologies to collect usage information and to enable certain features of the Platform. Cookies may be "session" cookies (deleted when you close your browser) or persistent cookies (which remain on your device for a period). We use cookies for purposes such as authentication, maintaining user sessions, storing language or display preferences, personalizing content, measuring and improving the performance of the Platform, and advertising and analytics.

Most browsers allow you to control cookie settings (including blocking or deleting cookies). Blocking or deleting certain cookies may affect your ability to use all features of the Platform. Third parties that place cookies through the Platform (e.g., advertising networks or analytics providers) may use technology to collect information about your online activities over time and across different websites. We do not control third-party cookie practices and recommend reviewing their privacy policies.`,

  sharing: `We may share personal information with other Tamoor corporate entities, subsidiaries, service providers, sellers, logistics partners, payment processors, analytics vendors, advertising partners, and other third parties in order to provide you with our products and services. Such disclosures are permitted only to the extent necessary to perform the function (for example, sharing shipping address information with logistics partners to deliver your order or sharing payment tokens with payment gateways to complete a transaction).

Tamoor does not sell your personal information for third-party marketing purposes without your explicit consent. We may, however, share aggregated or anonymized data that cannot reasonably be used to identify you. We may also disclose personal information when required by law or to respond to valid legal process, to protect Tamoor’s rights, to prevent fraud or imminent harm, or to cooperate with law enforcement or government agencies. If Tamoor is involved in a merger, acquisition, sale of assets or restructuring, personal information may be transferred to a successor entity, subject to appropriate confidentiality and legal protections.`,

  thirdparty: `The Platform may contain links to third-party websites, apps, plugins, or services that are not operated by Tamoor. These links are provided for convenience and do not imply endorsement. Third parties have their own privacy practices, and we are not responsible for their content or practices. If you click on a third-party link, you will be subject to the privacy policy of that site or service. We encourage you to read third-party privacy notices carefully before providing personal information.`,

  security: `Tamoor implements reasonable physical, administrative and technical safeguards designed to protect personal information against unauthorized access, use, modification, disclosure and destruction. These safeguards include access controls, encryption in transit, regular security assessments, network monitoring and industry-standard security practices. While we strive to protect your personal information, no security measures can guarantee absolute security. By using the Platform you acknowledge and accept the inherent risks associated with transmitting information online. You are responsible for maintaining the confidentiality of your account credentials and for restricting access to your devices. If you become aware of any unauthorized use of your account or any other breach of security, you must notify us immediately.`,

  retention: `We retain personal information for as long as necessary to fulfill the purposes for which it was collected, to comply with legal obligations, resolve disputes, support business operations, and enforce agreements. Retention periods vary depending on the type of information and the purposes for which it is processed, but we apply reasonable retention schedules and deletion procedures. Where we retain information for analytics or research purposes, we will first take steps to anonymize or aggregate the data to the extent feasible. If you request deletion of your account, we will delete or anonymize your personal data subject to any legal obligations to retain certain records (for example, to comply with tax or other statutory recordkeeping requirements).`,

  rights: `Subject to applicable law, you have rights regarding your personal information, including the right to access, correct, update, or delete inaccurate or incomplete information; to object to or restrict processing; to request portability of your data; and to withdraw consent where processing is based on consent. To exercise these rights or to request information regarding the personal data we hold about you, please contact our Grievance Officer/Data Protection Officer as described below. Tamoor may require you to verify your identity before responding to such requests and may refuse requests that are frivolous, duplicate, or that would adversely affect the rights of others or public safety.`,

  children: `Tamoor does not knowingly collect personal information from children under the age of 13. Access to the Platform is intended for persons who can form legally binding contracts under applicable law. If we become aware that personal information of a minor has been collected without appropriate parental consent, we will take steps to delete the information as required by law. Parents and guardians who believe that Tamoor has collected personal information about their child should contact our Grievance Officer immediately.`,

  ads: `We and our partners may use third-party advertising companies and analytics providers to serve ads and to analyze user interactions with our Platform. These partners may collect information about your visits to the Platform and other websites in order to provide advertisements about goods and services of interest to you. Such information may be used to build anonymous profiles and target advertising. Tamoor does not provide personal contact information (such as your name or telephone number) to advertising networks unless you explicitly consent. You may opt-out of targeted advertising through device/browser settings or through third-party opt-out mechanisms where available.`,

  consent: `By using the Platform or providing personal information to Tamoor, you consent to the processing of your personal data in accordance with this Privacy Policy and applicable law. Where lawful basis for processing is consent, you may withdraw consent at any time, although withdrawal will not affect processing which occurred prior to withdrawal. Certain services or features may require that you consent to the processing of specific categories of data (for example, KYC or invoicing details for GST-compliant invoices); refusal to provide such data may make those services unavailable.`,

  crossborder: `To operate our business globally, Tamoor may transfer and store personal information outside your country of residence. Where data is transferred internationally, we will ensure that appropriate safeguards are in place, such as standard contractual clauses, privacy frameworks, or other legally recognized mechanisms to protect your personal information in accordance with applicable law.`,

  grievance: `Pursuant to the Information Technology (Intermediary Guidelines) Rules and other applicable law, Tamoor has designated a Grievance Officer / Data Protection Officer to address grievances and privacy-related requests. You may contact our officer at: 

Grievance Officer / Data Protection Officer
Email: dpo@tamoor.in
Phone: +91-72599 66388
Postal Address: Tamoor - A Unit of FIFA FOODS, Rahmania Complex, Doddapete, Kolar, Karnataka, India

We will make reasonable efforts to acknowledge and address grievances in a timely manner in accordance with applicable law.`,

  changes: `Tamoor may update this Privacy Policy from time to time to reflect changes in our business practices, legal obligations, or regulatory requirements. We will post the revised Policy on the Platform with an updated "Last updated" date. Significant changes that materially affect how we use personal information may be notified to you by email or through notices on the Platform as required by law. Your continued use of the Platform after the posting of changes constitutes acceptance of those updates.`,

  contact: `If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:

Email: care@tamoor.in
Phone: +91-72599 66388
Postal Address: Tamoor - A Unit of FIFA FOODS, Rahmania Complex, Doddapete, Kolar, Karnataka, India

For legal notices, please address correspondence to the Postal Address above and mark it for the attention of the Grievance Officer/Data Protection Officer.`,
};

const PrivacyPolicy: React.FC = () => {
  const pdfSections = sections.map((s) => ({
    title: s.title,
    content: contentMap[s.id] || "",
  }));

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#0b0b0b,_#111827)] text-gray-100 px-4 sm:px-8 py-12">
      <motion.main
        className="max-w-6xl mx-auto bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-400">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-300">Last updated: September 2025</p>

          {/* PDF Download Button */}
          <div className="mt-4">
            <PdfGenerator title="Privacy Policy" sections={pdfSections} />
          </div>
        </header>

        <section className="mt-8 text-gray-200 space-y-6">
          <p className="leading-relaxed">{contentMap.intro}</p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-amber-300 mb-3">Table of Contents</h2>
            <ol className="list-decimal list-inside text-gray-300 space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:text-amber-400">{s.title}</a>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 space-y-8">
            {sections.map((s) => (
              <article key={s.id} id={s.id}>
                <details className="group bg-white/3 rounded-2xl p-4" open>
                  <summary className="cursor-pointer list-none flex items-center justify-between">
                    <h3 className="text-xl font-bold text-amber-300">{s.title}</h3>
                    <span className="ml-4 text-sm text-gray-300 group-open:rotate-180 transition-transform">▾</span>
                  </summary>

                  <div className="mt-3 text-justify text-gray-200 leading-relaxed whitespace-pre-line">
                    {contentMap[s.id as keyof typeof contentMap]}
                  </div>
                </details>
              </article>
            ))}
          </div>

          <footer className="mt-10 text-sm text-gray-400 text-center">
            <p>
              This Privacy Policy should be read together with Tamoor’s Terms of Service and Returns Policy. For assistance or to exercise your rights, contact us at <a href="mailto:care@tamoor.in" className="text-amber-300 hover:underline">care@tamoor.in</a>.
            </p>

            <p className="mt-3 font-serif font-extrabold">© {new Date().getFullYear()} Tamoor — All rights reserved.</p>
          </footer>
        </section>
      </motion.main>
    </div>
  );
};

export default PrivacyPolicy;

// src/pages/Terms.tsx
import React from "react";
import { motion } from "framer-motion";
import { PdfGenerator } from "../utils/PdfGenerator"; // Make sure this exists like in PrivacyPolicy

const sections = [
  { id: "eligibility", title: "1. Eligibility and User Agreement" },
  { id: "intellectual", title: "2. Intellectual Property Rights" },
  { id: "accuracy", title: "3. Accuracy of Information and Content Disclaimer" },
  { id: "products", title: "4. Products, Services, and Availability" },
  { id: "pricing", title: "5. Pricing, Payments, and Billing Accuracy" },
  { id: "orders", title: "6. Order Acceptance, Fulfilment, and Cancellation" },
  { id: "returns", title: "7. Returns, Refunds, and Replacements" },
  { id: "obligations", title: "8. User Obligations and Prohibited Activities" },
  { id: "thirdparty", title: "9. Third-Party Links, Content, and Services" },
  { id: "liability", title: "10. Limitation of Liability" },
  { id: "indemnification", title: "11. Indemnification" },
  { id: "termination", title: "12. Termination of Access" },
  { id: "law", title: "13. Governing Law and Jurisdiction" },
  { id: "severability", title: "14. Severability" },
  { id: "entire", title: "15. Entire Agreement" },
  { id: "amendments", title: "16. Amendments and Updates" },
  { id: "contact", title: "17. Contact Information" },
];

const contentMap: Record<string, string> = {
  intro: `This document (“Agreement”, “Terms of Service”) is an electronic record under the Information Technology Act, 2000 and the rules framed thereunder, including the Information Technology (Intermediaries Guidelines) Rules, 2011, and is published in accordance with the legal requirements to ensure transparency and compliance. By accessing, browsing, or using www.tamoor.in ( “Site”, “Tamoor”, “Company”, “we”, “our”, or “us”), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service, as well as all applicable laws, rules, and regulations. If you do not agree, you are advised not to use this Site or avail of any services.

These Terms apply to all users of the Site, including customers, browsers, suppliers, merchants, resellers, and contributors of content. Your continued use of the Site constitutes your acceptance of these Terms in full.`,
  
  eligibility: `The Site is intended for use only by individuals who are legally capable of entering into binding contracts under the Indian Contract Act, 1872. Persons who are “incompetent to contract” as defined under the Act, including minors and persons of unsound mind, are not eligible to use this Site. If you are below 18 years of age, you may use the Site only under the direct supervision of a parent or legal guardian, who agrees to be bound by these Terms on your behalf. Children under the age of 13 are strictly prohibited from using this Site, and any data collected inadvertently shall be deleted permanently in compliance with child data protection norms.

By registering, transacting, or using the Site in any manner, you warrant that the information you provide is truthful, accurate, complete, and current. You further agree not to impersonate another person, not to provide false details, and not to engage in fraudulent conduct. Tamoor reserves the right to refuse service, terminate accounts, or cancel orders if it has reason to believe that user eligibility has not been satisfied or that the Site has been misused.`,
  
  intellectual: `All intellectual property displayed on this Site, including but not limited to product images, photographs, videos, written descriptions, artwork, layouts, user interfaces, software code, logos, trademarks, service marks, brand names, slogans, digital media, and all other proprietary content, is and shall remain the exclusive property of Tamoor. These materials are protected by Indian and international copyright, trademark, and design laws.

Unauthorized copying, modification, reproduction, distribution, transmission, public display, or republication of any material from the Site without Tamoor’s prior written permission constitutes an infringement and may result in civil and criminal liability. Customers, suppliers, affiliates, or competitors are expressly forbidden from using Tamoor’s intellectual property for comparative advertising, product imitation, counterfeit sales, or any purpose that may dilute the distinctiveness of Tamoor’s luxury brand identity.`,
  
  accuracy: `Tamoor makes reasonable efforts to ensure that product details, prices, availability, nutritional information (if applicable), and promotional offers listed on the Site are accurate and up to date. However, the Site may contain typographical errors, omissions, or outdated information. Such errors may relate to product descriptions, pricing, shipping charges, promotional availability, or stock status.

We reserve the right to correct any inaccuracies, modify or update content, and cancel any orders placed on the basis of such incorrect information, without prior notice. Customers agree and acknowledge that Tamoor shall not be liable for any direct or indirect damages caused by reliance on inaccurate or incomplete information displayed on the Site.`,
  
  products: `Tamoor sells luxury dry fruits and related products that are subject to seasonal availability, packaging variations, and limited stock conditions. The appearance, color, size, or presentation of products may differ slightly due to manufacturing processes, storage conditions, or digital display differences. Such variations shall not be deemed as defects.

We reserve the absolute right to discontinue any product, restrict quantities per order or per customer, impose purchase limitations, or refuse sales to resellers or distributors. Products may also be restricted based on region-specific regulations, customs policies, or licensing requirements. Tamoor does not guarantee that all products will be available at all times or in all regions.`,
  
  pricing: `All prices listed on the Site are denominated in Indian Rupees (INR) unless stated otherwise and are inclusive of applicable taxes where required. Prices are subject to change at any time without prior notice. While we endeavor to maintain accuracy, errors in pricing may occur, and in such cases, we reserve the right to refuse or cancel any orders placed for incorrectly priced items, even if payment has been processed.

Payments must be made through authorized third-party payment gateways. By completing a transaction, you confirm that the payment method used belongs to you and that you are legally entitled to use it. Tamoor shall not be liable for declined payments, unauthorized transactions, or delays caused by intermediaries. Fraudulent use of credit/debit cards, UPI IDs, or net banking facilities will result in order cancellation, and Tamoor may initiate legal proceedings for recovery of amounts and damages.`,
  
  orders: `Orders placed on the Site constitute offers to purchase products but are not binding until confirmed by Tamoor via email, SMS, or in-app notification. We reserve the right to refuse or cancel any order at our discretion, particularly in the event of stock unavailability, pricing inaccuracies, suspected fraud, excessive bulk purchases, violation of applicable laws, or breach of these Terms.

In case of cancellation by Tamoor, any amounts paid shall be refunded to the original method of payment. Customers acknowledge that order fulfillment timelines may vary due to logistical delays, customs clearances, or unforeseen circumstances, and Tamoor shall not be held liable for delays beyond its control.`,
  
  returns: `Tamoor operates a seven (7)-day return policy for products that are defective, damaged, expired, or incorrectly delivered. Customers must notify Tamoor’s support team within this period and provide supporting evidence such as photographs. All claims will be reviewed, and Tamoor reserves the right to approve or reject returns based on its sole discretion.

Refunds, once approved, shall be processed to the original payment method. Timelines may vary depending on banks or payment processors. Shipping charges, COD fees, handling charges, and certain surcharges may be non-refundable. Replacement products may be provided where feasible. Returns requested due to change of preference, taste, or minor packaging variations will not be entertained.`,
  
  obligations: `Users of the Site agree to comply with all applicable laws and refrain from conduct that harms Tamoor, its employees, customers, or reputation. Prohibited activities include but are not limited to: uploading or distributing malicious code or malware; engaging in fraudulent activities or payment abuse; misrepresenting identity; attempting unauthorized access to systems; scraping or mining Site data for commercial use; reselling products without authorization; and engaging in defamatory, harassing, or abusive conduct.

Any breach of these obligations may result in suspension of access, termination of accounts, denial of future services, and initiation of civil or criminal proceedings.`,
  
  thirdparty: `The Site may provide links to external websites, payment gateways, logistics providers, or social media platforms operated by third parties. These are provided solely for convenience. Tamoor does not endorse, control, or assume responsibility for the accuracy, legality, or reliability of third-party content or services. Any dealings you undertake with third parties shall be solely at your risk, and Tamoor disclaims all liability arising therefrom.`,
  
  liability: `To the maximum extent permitted by law, Tamoor disclaims all liability for indirect, incidental, special, or consequential damages, including but not limited to loss of profits, data, reputation, or business opportunities, arising from use of the Site or products. All products and services are provided on an “as is” and “as available” basis without warranties of any kind.

In no event shall Tamoor’s aggregate liability, whether in contract, tort, negligence, or otherwise, exceed the total amount paid by the customer for the specific order in dispute. Customers expressly agree that they use the Site at their sole risk.`,
  
  indemnification: `By using the Site, you agree to indemnify, defend, and hold harmless Tamoor, its affiliates, directors, officers, employees, partners, licensors, and agents from any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from your breach of these Terms, misuse of the Site, violation of applicable laws, or infringement of third-party rights. This indemnity shall survive termination of your use of the Site.`,
  
  termination: `Tamoor reserves the right to suspend or permanently terminate access to the Site and services at its discretion, with or without notice, for users who breach these Terms, engage in prohibited conduct, or act in a manner detrimental to the Company’s interests. Termination shall not affect obligations related to outstanding payments, indemnities, intellectual property, or liability limitations, which shall continue to remain in force.`,
  
  law: `These Terms shall be governed by and construed in accordance with the laws of India. Any dispute, claim, or controversy arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka. Customers agree to submit to such jurisdiction and waive objections on the grounds of venue or convenience.`,
  
  severability: `If any provision of these Terms is found to be unlawful, void, or unenforceable by a competent court, the remaining provisions shall continue in full force and effect, ensuring the validity of the Agreement as a whole.`,
  
  entire: `These Terms, along with Tamoor’s Privacy Policy, Returns Policy, and any other legal notices published on the Site, constitute the entire agreement between you and Tamoor. They supersede any prior agreements, understandings, or representations made, whether oral or written.`,
  
  amendments: `Tamoor reserves the unconditional right to amend, revise, or update these Terms at any time without prior notice. Any modifications will be effective immediately upon being posted on the Site. Continued use of the Site following such updates shall be deemed acceptance of the revised Terms. Customers are encouraged to review these Terms periodically.`,
  
  contact: `For queries, feedback, complaints, or clarifications regarding these Terms of Service, you may contact us at:

📧 care@tamoor.in

📞 +91-72599 66388

🏢 Tamoor - A Unit of FIFA FOODS,
office - Rahmania complex,doddapete, Kolar, Karnataka, India.`,
};

const pdfSections = sections.map((s) => ({
  title: s.title,
  content: contentMap[s.id] || "",
}));


const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#0b0b0b,_#111827)] text-gray-100 px-4 sm:px-8 py-12">
      <motion.main
        className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-400">
            Terms of Service & Conditions of Use
          </h1>
          <p className="mt-3 text-sm text-gray-300">Last updated: September 2025</p>
          {/* PDF Download Button */}
            <div className="mt-4">
            <PdfGenerator title="Terms of Service" sections={pdfSections} />
            </div>
        </header>

        <section className="mt-8 text-gray-200 space-y-6">
          <p className="leading-relaxed">{contentMap.intro}</p>

          {/* Table of contents */}
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

          {/* Sections */}
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
              These Terms shall be read along with Tamoor’s Privacy Policy and Returns Policy. For assistance, contact us at <a
                href="mailto:care@tamoor.in"
                className="text-amber-300 hover:underline"
              >care@tamoor.in</a> or call <span className="font-medium">+91-72599 66388</span>.
            </p>
            <p className="mt-3">© {new Date().getFullYear()} Tamoor — All rights reserved.</p>
          </footer>
        </section>
      </motion.main>
    </div>
  );
};

export default Terms;

// src/pages/ReturnsRefundPolicy.tsx
import React from "react";
import { motion } from "framer-motion";
import { PdfGenerator } from "../utils/PdfGenerator";

const sections = [
  { id: "general", title: "1. General Terms and Conditions" },
  { id: "eligibility", title: "2. Eligibility for Returns" },
  { id: "conditions", title: "3. Conditions for Returning Products" },
  { id: "process", title: "4. Process to Initiate a Return" },
  { id: "refund", title: "5. Refund Process" },
  { id: "cancellations", title: "6. Cancellations" },
  { id: "exclusions", title: "7. Exclusions from Refunds & Returns" },
  { id: "late", title: "8. Late or Missing Refunds" },
  { id: "replacements", title: "9. Replacements & Exchanges" },
  { id: "liability", title: "10. Legal & Liability Disclaimer" },
  { id: "contact", title: "11. Contact & Grievance Redressal" },
];

const contentMap: Record<string, string> = {
  general: `This Return & Refund Policy ("Policy") governs all returns, refunds, replacements, and cancellations for products purchased on www.tamoor.in ("Tamoor", "we", "our", or "us"). By purchasing from our website, you agree to abide by the terms of this Policy.

While Tamoor endeavors to provide a seamless shopping experience, certain restrictions are necessary to protect product quality, comply with food safety laws, and meet business, legal, and contractual obligations.`,
  
  eligibility: `You may return products purchased from Tamoor only under the following circumstances:

- You received a product that is damaged, defective, expired, or faulty.
- You received a product different from what was originally ordered.
- You received a shipment with missing items or incorrect quantities.

Tamoor does not accept returns for reasons of personal preference, taste, or minor variations in packaging or appearance, which do not impact product quality.`,

  conditions: `- Our return window lasts seven (7) days from the date of delivery. After 7 days, we cannot offer refunds, replacements, or exchanges.
- Products must be unused, unopened, and in the same condition as received.
- Original invoices, packaging, and batch numbers must be intact.
- Perishable products or items exposed to improper storage after delivery are not eligible for return.
- Replacement of a product will depend on stock availability at the time of the request.`,

  process: `To request a return or refund, please email care@tamoor.in within 3 days of delivery. Your email must include:

- Order ID and registered contact details.
- Product name and batch ID (visible on the packaging).
- Photographs of the product clearly showing the issue.
- A detailed description of the problem encountered.

Our support team will review your request and confirm eligibility before authorizing the return.`,

  refund: `Once the returned product is received and inspected, Tamoor will notify you of approval or rejection of the refund via email or phone call.

- **Prepaid Orders (Credit/Debit/Net Banking/UPI):** Refunds will be initiated within 5 working days of approval through our Payment Gateway Partners. The credited amount will reflect in your bank/card account within 7–14 working days or as per your bank’s policies.
- **Cash on Delivery Orders:** Customers must share a cancelled cheque, passbook copy, or bank statement with accurate account details. Refunds will be processed within 3 working days of approval.

Refunds are issued only to the original payment method or registered customer bank account.`,

  cancellations: `- Orders can be cancelled by customers before the order has been dispatched. Once shipped, cancellations will not be accepted.
- Tamoor reserves the right to cancel orders in cases of suspected fraud, incorrect pricing, stock unavailability, or legal/regulatory restrictions.
- If an order is cancelled by Tamoor, customers will be refunded the full amount to their original payment method.`,

  exclusions: `The following items are non-returnable and non-refundable:

- Products purchased on sale, clearance, or promotional discounts.
- Free samples, free gifts, or complimentary items.
- Products damaged after delivery due to mishandling, exposure to heat, humidity, or improper storage.
- Products returned without original invoice, packaging, or tampered batch codes.`,

  late: `If you have not received a refund within the stipulated timeline:

1. Recheck your bank account or card statement.
2. Contact your credit card company, as it may take time for refunds to reflect.
3. Contact your bank for pending transactions.

If you have done all of the above and still not received your refund, please reach out to care@tamoor.in with your Order ID.`,

  replacements: `Where applicable, Tamoor may offer replacements for defective or incorrect products, subject to availability. If a replacement cannot be provided, a refund will be issued.

Exchanges are not permitted for preference-based reasons such as flavor, size, or packaging design.`,

  liability: `Tamoor’s liability for returns, refunds, and cancellations is strictly limited to the amount paid by the customer for the disputed product. Under no circumstances shall Tamoor be liable for indirect, incidental, or consequential damages arising from use or misuse of products.

This Policy is governed by the laws of India and disputes shall be subject to the jurisdiction of courts in Bengaluru, Karnataka.`,

  contact: `For all return, refund, or cancellation queries, please contact us at:

📧 Email: care@tamoor.in
📞 Phone: +91-72599 66388
🏢 Address: Tamoor - A Unit of FIFA FOODS, Office - Rahmania Complex, Doddapete, Kolar, Karnataka, India.

In compliance with the Information Technology Act, 2000 and rules thereunder, our designated Grievance Officer is:

**Name:** Mr. IQBAL
**Email:** grievance@tamoor.in
**Phone:** +91-72599 66388
**Address:** Same as above.`,
};

const ReturnsRefundPolicy: React.FC = () => {
  // Prepare data for PDF
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
            Returns & Refunds Policy
          </h1>
          <p className="mt-3 text-sm text-gray-300">Last updated: September 2025</p>

          {/* PDF Download Button */}
          <div className="mt-4">
            <PdfGenerator title="Returns & Refunds Policy" sections={pdfSections} />
          </div>
        </header>

        <section className="mt-8 text-gray-200 space-y-6">
          <p className="leading-relaxed">
            Our commitment is to provide a transparent, fair, and legally compliant policy for returns, refunds, and cancellations to protect our customers and uphold the integrity of our luxury brand.
          </p>

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
                    {contentMap[s.id]}
                  </div>
                </details>
              </article>
            ))}
          </div>

          <footer className="mt-10 text-sm text-gray-400 text-center">
            <p>
              This Returns & Refunds Policy should be read together with Tamoor’s Terms of Service and Privacy Policy. For assistance or to exercise your rights, contact us at <a href="mailto:care@tamoor.in" className="text-amber-300 hover:underline">care@tamoor.in</a>.
            </p>

            <p className="mt-3 font-serif font-extrabold">© {new Date().getFullYear()} Tamoor — All rights reserved.</p>
          </footer>
        </section>
      </motion.main>
    </div>
  );
};

export default ReturnsRefundPolicy;

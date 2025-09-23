import React from "react";
import { motion } from "framer-motion";
import { PdfGenerator } from "../utils/PdfGenerator"; // import your general PDF generator

const sections = [
  { id: "processing", title: "1. Order Processing & Dispatch" },
  { id: "timelines", title: "2. Shipping & Delivery Timelines" },
  { id: "coverage", title: "3. Geographic Coverage" },
  { id: "charges", title: "4. Shipping Charges" },
  { id: "tracking", title: "5. Order Tracking" },
  { id: "delivery", title: "6. Delivery Attempts & Re-Delivery" },
  { id: "address", title: "7. Address Accuracy & Liability" },
  { id: "inspection", title: "8. Inspection & Acceptance of Delivery" },
  { id: "delays", title: "9. Delays & Unforeseen Issues" },
  { id: "risk", title: "10. Title & Risk of Loss" },
  { id: "responsibilities", title: "11. Customer Responsibilities" },
  { id: "contact", title: "12. Escalation & Contact Information" },
  { id: "amendments", title: "13. Amendments" },
];

const contentMap: Record<string, string | JSX.Element> = {
  processing: `All orders are subject to acceptance and confirmation by Tamoor. You will receive an email/SMS confirmation after successful placement. Orders are typically processed within 24–48 working hours of placement, subject to product availability, quality checks, and payment confirmation. Orders placed after 2:00 PM IST may be processed on the next working day. Orders are not processed on Sundays and public holidays recognized in Karnataka, India.`,
  timelines: `Domestic Deliveries (India): Metro Cities: 2–5 business days; Non-Metro Cities & Remote Areas: 5–10 business days. Delays caused by natural calamities, strikes, transport disruptions, government restrictions, or events beyond our control shall not be deemed a breach of this Policy.`,
  coverage: `Tamoor delivers across India, subject to courier partner coverage and applicable restrictions under state laws. Certain pin codes may be marked as non-serviceable. If your area is non-serviceable, Tamoor will notify you and initiate a full refund.`,
  charges: `Standard Shipping: Charges are calculated at checkout based on location, weight, and delivery method. Free Shipping may be available on promotional offers or order thresholds. COD Handling Fee: For Cash-on-Delivery orders, an additional handling fee may apply.`,
  tracking: `Once your order is dispatched, you will receive a tracking ID and a link via email/SMS to track the shipment in real-time. Tracking status is dependent on updates provided by our logistics partners.`,
  delivery: `Our logistics partners will attempt delivery up to 2 times. If the recipient is unavailable, the order may be marked as RTO (Return to Origin). Customers must bear re-delivery charges if an incorrect/incomplete address or recipient unavailability causes failed delivery.`,
  address: `Customers must ensure shipping details are accurate. Tamoor shall not be responsible for delays, misdeliveries, or lost shipments arising from incorrect or incomplete address details. No change in shipping address is permitted once the order has been dispatched.`,
  inspection: `Customers are requested to inspect the package upon delivery. If the package appears tampered, damaged, or unsealed, customers must refuse to accept delivery and notify our support team. Acceptance of delivery shall be deemed as proof that the order was received in good condition.`,
  delays: `Tamoor will make reasonable efforts to deliver within estimated timelines. However, we shall not be liable for delays due to courier partner backlogs, natural disasters, operational restrictions, pandemic-related lockdowns, or government actions.`,
  risk: `Title and risk of loss for products pass to the customer upon handover to the courier/logistics partner. Tamoor disclaims liability for loss or damage occurring post-dispatch unless caused due to gross negligence by the Company.`,
  responsibilities: `Ensure timely availability at the delivery address, maintain updated contact information, and bear additional costs for re-delivery or RTO due to customer negligence.`,
  contact: `For concerns regarding shipping or delivery, you may reach out to us:\nEmail: care@tamoor.in\nPhone: +91-72599 66388\nOffice: Tamoor - A Unit of FIFA FOODS, Rahmania Complex, Doddapete, Kolar, Karnataka, India`,
  amendments: `Tamoor reserves the right to modify or update this Policy without prior notice. Customers are encouraged to review this page periodically for the latest terms.`,
};

// Transform contentMap to plain text for PDF
// convert contentMap to string for PDF
const pdfSections = sections.map(s => {
  const content = contentMap[s.id];
  let textContent = "";

  if (typeof content === "string") {
    textContent = content;
  } else if (React.isValidElement(content)) {
    // For JSX, extract text content manually
    // Here we handle simple <div> with <p> and <ul>
    const extractText = (el: React.ReactNode): string => {
      if (typeof el === "string") return el;
      if (Array.isArray(el)) return el.map(extractText).join("\n");
      if (React.isValidElement(el)) return extractText(el.props.children);
      return "";
    };
    textContent = extractText(content);
  }

  return {
    title: s.title,
    content: textContent,
  };
});


const ShippingPolicy: React.FC = () => {
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
            Shipping & Delivery Policy
          </h1>
          <p className="mt-3 text-sm text-gray-300">Last updated: September 2025</p>

          {/* PDF Download Button */}
          <div className="mt-4">
            <PdfGenerator title="Shipping & Delivery Policy" sections={pdfSections} />
          </div>
        </header>

        <section className="mt-8 text-gray-200 space-y-6">
          <p className="leading-relaxed">
            Our Shipping & Delivery Policy ensures transparency, timely delivery, and legal compliance while setting clear expectations for our customers.
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
                    {contentMap[s.id as keyof typeof contentMap]}
                  </div>
                </details>
              </article>
            ))}
          </div>

          <footer className="mt-10 text-sm text-gray-400 text-center">
            <p>
              This Shipping & Delivery Policy should be read together with Tamoor’s Terms of Service, Privacy Policy, and Returns Policy. For assistance, contact us at <a href="mailto:care@tamoor.in" className="text-amber-300 hover:underline">care@tamoor.in</a>.
            </p>

            <p className="mt-3">© {new Date().getFullYear()} Tamoor — All rights reserved.</p>
          </footer>
        </section>
      </motion.main>
    </div>
  );
};

export default ShippingPolicy;

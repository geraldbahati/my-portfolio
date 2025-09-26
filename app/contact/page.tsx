import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact - Request a project",
  description: "Get in touch to discuss your next project. Every message is 100% received and guaranteed to be answered.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left column - Contact info */}
          <div className="space-y-12">
            {/* Header */}
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                CONTACT
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                Request a project
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Every message is 100% received and guaranteed to be answered. If you can&apos;t
                reach me, please leave a request for a callback.
              </p>
            </div>

            {/* Office hours */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                Office hours
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Monday & Friday:
                </p>
                <p className="text-gray-800 font-medium">
                  8:00 a.m. - 6:00 p.m.
                </p>
              </div>
            </div>

            {/* Direct contact */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">
                Direct contact
              </h2>
              <div className="space-y-3">
                <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <span className="text-gray-800 font-medium">
                    0651 17089399
                  </span>
                </div>
                <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <span className="text-gray-800 font-medium">
                    24/7 WhatsApp Chat
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Contact form */}
          <div className="lg:pl-8">
            <div className="bg-white">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
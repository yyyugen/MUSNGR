import Link from "next/link";

import MaxWidthWrapper from "@/components/global/max-width-wrapper";
import AnimationContainer from "@/components/animations/animation-container";

export default function PrivacyPage() {
  return (
    <MaxWidthWrapper className="max-w-3xl mx-auto px-8 mb-40 text-white">
      <AnimationContainer delay={0.1} className="w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center w-full">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400 py-2">
            Effective Date: 6th November 2024
          </p>
          <p className="text-sm text-gray-400">
            Last Updated: 20th November 2024
          </p>
        </div>

        <div className="pt-10">
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-6">1. Introduction</h2>
                <p className="mb-4">
                  Musngr ("we," "us," "our") provides an online platform that
                  allows users to upload videos directly to their YouTube
                  accounts using our software and Google’s API services. We are
                  committed to protecting your privacy and ensuring your data is
                  handled securely.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  2. Information We Collect
                </h2>
                <ul className="list-disc list-outside space-y-2 ml-4 py-2">
                  <li>
                    <span className="font-semibold">
                      User-Provided Information:
                    </span>{" "}
                    We collect information you provide to us, such as your name,
                    email address, and any other information you may submit
                    (e.g., video title, description, tags, etc.).
                  </li>
                  <li>
                    <span className="font-semibold">Google Account Data:</span>{" "}
                    When you connect your Google account to our service, we
                    collect access tokens to upload videos on your behalf.
                  </li>
                  <li>
                    <span className="font-semibold">Usage Data:</span> We may
                    collect data about how our service is accessed, such as
                    device information, browser type, and other interactions
                    within the platform.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  3. How We Use Your Information
                </h2>
                <p className="mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4 py-2">
                  <li>
                    <span className="font-semibold">Video Uploading: </span>To
                    upload videos to your YouTube account as specified by you.
                  </li>
                  <li>
                    <span className="font-semibold">Communication: </span>To
                    communicate with you about updates, support, and other
                    relevant information.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Improving Our Services:{" "}
                    </span>
                    To analyze and improve our platform’s features,
                    functionality, and user experience.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  4. Google API Usage
                </h2>
                <p className="mb-4">
                  Our service uses the Google API to upload videos to YouTube.
                  By using our service, you consent to the collection, use, and
                  sharing of your information as described in this Privacy
                  Policy and agree to be bound by the Google Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  5. Data Sharing and Disclosure
                </h2>
                <p className="mb-4">
                  We do not sell or rent your personal information. We may share
                  your information:
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4 py-2">
                  <li>
                    <span className="font-semibold">
                      With Service Providers:{" "}
                    </span>
                    To third-party vendors and service providers who work on our
                    behalf.
                  </li>
                  <li>
                    <span className="font-semibold">Legal Compliance: </span>If
                    required by law or in response to valid requests by public
                    authorities.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  6. Data Security
                </h2>
                <p className="mb-4">
                  We implement reasonable security measures to protect your
                  information. However, no method of electronic storage or
                  transmission is completely secure, and we cannot guarantee
                  absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">7. Your Rights</h2>
                <p className="mb-4">
                  Depending on your jurisdiction, you may have rights related to
                  your personal information, such as the right to access,
                  correct, delete, or restrict processing. Contact us at
                  support@musngr.com to exercise these rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  8. Changes to This Privacy Policy
                </h2>
                <p className="mb-4">
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">9. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, please
                  contact us at{" "}
                  <Link
                    href="mailto:support@musngr.com"
                    className="underline underline-offset-4 font-medium"
                  >
                    support@musngr.com.
                  </Link>
                </p>
              </section>
            </div>
          </div>
        </div>
      </AnimationContainer>
    </MaxWidthWrapper>
  );
}

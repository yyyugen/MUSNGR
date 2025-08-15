import Link from "next/link";

import MaxWidthWrapper from "@/components/global/max-width-wrapper";
import AnimationContainer from "@/components/animations/animation-container";

export default function TermsPage() {
  return (
    <MaxWidthWrapper className="max-w-3xl mx-auto px-8 mb-40">
      <AnimationContainer delay={0.1} className="w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center w-full">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400 py-2">
            Effective Date: 20th November 2024
          </p>
          <p className="text-sm text-gray-400">
            Last Updated: 6th November 2024{" "}
          </p>
        </div>

        <div className="">
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  1. Acceptance of Terms
                </h2>
                <p className="mb-4">
                  By accessing or using Musngr, you agree to these Terms of
                  Service ("Terms"). If you do not agree with these Terms, you
                  may not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  2. Description of Services
                </h2>
                <p className="mb-4">
                  Our platform allows users to upload videos to their YouTube
                  accounts by providing specific content (e.g., title, tags,
                  images, etc.) via our software and using Google’s API.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  3. Google API and User Responsibilities
                </h2>
                <ul className="list-disc list-outside space-y-2 ml-4 py-2">
                  <li>
                    User Authorization: By connecting your Google account, you
                    grant us permission to upload videos to your YouTube channel
                    on your behalf.
                  </li>
                  <li>
                    Compliance with Google’s Terms: Users must comply with
                    Google’s Terms of Service while using our platform.
                  </li>
                  <li>
                    Responsibility for Content: Users are responsible for all
                    content (e.g., video, title, description) uploaded via the
                    platform.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  4. License and Intellectual Property
                </h2>
                <p className="mb-4">
                  We grant you a limited, non-exclusive, non-transferable
                  license to use our platform. All intellectual property rights
                  related to our software and content remain the property of
                  [Company Name] or its licensors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  5. Prohibited Uses
                </h2>
                <p className="mb-4">Users may not use our platform:</p>

                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    To upload content that violates laws, infringes on
                    intellectual property rights, or is otherwise inappropriate.
                  </li>
                  <li>
                    To interfere with the platform’s operation or attempt to
                    bypass security features.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  6. Limitations of Liability
                </h2>
                <p className="mb-4">
                  To the extent permitted by law, Musngr is not liable for:
                </p>

                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    <span className="font-semibold">
                      User-Generated Content:
                    </span>{" "}
                    Any claim or damages arising from content uploaded by users.
                  </li>

                  <li>
                    <span className="font-semibold">Third-Party Services:</span>
                    Issues arising from the use of third-party services,
                    including Google’s API.
                  </li>

                  <li>
                    <span className="font-semibold">Platform Performance:</span>
                    Any loss or damages resulting from your use or inability to
                    use our platform.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">7. Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your access to our platform
                  without notice if you violate these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  8. Changes to Terms
                </h2>
                <p className="mb-4">
                  We reserve the right to modify these Terms at any time.
                  Changes will be posted on this page, and continued use of the
                  platform indicates acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">
                  9. Governing Law
                </h2>
                <p className="mb-4">
                  These Terms shall be governed by and construed in accordance
                  with the laws of the United States.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">10. Contact Us</h2>
                <p className="mb-4">
                  For questions about these Terms of Service, please contact us
                  at{" "}
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

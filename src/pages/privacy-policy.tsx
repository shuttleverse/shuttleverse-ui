import Layout from "@/components/layout/layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">Last updated: 08/01/2025</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Introduction
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Shuttleverse ("we," "our," or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                website and services.
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                By using Shuttleverse, you agree to the collection and use of
                information in accordance with this policy.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Personal Information
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We may collect personal information that you voluntarily provide
                to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6 mb-6">
                <li>Name and email address when you create an account</li>
                <li>Profile information such as username and bio</li>
                <li>Contact information when you submit forms</li>
                <li>Communications with us</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Usage Information
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We automatically collect certain information about your use of
                our services:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6 mb-8">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on pages</li>
                <li>Search queries and preferences</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We use the information we collect for various purposes,
                including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6 mb-8">
                <li>Providing and maintaining our services</li>
                <li>Processing your requests and transactions</li>
                <li>Sending you updates and communications</li>
                <li>Improving our website and user experience</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Preventing fraud and ensuring security</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Information Sharing
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except in the
                following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6 mb-8">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist in our operations</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Data Security
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                We cannot guarantee the absolute security of your information,
                but we are committed to protecting it to the best of our
                ability.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Your Rights
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6 mb-8">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt out of marketing communications</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Contact Us
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p className="text-gray-700">
                  <strong>Email:</strong> shuttleverse.team@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;

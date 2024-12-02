import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const Terms = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-4xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Terms and Conditions</CardTitle>
          <p className="text-gray-500 text-sm mt-2">
            Effective Date: <span className="font-medium">December 1st 2024</span>
          </p>
        </CardHeader>
        <CardContent>
          <section className="space-y-6">
            <p className="text-gray-700">
              Welcome to Pocketly, a platform dedicated to simplifying college cost planning for families. By
              accessing or using Pocketly (the “Website”), you agree to comply with and be bound by the following
              terms and conditions (“Terms”). If you do not agree with these Terms, you should not use the Website.
            </p>

            <h2 className="text-lg font-semibold text-gray-800">1. Introduction</h2>
            <p className="text-gray-700">
              Pocketly is an AI-powered platform that provides personalized insights into the cost of college
              education by analyzing user-provided financial and academic information. Our services include:
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Centralized Financial Aid Estimation</li>
              <li>Merit Aid Predictions</li>
              <li>Scholarship Matching</li>
            </ul>
            <p className="text-gray-700">These Terms govern your use of the Website and all related services.</p>

            <h2 className="text-lg font-semibold text-gray-800">2. Eligibility</h2>
            <p className="text-gray-700">To use Pocketly, you must:</p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Be at least 13 years of age (users under 18 require parental or guardian consent).</li>
              <li>Provide accurate and truthful information during registration and use of the Website.</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-800">3. User Responsibilities</h2>
            <p className="text-gray-700">By using Pocketly, you agree to:</p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Provide accurate information, including family income, assets, family size, student income, test scores, and GPA.</li>
              <li>Maintain the confidentiality of your account credentials.</li>
              <li>Use the Website only for lawful purposes and in compliance with these Terms.</li>
            </ul>
            <p className="text-gray-700">Prohibited activities include:</p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Attempting to reverse-engineer or hack the Website.</li>
              <li>Submitting false or misleading information.</li>
              <li>Using the Website for any unauthorized commercial purpose.</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-800">4. Subscriptions and Payments</h2>
            <p className="text-gray-700">
              Pocketly offers subscription-based plans that provide enhanced access to certain features. By purchasing a subscription:
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>You agree to pay all fees associated with your chosen plan.</li>
              <li>Subscription fees are non-refundable, except as required by law.</li>
              <li>Pocketly reserves the right to modify or terminate subscription plans with prior notice to users.</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-800">5. Use of AI and Disclaimer</h2>
            <p className="text-gray-700">
              Pocketly leverages AI, including the OpenAI API, to provide personalized recommendations and insights.
              By using the Website, you acknowledge:
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Your data, including financial and academic information, will be processed by our AI to generate results.</li>
              <li>
                While AI results are designed to be accurate, they may occasionally contain errors, be incomplete, or rely on outdated data.
              </li>
            </ul>
            <p className="text-gray-700">Pocketly does not guarantee the accuracy or completeness of AI-generated results and shall not be held liable for any errors or omissions.</p>

            <h2 className="text-lg font-semibold text-gray-800">6. Privacy and Data Handling</h2>
<div className="text-gray-700 space-y-4">
  <p>
    Pocketly is committed to protecting your privacy. By using the Website, you consent to the collection, use, and storage of your
    information as described in this section.
  </p>

  <h3 className="text-md font-semibold text-gray-800">6.1 Information We Collect</h3>
  <p>To provide personalized insights and recommendations, we collect the following user-provided information:</p>
  <ul className="list-disc ml-6">
    <li>
      <strong>Financial Data:</strong> Family income, family assets, family size, student income.
    </li>
    <li>
      <strong>Academic Data:</strong> GPA, test scores.
    </li>
    <li>
      <strong>Other Information:</strong> Any other details you voluntarily provide when using the Website.
    </li>
  </ul>

  <h3 className="text-md font-semibold text-gray-800">6.2 How We Use Your Data</h3>
  <p>Your data is used to:</p>
  <ul className="list-disc ml-6">
    <li>Generate financial aid estimates, merit aid predictions, and scholarship matches.</li>
    <li>Train and run AI models that provide personalized recommendations and insights.</li>
    <li>Improve and optimize the platform’s features.</li>
  </ul>

  <h3 className="text-md font-semibold text-gray-800">6.3 AI Data Processing</h3>
  <p>Pocketly uses AI tools, including the OpenAI API, to process your data. This means:</p>
  <ul className="list-disc ml-6">
    <li>Your data may be shared with OpenAI's systems to generate personalized results.</li>
    <li>
      While AI results are designed to be accurate, they may sometimes contain errors, omissions, or outdated information.
    </li>
  </ul>
  <p>
    For details on how OpenAI handles data, visit <a href="https://openai.com/privacy" className="text-blue-500 underline">OpenAI’s Privacy Policy</a>.
  </p>

  <h3 className="text-md font-semibold text-gray-800">6.4 Data Security</h3>
  <p>
    We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or
    destruction. However, no system is completely secure, and we cannot guarantee absolute security.
  </p>

  <h3 className="text-md font-semibold text-gray-800">6.5 Data Sharing</h3>
  <p>We do not sell or share your personal data with third parties except in the following cases:</p>
  <ul className="list-disc ml-6">
    <li>To third-party service providers (e.g., OpenAI) strictly for the purpose of operating the platform.</li>
    <li>As required by law or to comply with legal obligations.</li>
  </ul>

  <h3 className="text-md font-semibold text-gray-800">6.6 Data Retention</h3>
  <p>
    We retain your data for as long as necessary to provide our services or as required by law. Upon request, we will delete your data,
    except where retention is necessary for legal, regulatory, or security reasons.
  </p>

  <h3 className="text-md font-semibold text-gray-800">6.7 Your Rights</h3>
  <p>You have the following rights regarding your data:</p>
  <ul className="list-disc ml-6">
    <li><strong>Access:</strong> Request access to the data we collect about you.</li>
    <li><strong>Correction:</strong> Request corrections to inaccurate or incomplete data.</li>
    <li><strong>Deletion:</strong> Request the deletion of your data, subject to legal and operational constraints.</li>
    <li>
      <strong>Opt-Out:</strong> Decline the use of specific data for processing (though this may limit the functionality of the platform).
    </li>
  </ul>

  <h3 className="text-md font-semibold text-gray-800">6.8 Cookies and Tracking Technologies</h3>
  <p>
    Pocketly uses cookies and similar technologies to improve user experience and analyze site usage. You can control cookies through
    your browser settings.
  </p>

  <h3 className="text-md font-semibold text-gray-800">6.9 Parental Consent</h3>
  <p>
    Users under 18 must obtain parental consent before providing personal data to the Website. We do not knowingly collect information
    from children under 13.
  </p>

  <p>
    If you have any questions about your privacy or wish to exercise your rights, please contact us at
    <span className="font-medium"> pocketly.ai@gmail.com</span>.
  </p>
</div>

            <h2 className="text-lg font-semibold text-gray-800">7. Limitations of Liability</h2>
            <p className="text-gray-700">
              To the fullest extent permitted by law, Pocketly and its affiliates are not liable for:
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Any errors, interruptions, or downtime of the Website.</li>
              <li>Losses resulting from reliance on AI-generated recommendations.</li>
              <li>Direct, indirect, incidental, or consequential damages arising from your use of the Website.</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-800">8. Intellectual Property</h2>
            <p className="text-gray-700">
              All content on the Website, including logos, text, graphics, and software, is the property of Pocketly or its licensors.
              You may not reproduce, distribute, or use this content without express written permission.
            </p>

            <h2 className="text-lg font-semibold text-gray-800">9. Modifications to the Website</h2>
            <p className="text-gray-700">
              Pocketly reserves the right to:
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Update, modify, or discontinue the Website or its features without notice.</li>
              <li>Change the Terms at any time. Continued use of the Website constitutes acceptance of updated Terms.</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-800">10. Termination</h2>
            <p className="text-gray-700">
              Pocketly may suspend or terminate your account if you violate these Terms or engage in prohibited activities.
              Termination does not absolve you from obligations incurred under these Terms.
            </p>

            <h2 className="text-lg font-semibold text-gray-800">11. Governing Law and Dispute Resolution</h2>
            <p className="text-gray-700">
            These Terms are governed by the laws of the State of New York, United States. Any disputes arising from these Terms or
            your use of the Website will be resolved through binding arbitration or litigation in the courts located in New York County, New York.
            </p>

            <h2 className="text-lg font-semibold text-gray-800">12. Contact Information</h2>
            <p className="text-gray-700">
              If you have questions or concerns about these Terms, please contact us at pocketly.ai@gmail.com.
            </p>

            <h2 className="text-lg font-semibold text-gray-800">13. Final Disclaimer</h2>
            <p className="text-gray-700">
              The Website is provided “as is” without warranties of any kind. We do not guarantee uninterrupted service or the
              availability of the Website at all times.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;

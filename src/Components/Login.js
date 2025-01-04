import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCombined } from './CollegeContext';
import { Button } from './ui/button';

const Login = () => {
  const { user, handleLogin, isLoading } = useCombined();
  const navigate = useNavigate();


  useEffect(() => {
    if (!isLoading && user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return <div>Loading...</div>; // Show a loading screen or spinner
  }

  const plans = [
      {
        title: "Free",
        price: "$0/month",
        features: ["See 5 Schools", "Ask 10 Questions a Week"],
        buttonText: "Select Free",
        buttonClass: "bg-gray-300 text-gray-600 cursor-not-allowed",
        buttonDisabled: true,
      },
      {
        title: "Standard",
        price: "$6.99/month",
        features: [
          "See 15 Schools",
          "Ask 20 Questions a Week",
          "See School Specific Scholarships",
        ],
        buttonText: "Select Standard",
        buttonClass:
          "bg-purple-500 text-white hover:bg-purple-600 transition duration-300",
        buttonDisabled: false,
      },
      {
        title: "Premium",
        price: "$14.99/month",
        features: [
          "See 30 Schools",
          "Ask 50 Questions a Week",
          "See School Specific Scholarships",
          "Export Spreadsheet",
        ],
        buttonText: "Select Premium",
        buttonClass:
          "bg-purple-500 text-white hover:bg-purple-600 transition duration-300",
        buttonDisabled: false,
      },
    ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fb044c] to-[#b713db]">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Uncover the Real Cost of College.
          </h1>
          <p className="text-lg text-gray-200">
          Empowering families with accurate, personalized estimates of college costs to make smarter financial decisions. Save time, avoid surprises, and focus on colleges that match your budget.          </p>
          <Button className="w-full max-w-sm bg-white text-black hover:bg-gray-100" onClick={handleLogin}>
            <svg
              role="img"
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4"
              fill="currentColor"
            >
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Sign in with Google
          </Button>
          <p className="text-sm text-gray-300">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-300 hover:underline">
              Terms and Conditions
            </Link>.
          </p>
        </div>
        <div className="flex-1">
        <img
          src="/images/screenshot-college-cost.png" 
          alt="College cost illustration"
          className="rounded-lg shadow-lg w-full max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      {/* Features Section */}
{/* Features Section */}
<section className="bg-white py-16 px-8">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
      Features
    </h2>

    {/* Features Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Feature 1 */}
      <div className="group flex flex-col items-center text-center transition-transform transform hover:scale-105 duration-300 hover:shadow-lg">
        <div className="w-28 h-28">
          <img
            src="/images/ss-target.png"
            alt="Financial and Merit Aid Calculator"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mt-4">
          Financial and Merit Aid Calculator
        </h3>
        <p className="text-gray-600 mt-2">
          The quickest financial and most accurate merit aid calculator verified with <span className="font-bold">thousands</span> of real offer letters
        </p>
      </div>

      {/* Feature 2 */}
      <div className="group flex flex-col items-center text-center transition-transform transform hover:scale-105 duration-300 hover:shadow-lg">
        <div className="w-28 h-28">
          <img
            src="/images/ss-check.png"
            alt="Scholarship Matching"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mt-4">
          Scholarship Matching
        </h3>
        <p className="text-gray-600 mt-2">
          Verified school-specific scholarships updated daily and tailored to your unique profile      
        </p>
      </div>

      {/* Feature 3 */}
      <div className="group flex flex-col items-center text-center transition-transform transform hover:scale-105 duration-300 hover:shadow-lg">
        <div className="w-28 h-28">
          <img
            src="/images/ss-ai.png"
            alt="Financial Planning"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mt-4">
          AI Powered Guidance
        </h3>
        <p className="text-gray-600 mt-2">
          AI will adapt to your interests, academic, and financial background, offering personalized guidance.
        </p>
      </div>

    </div>
  </div>
</section>

<section className="relative bg-white py-16 px-8 text-gray-900 overflow-hidden">


  <div className="relative z-10 max-w-6xl mx-auto text-center">
    {/* Title */}


    {/* Highlighted Amount */}
    <div className="flex justify-center items-center mb-8">
      <p className="text-lg font-medium text-gray-700 mr-3">
        We have helped students discover over
      </p>
      <span className="bg-green-100 text-green-800 font-extrabold text-5xl rounded-md px-4 py-2 inline-block shadow-sm">
        $34.67 Million
      </span>

    </div>

    {/* Supporting Text */}
    <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
      This amount grows every day as more students find aid they qualify for. Join us now and to see what you qualify for.
    </p>

    {/* Call-to-Action Button */}
    <button
      className="mt-4 px-8 py-4 bg-gradient-to-br from-[#fb044c] to-[#b713db] text-white font-semibold text-lg rounded-lg hover:bg-green-700 shadow-md transition duration-300"
      onClick={handleLogin}
    >
      Join Now
    </button>
  </div>
</section>

<section className="bg-white py-16 px-8 text-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-4xl font-bold mb-6 leading-tight">
          Powered by Data, Integrated with AI
        </h2>

        {/* Content */}
        <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-8">
          Our model is built on a robust foundation of data reported directly by
          schools and thousands of real offer letters submitted by students.
          Using advanced machine learning algorithms, we analyze this data to
          provide personalized recommendations and match students with the most
          appropriate financial aid opportunities.
        </p>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              School-Reported Data
            </h3>
            <p className="text-gray-700">
              We aggregate and process accurate, up-to-date information provided
              directly by institutions to ensure the reliability of our results.
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              Real Offer Letters
            </h3>
            <p className="text-gray-700">
              By analyzing thousands of offer letters submitted by students, our
              model identifies trends and patterns to create better matches.
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              Machine Learning Insights
            </h3>
            <p className="text-gray-700">
              Leveraging state-of-the-art machine learning, we predict the best
              financial aid options for each student, personalized to their
              needs and qualifications.
            </p>
          </div>
                  </div>
        <p className="mt-8 text-gray-600">
          Questions? Contact{" "}
          <a
            href="mailto:pocketly.ai@gmail.com"
            className="text-purple-500 underline"
          >
            pocketly.ai@gmail.com
          </a>
        </p>

      </div>
    </section>



<footer className="bg-[#111827] text-white py-8">
  <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
    {/* Logo and Name */}
    <div className="text-center md:text-left">
      <h3 className="text-xl font-bold">Pocketly</h3>
      <p className="text-sm text-gray-400">Uncovering the real cost of college.</p>
    </div>

    {/* Navigation Links */}
    <div className="mt-4 md:mt-0 flex space-x-6">
      <a href="/about" className="text-gray-400 hover:text-white">
        About Us
      </a>
      <a href="/contact" className="text-gray-400 hover:text-white">
        Contact
      </a>
      <a href="/terms" className="text-gray-400 hover:text-white">
        Privacy Policy
      </a>
    </div>

    {/* Social Links */}
    <div className="mt-4 md:mt-0 flex space-x-4">
  
      <a href="https://www.linkedin.com/company/pocketlyai" target="_blank" rel="noopener noreferrer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-400 hover:text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zm-6.25 19h-3.5v-6.5h3.5V19zM9.5 10h-3v-3.5h3V10zm7.25 9h-3.5v-4.5c0-1.14-.93-2.06-2.06-2.06H10V19h-3.5V9h3.5v.75C9.6 8.34 10.87 7.5 12.35 7.5c2.23 0 3.9 1.8 3.9 4.04V19z" />
        </svg>
      </a>
    </div>
  </div>

  <div className="text-center text-gray-500 mt-6">
    <p>© {new Date().getFullYear()} Pocketly. All rights reserved.</p>
  </div>
</footer>


{/* 
<section className="bg-white py-16 px-8 text-gray-900">
  <div className="max-w-7xl mx-auto text-center">
   
    <h2 className="text-4xl font-bold text-[#111827] mb-6">
      Get in Touch with Us
    </h2>
    <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
      Have questions or need assistance? Our team is here to help! Reach out to us, and we’ll get back to you as soon as possible.
    </p>


    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="message"
            className="block text-gray-700 font-medium mb-2"
          >
            Your Message
          </label>
          <textarea
            id="message"
            rows="5"
            placeholder="Write your message here"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-[#DABFFF] text-[#111827] py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Send Message
        </button>
      </form>
    </div>


    <div className="mt-12 text-gray-700">
      <p>
        <span className="font-semibold">Email:</span>{" "}
        <a
          href="mailto:support@pocketly.ai"
          className="text-indigo-600 hover:underline"
        >
          pocketly.ai@gmail.com
        </a>
      </p>
      <p>
        <a
          className="text-indigo-600 hover:underline"
        >
        </a>
      </p>
    </div>
  </div>
</section>
*/}


    </div>
  );
};

export default Login;

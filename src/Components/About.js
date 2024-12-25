import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Typography } from "./ui/typography";
//import { Badge } from ".ui/badge";

const About = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <Typography variant="h1" className="text-4xl font-bold text-gray-800">
          About Pocketly
        </Typography>
        <Typography variant="body" className="text-lg mt-4 text-gray-600">
          Making college affordability clear, accessible, and actionable.
        </Typography>
      </div>

      <Card className="shadow-lg border rounded-lg p-6 bg-white mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            How Pocketly Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body" className="text-gray-700">
            Pocketly leverages data reported by schools in publicly available datasets, using it as the foundation for our algorithm. 
            This algorithm generates estimates of college costs, factoring in thousands of real offer letters to refine and verify its accuracy. 
            While these estimates are not exact, they provide a reliable prediciton based on the data provided by schools.
          </Typography>
          <Typography variant="body" className="text-gray-700 mt-4">
            To enhance this process, we integrate our algorithm with an AI-powered language model. This AI streamlines the experience, making the platform more intuitive and helpful for users.
          </Typography>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border rounded-lg p-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-800">
              Simplified Financial Aid Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body" className="text-gray-700">
              Using a streamlined version of the FAFSA, we help you estimate your financial aid eligibility and understand how it impacts your college costs.
            </Typography>
          </CardContent>
        </Card>

        <Card className="shadow-lg border rounded-lg p-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-800">
              Merit Aid Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body" className="text-gray-700">
              We provide insights into your potential for merit-based aid by comparing your academic profile to the admissions data of your selected colleges.
            </Typography>
          </CardContent>
        </Card>

        <Card className="shadow-lg border rounded-lg p-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-800">
              School Scholarship Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body" className="text-gray-700">
              Access a comprehensive, curated list of scholarships offered by schools, updated regularly to ensure accuracy.
            </Typography>
          </CardContent>
        </Card>

        <Card className="shadow-lg border rounded-lg p-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-800">
              AI-Powered Chatbot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body" className="text-gray-700">
              Get personalized recommendations and advice tailored to your unique needs, with support from our AI chatbot.
            </Typography>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
   
      <p className="mt-8 text-sm text-gray-600">
        Questions? Contact{' '}
        <a href="mailto:pocketly.ai@gmail.com" className="text-blue-600 underline">
          pocketly.ai@gmail.com
        </a>
      </p>
  
      </div>
    </div>
  );
};

export default About;

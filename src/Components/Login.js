import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Add Link for navigation
import { useCombined } from './CollegeContext'; // Your context
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const Login = () => {
  const { user, handleLogin } = useCombined();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [user, navigate]);

  return ( 
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#fb044c] to-[#b713db] space-y-6 px-4">
    {/* Centered Header */}
    <h1 className="text-3xl font-bold text-white text-center">
      Uncover the true cost of college.
    </h1>

    <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
  
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Use your Google account to sign in to our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 mb-4">
          <Button className="w-full max-w-sm" variant="outline" onClick={handleLogin}>
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
          <p className="text-sm text-center text-gray-600">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-500 hover:underline">
              Terms and Conditions
            </Link>.
          </p>
        </CardContent>

      </Card>
    
    </div>
  );
};

export default Login;

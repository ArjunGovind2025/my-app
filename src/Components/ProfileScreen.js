"use client";

import React, { useState } from "react";
import { useCombined } from "./CollegeContext";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

const ProfileScreen = () => {
  const { user, userDoc, handleLogout } = useCombined();
  const [loading, setLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false); // State for the upgrade prompt modal
  const [stripePortalUrl, setStripePortalUrl] = useState("");

  const handleUpgradePrompt = () => {
    setUpgradeModalOpen(true);
  };

  const handleSubscriptionManagement = async () => {
    if (!userDoc?.stripeCustomerId) {
      console.error("No Stripe Customer ID found");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://us-central1-ai-d-ce511.cloudfunctions.net/api/create-billing-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user.uid }), // Send user's UID
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const session = await response.json();
      
      if (session.url) {
        window.location.href = session.url; // Redirect to the Stripe billing portal
      } else {
        throw new Error("No URL returned from the billing session");
      }
    } catch (error) {
      console.error("Error creating Stripe billing session:", error);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="flex items-center space-x-4">
          <div className="relative inline-flex items-center justify-center rounded-full h-16 w-16">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user?.displayName || "User Avatar"}
                className="object-cover rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                {user?.displayName?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div>
            <CardTitle>{user?.displayName || "User Name"}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardHeader>
        <hr className="border-t border-gray-200" />
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="subscription">
              Subscription
            </label>
            <input
              id="subscription"
              value={userDoc?.access || "Free"}
              readOnly
              className="border border-gray-300 rounded-md p-2 w-full"
            />
            {userDoc?.access === "Free" ? (
              <Button
                variant="outline"
                onClick={handleUpgradePrompt} // Open the upgrade modal
                className="mt-2 w-full"
              >
                Upgrade
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleSubscriptionManagement} // Redirect to the Stripe billing portal
                className="mt-2 w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : "Manage Subscription"}
              </Button>
            )}
          </div>
          <hr className="border-t border-gray-200" />
          <Button 
          style={{
            backgroundColor: '#DABFFF', // Replace with your desired color
            color: 'white', // Text color
          }}
          variant="destructive" onClick={handleLogout} className="w-full">
            Log Out
          </Button>
        </CardContent>
      </Card>

      {upgradeModalOpen && (
        <Modal
          title="Upgrade Your Subscription"
          onClose={() => setUpgradeModalOpen(false)}
        >
          <div>
            <p>You are currently on a Free plan. Upgrade to access more features!</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => {
                setUpgradeModalOpen(false);
                //navigate("/upgrade"); // Navigate to the upgrade page
              }}
            >
              Upgrade Now
            </Button>
            
          </div>
          
        </Modal>
        
      )}
<p className="mt-8 text-sm text-gray-600 text-center">
Questions? Contact <a href="mailto:pocketly.ai@gmail.com" className="text-blue-600 underline">pocketly.ai@gmail.com</a>
    </p>
    </div>
    
  );
};

export default ProfileScreen;

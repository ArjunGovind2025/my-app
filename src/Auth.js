// Auth.js
import React from 'react';
import { auth, provider, signInWithPopup } from './firebaseConfig';

const Auth = () => {

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User signed in: ", user);
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={handleLogin} style={styles.button}>
        Google Sign-In
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '10px 20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
  },
};

export default Auth;

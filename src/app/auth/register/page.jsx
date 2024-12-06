'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InputField from '@/components/ui/InputField';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    try {
      // First create the auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Then update the profile
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      // Finally create the Firestore document
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: formData.name,
          email: formData.email,
          createdAt: new Date().toISOString(),
          photoURL: null,
          bio: '',
        });
        
        router.push('/');
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        // If Firestore fails, we should still let the user know they're registered
        setError('Account created but profile setup failed. Please try updating your profile later.');
        router.push('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters');
          break;
        default:
          setError('An error occurred during registration');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-base-100 border border-slate-300 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

      <form onSubmit={handleSignUp} className="space-y-4">
        <InputField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
        />

        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          required
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Create a password"
          required
        />

        <InputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm your password"
          required
          error={error === 'Passwords do not match' ? error : ''}
        />

        {error && error !== 'Passwords do not match' && (
          <p className="text-error text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
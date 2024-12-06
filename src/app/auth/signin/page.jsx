'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InputField from '@/components/ui/InputField';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-slate-300 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>

      <form onSubmit={handleSignIn} className="space-y-4">
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
          placeholder="Enter your password"
          required
        />

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Sign In
        </button>
      </form>

      <p className="mt-4 text-center">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
} 
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Mail, Lock, User, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import spitLogo from '@/assets/spit-logo.png';
import spitBanner from '@/assets/spit-banner.gif'
import { auth, db, googleLogin } from "@/firebase-init";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc,addDoc, collection, serverTimestamp  } from "firebase/firestore";

//import { collection, query, where, getDocs } from "firebase/firestore";
type AuthMode = 'login' | 'signup';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    uid: '',
    year: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (mode === 'signup') {
      // Only enforce password complexity on signup
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
      if (!passwordRegex.test(formData.password.trim())) {
        newErrors.password = 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character';
      }

    }

    if (mode === 'signup') {
      if (!formData.uid.trim()) newErrors.uid = 'UID is required';
      if (!formData.year) newErrors.year = 'Year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        await setDoc(
  doc(db, "users", user.uid),
  {
    email: formData.email,
    studentId: formData.uid,
    year: formData.year,
    lastLoginAt: serverTimestamp(),
  },
  { merge: true }
);

        await addDoc(
  collection(db, "users", user.uid, "logins"),
  {
    time: serverTimestamp(),
  }
);


        toast.success("Account created successfully!");
        // redirect or clear form

      } else if (mode === 'login') {
        // Only check email/password in Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        toast.success("Welcome back!");
        // redirect to dashboard/home
      }
    } 
    /*catch (error: any) {
  console.error("Firebase Auth Error:", error.code, error.message);
  toast.error(error.message);*/
  catch (error: any) {
  console.log("AUTH ERROR CODE:", error.code);

  if (mode === "signup") {
    if (error.code === "auth/email-already-in-use") {
      toast.error("Email already in use. Please login.");
    } else {
      toast.error("Signup failed. Try again later.");
    }
  }

  if (mode === "login") {
    if (
      
      error.code === "auth/invalid-credential"
    ) {
      toast.error("Invalid Email or password");
    }else {
      toast.error("Login failed. Try again later.");
    }
  }
}
 finally {
      setIsLoading(false);
    }
  };


  const checkPassword = (value: string) => {
    if (mode !== 'signup') return; // ✅ skip feedback in login
    const messages: string[] = [];
    if (value.length < 6) messages.push(`Add ${6 - value.length} more character(s)`);
    if (!/[A-Z]/.test(value)) messages.push("Add at least 1 uppercase letter");
    if (!/[a-z]/.test(value)) messages.push("Add at least 1 lowercase letter");
    if (!/[0-9]/.test(value)) messages.push("Add at least 1 digit");
    if (!/[^A-Za-z0-9]/.test(value)) messages.push("Add at least 1 special character");
    setPasswordFeedback(messages);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === "password") checkPassword(value);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border border-primary/30 rounded-full animate-pulse-slow" />
          <div className="absolute bottom-32 right-20 w-48 h-48 border border-primary/20 rounded-full animate-float" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-accent-foreground">
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={spitLogo}
                alt="SPIT Logo"
                className="w-20 h-20 rounded-full bg-background/10 p-1 shadow-card"
              />
              <div>
                <h1 className="text-2xl font-serif font-bold text-primary-foreground">SPIT Library</h1>
                <p className="text-primary-foreground/70 text-sm">Knowledge Gateway</p>
              </div>
            </div>
          </div>

          <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <img
              src={spitBanner}
              alt="Sardar Patel Institute of Technology"
              className="max-w-sm"
            />
          </div>

          <p className="text-primary-foreground/80 text-lg max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Access thousands of books, journals, and digital resources. Your gateway to academic excellence.
          </p>

          <div className="mt-12 flex gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div>
              <p className="text-3xl font-bold text-primary">50K+</p>
              <p className="text-primary-foreground/60 text-sm">Books</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-primary-foreground/60 text-sm">E-Resources</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">5K+</p>
              <p className="text-primary-foreground/60 text-sm">Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src={spitLogo}
                alt="SPIT Logo"
                className="w-14 h-14 rounded-full"
              />
              <div className="text-left">
                <h1 className="text-xl font-serif font-bold">SPIT Library</h1>
                <p className="text-muted-foreground text-xs">Knowledge Gateway</p>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-secondary rounded-lg p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${mode === 'login'
                ? 'bg-accent text-accent-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${mode === 'signup'
                ? 'bg-accent text-accent-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'login'
                ? 'Enter your credentials to access the library'
                : 'Register to start exploring resources'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@spit.ac.in"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-12 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-12 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>

              {/* Submit validation error */}
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}

              {/* Live typing feedback */}
              {passwordFeedback.length > 0 && (
                <ul className="text-sm text-destructive list-disc pl-5">
                  {passwordFeedback.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>


            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="uid" className="text-sm font-medium">
                    Student UID
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="uid"
                      type="text"
                      placeholder="e.g., 2022300001"
                      value={formData.uid}
                      onChange={(e) => handleInputChange('uid', e.target.value)}
                      className={`pl-12 ${errors.uid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                  </div>
                  {errors.uid && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.uid}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium">
                    Year of Study
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                    <select
                      id="year"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className={`flex h-12 w-full rounded-lg border-2 bg-background pl-12 pr-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-input appearance-none cursor-pointer ${errors.year ? 'border-destructive' : 'border-input'
                        }`}
                    >
                      <option value="">Select Year</option>
                      <option value="1">First Year (FE)</option>
                      <option value="2">Second Year (SE)</option>
                      <option value="3">Third Year (TE)</option>
                      <option value="4">Fourth Year (BE)</option>
                    </select>
                  </div>
                  {errors.year && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.year}
                    </p>
                  )}
                </div>
              </>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline font-medium">
                  Forgot Password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </Button>
            {mode === 'login' && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={googleLogin}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                >
                  Sign in with Google
                </button>
              </div>
            )}


          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              © 2025 Sardar Patel Institute of Technology. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

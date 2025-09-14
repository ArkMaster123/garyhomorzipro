'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

// Utility function for gradient text
const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <span 
    className={`
      bg-gradient-to-r from-blue-400 to-teal-400 
      dark:from-blue-400 dark:to-teal-400 
      light:from-blue-600 light:to-teal-600 
      bg-clip-text text-transparent 
      ${className}
    `}
  >
    {children}
  </span>
)

// Animated background particles
const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, delay: number}>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1121] via-[#1E293B] to-[#0F172A]" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-teal-500/10 to-purple-500/10 animate-pulse" />
      
      {/* Floating particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-teal-400/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0, rgba(255, 255, 255, 0.1) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 0, rgba(255, 255, 255, 0.1) 1px, transparent 1px, transparent 20px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/chat')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo and Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Image src="/garyhprofile.png" alt="Gary Hormozi" width={48} height={48} className="rounded-full" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Gary Hormozi</h1>
          </div>
          <p className="text-gray-300">Welcome back to your AI-powered growth platform</p>
        </motion.div>

        {/* Sign In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-sm"
        >
          <Card className="border-0 bg-white/10 dark:bg-[#1E293B]/50 backdrop-blur-md shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="text-sm">
                  <Link href="/forgot-password" className="text-teal-400 hover:text-teal-300 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold shadow-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
                
                <div className="text-center text-sm text-gray-300">
                  Don't have an account?{' '}
                  <Link href="/sign-up" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Additional links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-6 text-sm text-gray-400"
        >
          <Link href="/" className="hover:text-gray-200 transition-colors">
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

'use client';

import { useCharacterLimit } from '@/hooks/use-character-limit';
import { useImageUpload } from '@/hooks/use-image-upload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, ImagePlus, X, Crown, Zap, CreditCard, Settings, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useId, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SubscriptionStatus {
  isSubscriber: boolean;
  subscriptionStatus: string;
  dailyMessageCount: number;
  remainingMessages: number;
  subscriptionEndDate?: string;
}

function ProfileBg({ defaultImage }: { defaultImage?: string }) {
  const [hideDefault, setHideDefault] = useState(false);
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } =
    useImageUpload();

  const currentImage = previewUrl || (!hideDefault ? defaultImage : null);

  const handleImageRemove = () => {
    handleRemove();
    setHideDefault(true);
  };

  return (
    <div className="h-32">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-muted">
        {currentImage && (
          <img
            className="h-full w-full object-cover"
            src={currentImage}
            alt={previewUrl ? "Preview of uploaded image" : "Default profile background"}
            width={512}
            height={96}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button
            type="button"
            className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
            onClick={handleThumbnailClick}
            aria-label={currentImage ? "Change image" : "Upload image"}
          >
            <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          {currentImage && (
            <button
              type="button"
              className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              onClick={handleImageRemove}
              aria-label="Remove image"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        aria-label="Upload image file"
      />
    </div>
  );
}

function Avatar({ defaultImage }: { defaultImage?: string }) {
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload();

  const currentImage = previewUrl || defaultImage;

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm shadow-black/10">
        {currentImage && (
          <img
            src={currentImage}
            className="h-full w-full object-cover"
            width={80}
            height={80}
            alt="Profile image"
          />
        )}
        <button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
          onClick={handleThumbnailClick}
          aria-label="Change profile picture"
        >
          <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Upload profile picture"
        />
      </div>
    </div>
  );
}

function PasswordChangeSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setIsChanging(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsChanging(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isChanging}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isChanging}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isChanging}
                placeholder="Enter your new password"
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isChanging}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isChanging}
                placeholder="Confirm your new password"
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isChanging}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          <Button type="submit" disabled={isChanging} className="w-full">
            {isChanging ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SubscriptionSection({ subscriptionStatus }: { subscriptionStatus: SubscriptionStatus | null }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Subscription cancelled:', result.message);
        // Refresh the page to update subscription status
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error cancelling subscription:', error.error);
        alert('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleManageSubscription = () => {
    // This would typically open Stripe's customer portal
    window.open('https://billing.stripe.com/p/login/test_123', '_blank');
  };

  if (!subscriptionStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Loading subscription information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
        <CardDescription>Manage your Gary Chat Pro subscription</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionStatus.isSubscriber ? (
          <div className="space-y-4">
            {/* Pro Subscription Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Gary Chat Pro</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Unlimited access to all features:</p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Unlimited projects
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Unlimited AI interactions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  All phases (Launch & Market)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Premium tools & resources
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your Gary Chat Pro subscription? 
                      You'll lose access to unlimited features and revert to the free plan.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Keep Subscription</Button>
                    </DialogClose>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Free Plan Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Free Plan</span>
                <Badge variant="outline">Limited</Badge>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>You're currently on the free plan with limited features:</p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  Limited to 5 messages per day
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  Basic features only
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  No premium tools
                </li>
              </ul>
              <p className="mt-3 font-medium">
                Messages remaining today: {subscriptionStatus.remainingMessages}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-semibold text-lg">Upgrade to Gary Chat Pro</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get unlimited access to all features for just £15.99/month
                </p>
              </div>
              
              <Button 
                onClick={handleUpgrade}
                className="w-full"
                size="lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro - £15.99/month
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const id = useId();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const maxLength = 180;
  const {
    value,
    characterCount,
    handleChange,
    maxLength: limit,
  } = useCharacterLimit({
    maxLength,
    initialValue: "Hey, I'm Noah, a founder who loves building amazing products!",
  });

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscription-status');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="space-y-6">
            <ProfileBg defaultImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop&crop=center" />
            <Avatar defaultImage={`https://avatar.vercel.sh/${session.user.email}`} />
            
            <div className="px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{session.user.name || 'Noah Santoni'}</h1>
                  <p className="text-muted-foreground">{session.user.email}</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Edit profile</Button>
                  </DialogTrigger>
                  <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
                    <DialogHeader className="contents space-y-0 text-left">
                      <DialogTitle className="border-b border-border px-6 py-4 text-base">
                        Edit profile
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="sr-only">
                      Make changes to your profile here. You can change your photo and set a username.
                    </DialogDescription>
                    <div className="overflow-y-auto">
                      <ProfileBg defaultImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop&crop=center" />
                      <Avatar defaultImage={`https://avatar.vercel.sh/${session.user.email}`} />
                      <div className="px-6 pb-6 pt-4">
                        <form className="space-y-4">
                          <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1 space-y-2">
                              <Label htmlFor={`${id}-first-name`}>First name</Label>
                              <Input
                                id={`${id}-first-name`}
                                placeholder="Noah"
                                defaultValue="Noah"
                                type="text"
                                required
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label htmlFor={`${id}-last-name`}>Last name</Label>
                              <Input
                                id={`${id}-last-name`}
                                placeholder="Santoni"
                                defaultValue="Santoni"
                                type="text"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${id}-username`}>Username</Label>
                            <div className="relative">
                              <Input
                                id={`${id}-username`}
                                className="peer pe-9"
                                placeholder="Username"
                                defaultValue="noah-santoni"
                                type="text"
                                required
                              />
                              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                                <Check
                                  size={16}
                                  strokeWidth={2}
                                  className="text-emerald-500"
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${id}-website`}>Website</Label>
                            <div className="flex rounded-lg shadow-sm shadow-black/5">
                              <span className="-z-10 inline-flex items-center rounded-s-lg border border-input bg-background px-3 text-sm text-muted-foreground">
                                https://
                              </span>
                              <Input
                                id={`${id}-website`}
                                className="-ms-px rounded-s-none shadow-none"
                                placeholder="yourwebsite.com"
                                defaultValue="garyhormozi.com"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${id}-bio`}>Biography</Label>
                            <Textarea
                              id={`${id}-bio`}
                              placeholder="Write a few sentences about yourself"
                              defaultValue={value}
                              maxLength={maxLength}
                              onChange={handleChange}
                              aria-describedby={`${id}-description`}
                            />
                            <p
                              id={`${id}-description`}
                              className="mt-2 text-right text-xs text-muted-foreground"
                              role="status"
                              aria-live="polite"
                            >
                              <span className="tabular-nums">{limit - characterCount}</span> characters left
                            </p>
                          </div>
                        </form>
                      </div>
                    </div>
                    <DialogFooter className="border-t border-border px-6 py-4">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="button">Save changes</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <PasswordChangeSection />

          {/* Subscription Section */}
          <SubscriptionSection subscriptionStatus={subscriptionStatus} />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface AdminPasscodeProps {
  onSuccess: () => void;
}

export default function AdminPasscode({ onSuccess }: AdminPasscodeProps) {
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const CORRECT_PASSCODE = '4855';

  useEffect(() => {
    // Focus on first input when component mounts
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newPasscode = [...passcode];
    newPasscode[index] = value;
    setPasscode(newPasscode);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if passcode is complete
    if (newPasscode.every(digit => digit !== '') && newPasscode.join('') === CORRECT_PASSCODE) {
      onSuccess();
    } else if (newPasscode.every(digit => digit !== '')) {
      // Incorrect passcode
      setError('Incorrect passcode');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        // Clear passcode and focus first input
        setPasscode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      // Move to previous input if current is empty and backspace is pressed
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleReset = () => {
    setPasscode(['', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Admin Access</CardTitle>
          <p className="text-gray-600 text-sm">Enter the 4-digit passcode to continue</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className={`flex justify-center space-x-3 ${isShaking ? 'animate-pulse' : ''}`}>
              {passcode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type={showPasscode ? 'text' : 'password'}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-mono border-2 rounded-lg focus:border-primary focus:outline-none transition-colors ${
                    error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  maxLength={1}
                  inputMode="numeric"
                  pattern="\d"
                />
              ))}
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}
            
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasscode(!showPasscode)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showPasscode ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
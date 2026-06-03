'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { SignaturePad } from './SignaturePad';
import { useToast } from '@/hooks/use-toast';

interface SigningFormProps {
  contractId: string;
  partyId: string;
  partyName: string;
  contractTitle: string;
  onSuccess?: () => void;
}

export function SigningForm({
  contractId,
  partyId,
  partyName,
  contractTitle,
  onSuccess,
}: SigningFormProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!signature) {
      setError('Please provide your signature');
      return;
    }

    if (!consentGiven) {
      setError('You must agree to sign electronically');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/signatures/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          partyId,
          signatureImage: signature,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to sign document');
      }

      const result = await response.json();

      toast({
        title: 'Document Signed',
        description: 'Your signature has been recorded successfully.',
      });

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Signing Failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Sign Document</CardTitle>
        <CardDescription>
          You are signing <strong>{contractTitle}</strong> as{' '}
          <strong>{partyName}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Signature Pad */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Signature</label>
          <SignaturePad
            onChange={setSignature}
            width={550}
            height={200}
            className="w-full"
          />
        </div>

        {/* ESIGN Consent */}
        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="consent"
            checked={consentGiven}
            onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
          />
          <div className="space-y-1">
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I agree to sign electronically
            </label>
            <p className="text-xs text-gray-500">
              By checking this box, you consent to use electronic signatures and
              acknowledge that your electronic signature has the same legal validity
              as a handwritten signature under the ESIGN Act and applicable state laws.
            </p>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            <strong>Important:</strong> This is a legally binding document. By
            signing, you agree to be bound by its terms and conditions.
          </p>
          <p>
            Your signature will be cryptographically secured and an audit trail
            will be maintained for legal purposes. Your IP address and timestamp
            will be recorded.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!signature || !consentGiven || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Signing...' : 'Sign Document'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default SigningForm;

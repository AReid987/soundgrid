import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@soundgrid/database';
import { SigningForm } from '@/app/components/SigningForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';
import Link from 'next/link';

interface SigningPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SigningPage({ params }: SigningPageProps) {
  const { id: contractId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/contracts/' + contractId + '/sign');
  }

  // Fetch contract with parties
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      parties: {
        include: {
          signature: true,
        },
      },
    },
  });

  if (!contract) {
    notFound();
  }

  // Find the party that matches the current user
  const party = contract.parties.find(
    (p) =>
      p.userId === session.user.id ||
      p.email.toLowerCase() === session.user.email?.toLowerCase()
  );

  if (!party) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You are not a party to this contract and cannot sign it.
        </p>
        <Link href={`/contracts/${contractId}`}>
          <Button>View Contract</Button>
        </Link>
      </div>
    );
  }

  // Check if already signed
  if (party.signature) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Already Signed</h1>
        <p className="text-gray-600 mb-2">
          You signed this contract on{' '}
          {new Date(party.signature.signedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          .
        </p>
        <Link href={`/contracts/${contractId}`}>
          <Button className="mt-6">View Contract</Button>
        </Link>
      </div>
    );
  }

  // Count remaining signers
  const remainingSigners = contract.parties.filter((p) => !p.signature).length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/contracts/${contractId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Contract
        </Link>

        <h1 className="text-3xl font-bold mb-2">Sign Contract</h1>
        <p className="text-gray-600">
          Review the document below and provide your electronic signature.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contract Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{contract.title}</h2>
                {contract.draftPdfUrl && (
                  <Link
                    href={contract.draftPdfUrl}
                    target="_blank"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View PDF
                  </Link>
                )}
              </div>

              {/* Contract Content Preview */}
              <div className="border rounded-lg p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                {contract.terms ? (
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(contract.terms, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Contract content preview not available. Please view the PDF
                    version.
                  </p>
                )}
              </div>

              {/* Signing Progress */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Signing Progress</h3>
                <div className="space-y-2">
                  {contract.parties.map((p, index) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.role}</p>
                        </div>
                      </div>
                      {p.signature ? (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Signed
                        </span>
                      ) : p.id === party.id ? (
                        <span className="text-xs text-blue-600 font-medium">
                          Signing now
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Awaiting signature
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signing Form */}
        <div className="lg:col-span-1">
          <SigningForm
            contractId={contractId}
            partyId={party.id}
            partyName={party.name}
            contractTitle={contract.title}
            onSuccess={() => {
              // Client-side redirect handled in component
              window.location.href = `/contracts/${contractId}`;
            }}
          />

          {/* Help Text */}
          <div className="mt-6 text-xs text-gray-500 space-y-2">
            <p>
              <strong>Need help?</strong> Contact support if you have questions
              about signing this document.
            </p>
            <p>
              Your signature is secured using RSA-4096 encryption and meets
              ESIGN Act requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

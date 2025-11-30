import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Shield, ShieldCheck, Clock, ExternalLink, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlockchainStatusProps {
  entityType: 'hallmark' | 'vehicle';
  entityId: string;
  showVerifyButton?: boolean;
  compact?: boolean;
}

interface VerificationStatus {
  status: 'not_verified' | 'pending' | 'submitted' | 'confirmed' | 'failed';
  verification: {
    id: string;
    dataHash: string;
    txSignature?: string;
    network: string;
    solscanUrl?: string;
    createdAt: string;
    confirmedAt?: string;
  } | null;
}

export function BlockchainStatus({ entityType, entityId, showVerifyButton = true, compact = false }: BlockchainStatusProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: statusData, isLoading } = useQuery<VerificationStatus>({
    queryKey: ['blockchain-status', entityType, entityId],
    queryFn: async () => {
      const response = await fetch(`/api/blockchain/status/${entityType}/${entityId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch status');
      return response.json();
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'pending' || data?.status === 'submitted') {
        return 5000;
      }
      return false;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/blockchain/${entityType}/${entityId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verification failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blockchain-status', entityType, entityId] });
      if (data.success) {
        toast.success('Verification submitted to Solana blockchain');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const copyHash = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (statusData?.status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30" data-testid="badge-blockchain-verified">
            <ShieldCheck className="h-3 w-3 mr-1" />
            On-Chain Verified
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30" data-testid="badge-blockchain-pending">
            <Clock className="h-3 w-3 mr-1" />
            Pending Confirmation
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30" data-testid="badge-blockchain-processing">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30" data-testid="badge-blockchain-failed">
            <AlertCircle className="h-3 w-3 mr-1" />
            Verification Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30" data-testid="badge-blockchain-unverified">
            <Shield className="h-3 w-3 mr-1" />
            Not Verified
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking blockchain status...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        {statusData?.verification?.solscanUrl && (
          <a
            href={statusData.verification.solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300"
            data-testid="link-solscan"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-black/40 border-cyan-500/20 p-4" data-testid="card-blockchain-status">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan-400" />
          <h4 className="font-semibold text-white">Blockchain Verification</h4>
        </div>
        {getStatusBadge()}
      </div>

      {statusData?.verification ? (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Data Hash:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs text-cyan-400 bg-black/50 px-2 py-1 rounded">
                {statusData.verification.dataHash.substring(0, 16)}...
              </code>
              <button
                onClick={() => copyHash(statusData.verification!.dataHash)}
                className="text-gray-400 hover:text-white"
                data-testid="button-copy-hash"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          {statusData.verification.txSignature && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">TX Signature:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs text-green-400 bg-black/50 px-2 py-1 rounded">
                  {statusData.verification.txSignature.substring(0, 16)}...
                </code>
                <button
                  onClick={() => copyHash(statusData.verification!.txSignature!)}
                  className="text-gray-400 hover:text-white"
                  data-testid="button-copy-tx"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Network:</span>
            <Badge variant="outline" className="text-xs">
              Solana {statusData.verification.network}
            </Badge>
          </div>
          
          {statusData.verification.confirmedAt && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Verified At:</span>
              <span className="text-white">
                {new Date(statusData.verification.confirmedAt).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {statusData.verification.solscanUrl && (
            <a
              href={statusData.verification.solscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mt-3"
              data-testid="link-view-solscan"
            >
              <ExternalLink className="h-4 w-4" />
              View on Solscan
            </a>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400 mb-3">
            This {entityType} has not been verified on the blockchain yet.
          </p>
          {showVerifyButton && (
            <Button
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              data-testid="button-verify-blockchain"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Verify on Solana
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {statusData?.status === 'failed' && showVerifyButton && (
        <Button
          onClick={() => verifyMutation.mutate()}
          disabled={verifyMutation.isPending}
          variant="outline"
          className="w-full mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
          data-testid="button-retry-verification"
        >
          {verifyMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            'Retry Verification'
          )}
        </Button>
      )}
    </Card>
  );
}

export function BlockchainVerificationHistory() {
  const { data: verifications, isLoading } = useQuery({
    queryKey: ['blockchain-verifications'],
    queryFn: async () => {
      const response = await fetch('/api/blockchain/verifications', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch verifications');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!verifications?.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No blockchain verifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="list-verifications">
      {verifications.map((v: any) => (
        <Card key={v.id} className="bg-black/30 border-gray-800 p-3">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-1">
                {v.entityType}
              </Badge>
              <p className="text-xs text-gray-400">
                {new Date(v.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge 
              className={
                v.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                v.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                v.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }
            >
              {v.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

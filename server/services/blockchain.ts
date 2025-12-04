import { createHash } from 'crypto';
import { 
  Connection, 
  Keypair, 
  Transaction, 
  TransactionInstruction,
  sendAndConfirmTransaction,
  PublicKey,
  ComputeBudgetProgram
} from '@solana/web3.js';
import bs58 from 'bs58';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;

const HELIUS_RPC_URL = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';

const DEVNET_RPC_URL = HELIUS_API_KEY
  ? `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.devnet.solana.com';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export type EntityType = 'hallmark' | 'vehicle' | 'release';
export type VerificationStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';

export interface BlockchainData {
  entityType: EntityType;
  entityId: string;
  userId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface VerificationResult {
  success: boolean;
  dataHash: string;
  txSignature?: string;
  status: VerificationStatus;
  error?: string;
  solscanUrl?: string;
}

export function generateDataHash(data: BlockchainData): string {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  return createHash('sha256').update(jsonString).digest('hex');
}

export function getSolscanUrl(txSignature: string, network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'): string {
  const cluster = network === 'devnet' ? '?cluster=devnet' : '';
  return `https://solscan.io/tx/${txSignature}${cluster}`;
}

export async function getConnection(network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'): Promise<Connection> {
  const url = network === 'devnet' ? DEVNET_RPC_URL : HELIUS_RPC_URL;
  return new Connection(url, 'confirmed');
}

function getKeypair(): Keypair | null {
  if (!SOLANA_PRIVATE_KEY) {
    console.log('[blockchain] No SOLANA_PRIVATE_KEY configured');
    return null;
  }
  
  try {
    const privateKeyBytes = bs58.decode(SOLANA_PRIVATE_KEY);
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error('[blockchain] Failed to parse private key:', error);
    try {
      const jsonKey = JSON.parse(SOLANA_PRIVATE_KEY);
      if (Array.isArray(jsonKey)) {
        return Keypair.fromSecretKey(new Uint8Array(jsonKey));
      }
    } catch {
      console.error('[blockchain] Private key is not valid base58 or JSON array');
    }
    return null;
  }
}

export async function verifyTransactionStatus(
  txSignature: string,
  network: 'mainnet-beta' | 'devnet' = 'mainnet-beta'
): Promise<{ confirmed: boolean; slot?: number; blockTime?: number | null }> {
  try {
    const connection = await getConnection(network);
    const status = await connection.getSignatureStatus(txSignature);
    
    if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
      const txInfo = await connection.getTransaction(txSignature, { maxSupportedTransactionVersion: 0 });
      return {
        confirmed: true,
        slot: status.value.slot,
        blockTime: txInfo?.blockTime,
      };
    }
    
    return { confirmed: false };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { confirmed: false };
  }
}

export function prepareHallmarkData(hallmark: {
  id: string;
  userId: string;
  assetNumber: number | null;
  tier?: string | null;
  vehicleId?: string | null;
  isFounder?: boolean | null;
  createdAt?: Date | null;
}): BlockchainData {
  return {
    entityType: 'hallmark',
    entityId: hallmark.id,
    userId: hallmark.userId,
    timestamp: hallmark.createdAt?.toISOString() || new Date().toISOString(),
    data: {
      assetNumber: hallmark.assetNumber,
      tier: hallmark.tier,
      vehicleId: hallmark.vehicleId,
      isFounder: hallmark.isFounder,
      platform: 'GarageBot',
      version: '1.0',
    },
  };
}

export function prepareVehicleData(vehicle: {
  id: string;
  userId: string;
  vin?: string | null;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  vehicleType?: string | null;
  currentMileage?: number | null;
  createdAt?: Date | null;
}): BlockchainData {
  return {
    entityType: 'vehicle',
    entityId: vehicle.id,
    userId: vehicle.userId,
    timestamp: vehicle.createdAt?.toISOString() || new Date().toISOString(),
    data: {
      vin: vehicle.vin,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      vehicleType: vehicle.vehicleType,
      mileageAtVerification: vehicle.currentMileage,
      platform: 'GarageBot',
      version: '1.0',
    },
  };
}

export function prepareReleaseData(release: {
  id: string;
  version: string;
  versionType: string;
  changelog?: Record<string, string[]> | null;
  publishedAt?: Date | null;
}): BlockchainData {
  return {
    entityType: 'release',
    entityId: release.id,
    userId: 'system',
    timestamp: release.publishedAt?.toISOString() || new Date().toISOString(),
    data: {
      releaseVersion: release.version,
      versionType: release.versionType,
      changelogCategories: release.changelog ? Object.keys(release.changelog) : [],
      platform: 'GarageBot',
      schemaVersion: '1.0',
    },
  };
}

export async function submitMemoTransaction(
  dataHash: string,
  network: 'mainnet-beta' | 'devnet' = 'devnet'
): Promise<{ success: boolean; txSignature?: string; error?: string }> {
  const keypair = getKeypair();
  
  if (!keypair) {
    console.log('[blockchain] No keypair available, using hash-only mode');
    return {
      success: true,
      txSignature: `HASH_${dataHash.substring(0, 32)}`,
    };
  }

  try {
    const connection = await getConnection(network);
    
    const memoContent = `GarageBot:${dataHash}`;
    
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoContent, 'utf-8'),
    });

    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000,
    });

    const transaction = new Transaction();
    transaction.add(computeBudgetIx);
    transaction.add(memoInstruction);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = keypair.publicKey;

    console.log(`[blockchain] Submitting memo transaction to ${network}...`);
    console.log(`[blockchain] Wallet: ${keypair.publicKey.toBase58()}`);
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [keypair],
      {
        commitment: 'confirmed',
        maxRetries: 3,
      }
    );

    console.log(`[blockchain] Transaction confirmed: ${signature}`);
    
    return {
      success: true,
      txSignature: signature,
    };
  } catch (error: any) {
    console.error('[blockchain] Transaction failed:', error);
    
    if (error.message?.includes('insufficient funds') || error.message?.includes('Insufficient')) {
      return {
        success: false,
        error: 'Insufficient SOL balance for transaction fees. Please add SOL to your wallet.',
      };
    }
    
    return {
      success: true,
      txSignature: `HASH_${dataHash.substring(0, 32)}`,
      error: error.message,
    };
  }
}

export async function createVerification(
  data: BlockchainData,
  network: 'mainnet-beta' | 'devnet' = 'devnet'
): Promise<VerificationResult> {
  const dataHash = generateDataHash(data);
  
  const txResult = await submitMemoTransaction(dataHash, network);
  
  if (txResult.success && txResult.txSignature) {
    const isRealTx = !txResult.txSignature.startsWith('DEMO_') && !txResult.txSignature.startsWith('HASH_');
    
    return {
      success: true,
      dataHash,
      txSignature: txResult.txSignature,
      status: isRealTx ? 'submitted' : 'confirmed',
      solscanUrl: isRealTx ? getSolscanUrl(txResult.txSignature, network) : undefined,
    };
  }
  
  return {
    success: false,
    dataHash,
    status: 'failed',
    error: txResult.error || 'Failed to submit transaction',
  };
}

export async function checkBlockchainStatus(): Promise<{ 
  connected: boolean; 
  network?: string; 
  walletAddress?: string;
  balance?: number;
  error?: string 
}> {
  const keypair = getKeypair();
  
  if (!keypair) {
    return { 
      connected: false, 
      error: 'Solana wallet not configured. Add SOLANA_PRIVATE_KEY to secrets.' 
    };
  }
  
  try {
    const connection = await getConnection('devnet');
    const balance = await connection.getBalance(keypair.publicKey);
    const version = await connection.getVersion();
    
    return { 
      connected: true, 
      network: 'devnet',
      walletAddress: keypair.publicKey.toBase58(),
      balance: balance / 1e9,
    };
  } catch (error) {
    return { connected: false, error: String(error) };
  }
}

export async function getWalletBalance(network: 'mainnet-beta' | 'devnet' = 'devnet'): Promise<number | null> {
  const keypair = getKeypair();
  if (!keypair) return null;
  
  try {
    const connection = await getConnection(network);
    const balance = await connection.getBalance(keypair.publicKey);
    return balance / 1e9;
  } catch {
    return null;
  }
}

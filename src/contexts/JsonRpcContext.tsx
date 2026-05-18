import { createContext, PropsWithChildren, useContext } from 'react';
import { SageMethod } from '../constants/wallet-connect';
import { useWalletConnect } from './WalletConnectContext';

type Empty = Record<string, never>;

interface SpendableCoin {
    coin: {
        parent_coin_info: string;
        puzzle_hash: string;
        amount: number;
    };
    coinName: string;
    puzzle: string;
    confirmedBlockIndex: number;
    locked: boolean;
    lineageProof: {
        parent_name: string | null;
        inner_puzzle_hash: string | null;
        amount: number | null;
    } | null;
}

interface Nft {
    launcherId: string;
    collectionId: string | null;
    collectionName: string | null;
    minterDid: string | null;
    ownerDid: string | null;
    name: string | null;
    createdHeight: number | null;
    coinId: string;
    puzzleHash: string;
    royaltyPuzzleHash: string;
    royaltyTenThousandths: number;
    dataUris: string[];
    dataHash: string | null;
    metadataUris: string[];
    metadataHash: string | null;
    licenseUris: string[];
    licenseHash: string | null;
    editionNumber: number | null;
    editionTotal: number | null;
}

interface JsonRpc {
    chainId: (data: Empty) => Promise<string>;
    connect: (data?: { eager?: boolean }) => Promise<boolean>;
    getPublicKeys: (data: {
        limit?: number;
        offset?: number;
        hardened?: boolean;
    }) => Promise<string[]>;
    filterUnlockedCoins: (data: { coinNames: string[] }) => Promise<string[]>;
    getAssetCoins: (data: {
        type: 'cat' | 'nft' | 'did' | null;
        assetId: string | null;
        includeLocked: boolean | null;
        offset: number | null;
        limit: number | null;
    }) => Promise<SpendableCoin[]>;
    getAssetBalance: (data: {
        type: 'cat' | 'nft' | 'did' | null;
        assetId: string | null;
    }) => Promise<{
        spendable: number;
        confirmed: number;
        spendableCoinCount: number;
    }>;
    signCoinSpends: (data: unknown) => Promise<string>;
    signMessage: (data: {
        publicKey: string;
        message: string;
    }) => Promise<string>;
    sendTransaction: (
        data: unknown,
    ) => Promise<{ status: number; error: string | null }>;
    createOffer: (data: unknown) => Promise<{ offer: string; id: string }>;
    takeOffer: (data: { offer: string }) => Promise<{ id: string }>;
    cancelOffer: (data: {
        id: string;
        fee?: number | string;
    }) => Promise<Empty>;
    getNfts: (data: {
        collectionId?: string;
        offset: number | null;
        limit: number | null;
    }) => Promise<{ nfts: Nft[] }>;
    send: (data: {
        assetId?: string;
        amount: number | string;
        fee?: number | string;
        address: string;
        memos?: string[];
    }) => Promise<Empty>;
    getAddress: (data: Empty) => Promise<{ address: string }>;
    signMessageByAddress: (data: {
        message: string;
        address: string;
    }) => Promise<{ publicKey: string; signature: string }>;
    bulkMintNfts: (data: unknown) => Promise<{ nftIds: string[] }>;
}

export const JsonRpcContext = createContext<JsonRpc>({} as JsonRpc);

export function JsonRpcProvider({ children }: PropsWithChildren) {
    const { client, session, chainId, fingerprint } = useWalletConnect();

    async function request<T>(method: SageMethod, data: unknown): Promise<T> {
        if (!client) throw new Error('WalletConnect is not initialized');
        if (!session) throw new Error('Session is not connected');
        if (!fingerprint) throw new Error('Fingerprint is not loaded.');

        return await client?.request<T>({
            topic: session.topic,
            chainId,
            request: {
                method,
                params: data,
            },
        });
    }

    return (
        <JsonRpcContext.Provider
            value={{
                chainId: (data) => request(SageMethod.ChainId, data),
                connect: (data) => request(SageMethod.Connect, data),
                getPublicKeys: (data) =>
                    request(SageMethod.GetPublicKeys, data),
                filterUnlockedCoins: (data) =>
                    request(SageMethod.FilterUnlockedCoins, data),
                getAssetCoins: (data) =>
                    request(SageMethod.GetAssetCoins, data),
                getAssetBalance: (data) =>
                    request(SageMethod.GetAssetBalance, data),
                signCoinSpends: (data) =>
                    request(SageMethod.SignCoinSpends, data),
                signMessage: (data) => request(SageMethod.SignMessage, data),
                sendTransaction: (data) =>
                    request(SageMethod.SendTransaction, data),
                createOffer: (data) => request(SageMethod.CreateOffer, data),
                takeOffer: (data) => request(SageMethod.TakeOffer, data),
                cancelOffer: (data) => request(SageMethod.CancelOffer, data),
                getNfts: (data) => request(SageMethod.GetNfts, data),
                send: (data) => request(SageMethod.Send, data),
                getAddress: (data) => request(SageMethod.GetAddress, data),
                signMessageByAddress: (data) =>
                    request(SageMethod.SignMessageByAddress, data),
                bulkMintNfts: (data) => request(SageMethod.BulkMintNfts, data),
            }}
        >
            {children}
        </JsonRpcContext.Provider>
    );
}

export function useJsonRpc() {
    const context = useContext(JsonRpcContext);

    if (!context)
        throw new Error(
            'Calls to `useJsonRpc` must be used within a `JsonRpcProvider`.',
        );

    return context;
}

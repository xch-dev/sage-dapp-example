import { CssBaseline } from '@mui/material';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CHAIN_ID, PROJECT_ID, RELAY_URL } from './constants/env.ts';
import { JsonRpcProvider } from './contexts/JsonRpcContext.tsx';
import { WalletConnectProvider } from './contexts/WalletConnectContext.tsx';

const root = createRoot(document.querySelector('#root')!);

root.render(
    <WalletConnectProvider
        projectId={PROJECT_ID}
        relayUrl={RELAY_URL}
        chainId={CHAIN_ID}
    >
        <JsonRpcProvider>
            <CssBaseline />
            <App />
        </JsonRpcProvider>
    </WalletConnectProvider>
);

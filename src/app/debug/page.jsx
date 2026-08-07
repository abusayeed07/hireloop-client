'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

export default function DebugPage() {
    const [status, setStatus] = useState('Checking...');
    const [data, setData] = useState(null);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
    const [backendStatus, setBackendStatus] = useState(null);

    useEffect(() => {
        const testEverything = async () => {
            try {
                // 1. Test backend connection
                setStatus('Testing backend connection...');
                const healthRes = await fetch('http://localhost:5000/api/health', {
                    credentials: 'include',
                });
                
                if (healthRes.ok) {
                    const healthData = await healthRes.json();
                    setBackendStatus({ connected: true, data: healthData });
                } else {
                    setBackendStatus({ connected: false, status: healthRes.status });
                }

                // 2. Test auth client
                setStatus('Testing auth client...');
                const { data: sessionData, error: sessionError } = await authClient.getSession();
                
                if (sessionError) {
                    setError(sessionError);
                } else {
                    setSession(sessionData);
                }

                // 3. Test direct session endpoint
                setStatus('Testing session endpoint...');
                const sessionRes = await fetch('http://localhost:5000/api/auth/session', {
                    credentials: 'include',
                });
                const sessionResult = await sessionRes.json();

                setData({
                    authClientSession: sessionData,
                    directSession: sessionResult,
                });

                setStatus('✅ All tests complete!');
            } catch (err) {
                setStatus('❌ Error during testing');
                setError(err.message);
            }
        };
        
        testEverything();
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">🔍 Debug Connection</h1>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h2 className="font-semibold">Status:</h2>
                <p className="text-lg">{status}</p>
            </div>
            
            {error && (
                <div className="bg-red-100 p-4 rounded-lg mb-4">
                    <h2 className="font-semibold text-red-700">Error:</h2>
                    <p className="text-red-600">{error}</p>
                </div>
            )}
            
            {backendStatus && (
                <div className={`p-4 rounded-lg mb-4 ${backendStatus.connected ? 'bg-green-100' : 'bg-red-100'}`}>
                    <h2 className="font-semibold">Backend Connection:</h2>
                    <p>{backendStatus.connected ? '✅ Connected' : '❌ Not Connected'}</p>
                    {backendStatus.data && (
                        <pre className="bg-white p-2 rounded mt-2 text-sm overflow-auto">
                            {JSON.stringify(backendStatus.data, null, 2)}
                        </pre>
                    )}
                </div>
            )}
            
            {session && (
                <div className="bg-green-100 p-4 rounded-lg mb-4">
                    <h2 className="font-semibold text-green-700">Session:</h2>
                    <pre className="bg-white p-2 rounded mt-2 text-sm overflow-auto">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </div>
            )}
            
            {data && (
                <div className="bg-blue-100 p-4 rounded-lg mb-4">
                    <h2 className="font-semibold text-blue-700">Test Results:</h2>
                    <pre className="bg-white p-2 rounded mt-2 text-sm overflow-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
            
            <div className="bg-yellow-50 p-4 rounded-lg">
                <h2 className="font-semibold">Configuration:</h2>
                <p><strong>NEXT_PUBLIC_BASE_URL:</strong> {process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}</p>
                <p><strong>NEXT_PUBLIC_APP_URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
                <p><strong>NEXT_PUBLIC_BETTER_AUTH_URL:</strong> {process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'Not set'}</p>
            </div>
            
            <div className="mt-4 flex gap-4">
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Refresh
                </button>
                <button 
                    onClick={async () => {
                        const { error } = await authClient.signOut();
                        if (!error) {
                            window.location.href = '/signin';
                        }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
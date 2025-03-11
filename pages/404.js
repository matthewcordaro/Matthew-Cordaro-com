import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Custom404() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    router.push('/')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center',
            color: 'var(--text-color)'
        }}>
            <h1 style={{
                fontSize: '2rem',
                margin: '0 0 1rem 0',
            }}>
                404 - Page Not Found
            </h1>
            <p style={{ fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>
                Sorry, the page you are looking for does not exist.
            </p>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                margin: '0 0 1.5rem 0'
            }}>
                <div className="spinner" />
                <p>
                    Redirecting to home in {countdown} seconds...
                </p>
            </div>
            <a href="/"
               style={{
                   textDecoration: 'underline',
                   fontSize: '1rem'
               }}>
                Click here to return home immediately
            </a>
            <style jsx>{`
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 3px solid currentColor;
                    border-top: 3px solid transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
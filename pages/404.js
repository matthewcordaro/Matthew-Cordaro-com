import {useEffect, useState} from 'react'
import {useRouter} from 'next/router'

export default function Custom404() {
    const router = useRouter()
    const [showError, setShowError] = useState(false)

    useEffect(() => {
        // Get the current path from the URL
        const path = window.location.pathname

        // Remove any leading/trailing slashes and handle the base path
        const cleanPath = path.replace(/^\/+|\/+$/g, '')

        // Get the current router path without slashes for comparison
        const currentPathClean = router.asPath.replace(/^\/+|\/+$/g, '')

        if (cleanPath) {
            // If we're already at the clean path, show 404
            if (cleanPath === currentPathClean) {
                setShowError(true)
            } else {
                router.push('/' + cleanPath).catch(() => {
                    setShowError(true)
                })
            }
        } else {
            setShowError(true)
        }
    }, [router])

// Show 404 page if we've determined the path doesn't exist
    if (showError) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                textAlign: 'center'
            }}>
                <h1>404 - Page Not Found</h1>
                <p>Sorry, the page you are looking for does not exist.</p>
                <a href="/" style={{marginTop: '1rem', textDecoration: 'underline'}}>
                    Return to Home
                </a>
            </div>
        )
    }

// Show loading while we're trying the redirect
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            Loading...
        </div>
    )
}
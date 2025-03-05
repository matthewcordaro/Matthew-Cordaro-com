import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Custom404() {
    const router = useRouter()

    useEffect(() => {
        // Get the current path from the URL
        const path = window.location.pathname

        // Remove any leading/trailing slashes and handle the base path
        const cleanPath = path.replace(/^\/+|\/+$/g, '')

        // Only redirect if there's actually a path
        if (cleanPath) {
            router.push('/' + cleanPath)
        } else {
            router.push('/')
        }
    }, [router])

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
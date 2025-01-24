import 'nextra-theme-blog/style.css'
import Head from 'next/head'

import '../styles/main.css'

export default function Nextra({Component, pageProps}) {
    return (
        <>
            <Head>
                <link
                    rel="alternate"
                    type="application/rss+xml"
                    title="RSS"
                    href="/feed.xml"
                />
                <link
                    rel="preload"
                    href="/fonts/JetBrainsMono-Medium.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preload"
                    href="/fonts/JetBrainsMono-MediumItalic.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                <link
                    rel="icon"
                    href="favicon.png"
                    type="image/<generated>"
                    sizes="<generated>"
                />
            </Head>
            <Component {...pageProps} />
        </>
    )
}

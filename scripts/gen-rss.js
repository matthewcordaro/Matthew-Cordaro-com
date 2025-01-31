const {promises: fs} = require('fs')
const path = require('path')
const RSS = require('rss')
const matter = require('gray-matter')

/**
 * Generates an RSS feed based on the posts available in the specified directory.
 * Reads metadata from Markdown or MDX files located in the posts directory, processes these into RSS items,
 * and writes an RSS XML file to the public directory.
 *
 * @return {Promise<void>} A promise that resolves when the RSS feed file has been successfully generated and written.
 */
async function generate() {
    const feed = new RSS({
        title: 'Matthew Cordaro',
        description: 'Portfolio Website of Matthew Cordaro',
        site_url: 'https://matthewcordaro.com',
        feed_url: 'https://matthewcordaro.com/feed.xml'
    })

    const posts = await fs.readdir(path.join(__dirname, '..', 'pages', 'posts'))
    const allPosts = []

    await Promise.all(
        posts.map(async (name) => {
            if (name.startsWith('index.')) return

            const content = await fs.readFile(
                path.join(__dirname, '..', 'pages', 'posts', name)
            )
            const frontmatter = matter(content)

            allPosts.push({
                title: frontmatter.data.title,
                url: '/posts/' + name.replace(/\.mdx?/, ''),
                date: frontmatter.data.date,
                description: frontmatter.data.description,
                categories: frontmatter.data.tag.split(', '),
                author: frontmatter.data.author
            })
        })
    )

    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date))
    allPosts.forEach((post) => {
        if (post.name && post.name.charAt(0) === '_') return
        feed.item(post)
    })
    await fs.writeFile('./public/feed.xml', feed.xml({indent: true}))
}

generate().then(() => console.log('RSS generated'))
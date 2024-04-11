import fsAsync from 'fs/promises'
import fs from 'fs'

const COPY_PATTERN = [
    { regex: /main\\.[^\\.]+\\.css/, replace: 'main.css', to: './build/static/css', to: './deploy/static/css' }
]

async function copyBuild() {
    COPY_PATTERN.forEach(i => console.log(fs.readdirSync(i.from).find(s => s.endsWith('.css'))))
}

copyBuild();
import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const api = spawn(npmCommand, ['run', 'dev:api'], { stdio: 'inherit' })
const web = spawn(npmCommand, ['run', 'dev', '--', '--host', '127.0.0.1'], {
  stdio: 'inherit',
})

function stop() {
  api.kill()
  web.kill()
}

api.on('exit', (code) => {
  stop()
  process.exit(code ?? 1)
})
web.on('exit', (code) => {
  stop()
  process.exit(code ?? 1)
})
process.on('SIGINT', stop)
process.on('SIGTERM', stop)

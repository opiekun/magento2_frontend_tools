import fs from 'fs-extra'
import path from 'path'
import log from 'fancy-log'
import colors from 'ansi-colors'
import { env, projectPath } from '../helpers/config.mjs'

export const setup = async (callback) => {
  const relativeDirectory = path.relative(
    projectPath,
    await fs.realpath('./')
  )
  const symlinkDirectoryName = env.symlink || 'tools'
  const configSamplesPath = path.resolve('./config/')
  const configPath = path.join(projectPath, 'dev/tools/frontools/config/')

  // Prepare log messages to batch output
  const logMessages = []

  // Symlink creation task
  const symlinkTask = fs.symlink(
    relativeDirectory,
    path.join(projectPath, symlinkDirectoryName),
    'dir'
  ).then(() => {
    logMessages.push(colors.green(`Symlink created. You can now use Frontools from the "${symlinkDirectoryName}" directory.`))
  }).catch((error) => {
    logMessages.push(colors.yellow(`${symlinkDirectoryName} already exists. Skipped it.`))
  })

  // Config copy task
  const configCopyTask = fs.readdir(configSamplesPath)
    .then(files => Promise.all(files.map(async (fileName) => {
      const newFileName = fileName.replace('.sample', '')
      try {
        await fs.copy(
          path.join(configSamplesPath, fileName),
          path.join(configPath, newFileName), {
            overwrite: false,
            errorOnExist: true
          }
        )
        logMessages.push(`File ${fileName} copied to /dev/tools/frontools/config/${newFileName}`)
      } catch (error) {
        logMessages.push(colors.yellow(`File ${newFileName} already exists. Skipped it.`))
      }
    })))
    .catch(error => {
      logMessages.push(colors.red('Error reading config samples: ' + error.message))
    })

  // Run both tasks in parallel
  await Promise.all([symlinkTask, configCopyTask])

  // Output all log messages at once
  logMessages.forEach(msg => log(msg))

  log(colors.green('Setup complete! Go to "/dev/tools/frontools/config/" directory and edit the configuration there.'))
  callback()
}
import { Command, Flags } from '@oclif/core'
import Utils from '../../classes/utils'
import path from 'path'
import yaml from 'js-yaml'
import fs from 'fs'
import { ICostume } from '../../interfaces'

// libraries
import chalk from 'chalk'

/**
 * 
 */
export default class List extends Command {
  static description = 'list, wear costumes'

  static flags = {
    gardrobe: Flags.string({ char: 'g', description: 'gardrobe' }),
    verbose: Flags.boolean({ char: 'v' }),
    help: Flags.help({ char: 'h' })
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(List)

    let verbose = false
    if (flags.verbose) {
      verbose = true
    }

    const echo = Utils.setEcho(verbose)
    Utils.titles(this.id + ' ' + this.argv)

    let gardrobe = `${path.resolve(__dirname, '../../../gardrobe.d')}`

    let position = "eggs"
    if (flags.gardrobe !== undefined) {
      position = "external"
      gardrobe = flags.gardrobe
    }

    const costumes = fs.readdirSync(gardrobe)
    console.log(chalk.green(`${position} gardrobe: ${gardrobe}`))
    costumes.forEach(costume => {
      if (fs.existsSync(`${gardrobe}/${costume}/index.yml`)) {
        console.log()
        console.log(`costume: ${costume}`)
        const ingredients = yaml.load(fs.readFileSync(`${gardrobe}/${costume}/index.yml`, 'utf-8')) as ICostume
        console.log(`description: ${ingredients.description}`)
        console.log(`author: ${ingredients.author}`)
      }
    })
  }
}
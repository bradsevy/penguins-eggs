/**
 * https://stackoverflow.com/questions/23876782/how-do-i-split-a-typescript-class-into-multiple-files
 */

import Sequence from '../krill-sequence'
import { exec } from '../../lib/utils'
import Utils from '../../classes/utils'
import path from 'path'

/**
   * initramfs()
   */
export default async function initramfs(this: Sequence) {
    if (this.distro.familyId === 'debian') {
        await exec(`chroot ${this.installTarget} mkinitramfs -o ~/initrd.img-$(uname -r) ${this.toNull}`, this.echo)
        await exec(`chroot ${this.installTarget} mv ~/initrd.img-$(uname -r) /boot ${this.toNull}`, this.echo)
    } else if (this.distro.familyId === 'archlinux') {
        let initrdImg = Utils.initrdImg()
        initrdImg = initrdImg.substring(initrdImg.lastIndexOf('/') + 1)
        const cmd = `mkinitcpio -c ${path.resolve(__dirname, '../../../mkinitcpio/manjaro/mkinitcpio-install.conf')} -g ${this.installTarget}/boot/${initrdImg}` // ${this.toNull}
        try {
            await exec(cmd, Utils.setEcho(true))
        } catch (error) {
            await Utils.pressKeyToExit(cmd)
        }

    }
}
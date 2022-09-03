/**
 * penguins-eggs-v7 based on Debian live
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */
import { Command, Flags } from '@oclif/core'
import os from 'node:os'
import fs from 'fs'
import Utils from '../classes/utils'
import Settings from '../classes/settings'
import { IWorkDir } from '../interfaces/i-workdir'

import { exec } from '../lib/utils'
import { fileURLToPath } from 'url'

export default class Cuckoo extends Command {
  config_file = '/etc/penguins-eggs.d/eggs.yaml' as string
  snapshot_dir = '' as string
  work_dir = {} as IWorkDir


  static description = 'cuckoo start a boot server on the LAN sharing iso on the nest'

  static flags = {
    help: Flags.help({ char: 'h' }),
    verbose: Flags.boolean({ char: 'v', description: 'verbose' })
  }

  static examples = ['$ eggs cuckoo\ncuckoo start a boot server sharing eggs on the nest']

  async run(): Promise<void> {
    Utils.titles(this.id + ' ' + this.argv)

    const { flags } = await this.parse(Cuckoo)
    let verbose = flags.verbose
    const echo = Utils.setEcho(verbose)

    if (Utils.isRoot()) {
      const settings = new Settings()
      await settings.load()
      console.log('starting PXE server on ' + Utils.address() + '/' + Utils.netmask())
      console.log('we will use iso images from ' + settings.config.snapshot_dir)
      dnsmasq()
    } else {
      Utils.useRoot(this.id)
    }
  }
}


function dnsmasq() {
  let iface = Utils.iface()
  let domain = `penguins-eggs.lan`
  let dhcpRange=`192.168.1.160,192.168.1.200,255.255.255.0,2h`
  console.log(`cut and past to /etc/dnsmasq.conf`)

  console.log()
  console.log(`# Don't function as a DNS server:\nport=0\n`)
  console.log(`# Log lots of extra information about DHCP transactions.\nlog-dhcp\n`)
  

  console.log(`interface=${iface},lo`)
  console.log(`bind-interfaces`)
  console.log(`domain=${domain}`)
  console.log(`dhcp-range=${dhcpRange}`)
  console.log(`# gateway\ndhcp-option=3,${Utils.gateway()}`)
  console.log(`# dns\ndhcp-option=6,${Utils.getDns()}`)
  
  /**
   * 
   * https://serverfault.com/questions/829068/trouble-with-dnsmasq-dhcp-proxy-pxe-for-uefi-clients
   * 
# Don't function as a DNS server:
port=0

# Log lots of extra information about DHCP transactions.
log-dhcp

# Set the root directory for files available via FTP.
tftp-root=/tftpboot

# Disable re-use of the DHCP servername and filename fields as extra
# option space. That's to avoid confusing some old or broken DHCP clients.
dhcp-no-override

# The boot filename, Server name, Server Ip Address
dhcp-boot=bios/pxelinux,,192.168.1.200

# PXE menu.  The first part is the text displayed to the user.  The second is the timeout, in seconds.
# pxe-prompt="Booting PXE Client", 1

# The known types are x86PC, PC98, IA64_EFI, Alpha, Arc_x86,
# Intel_Lean_Client, IA32_EFI, ARM_EFI, BC_EFI, Xscale_EFI and X86-64_EFI
# This option is first and will be the default if there is no input from the user.

# PXEClient:Arch:00000
pxe-service=X86PC, "Boot BIOS PXE", bios/pxelinux

# PXEClient:Arch:00007
pxe-service=BC_EFI, "Boot UEFI PXE-BC", efi64/syslinux.efi

# PXEClient:Arch:00009
pxe-service=X86-64_EFI, "Boot UEFI PXE-64", efi64/syslinux.efi

dhcp-range=192.168.1.200,proxy,255.255.255.0
    )
   */
}
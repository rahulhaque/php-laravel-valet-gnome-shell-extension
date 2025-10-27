import GObject from 'gi://GObject'
import Gio from 'gi://Gio'
import St from 'gi://St'
import Clutter from 'gi://Clutter'

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js'
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js'
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js'
import * as Utils from './utils.js'

import * as Main from 'resource:///org/gnome/shell/ui/main.js'
import {phpVersion} from './utils.js'

const PhpLaravelValet = GObject.registerClass(
    class PhpLaravelValet extends PanelMenu.Button {
        _init(ext) {
            super._init(1.0, null, false)

            this._extension = ext
            this._settings = ext.getSettings()
            this._settings.connect('changed', () => {
                this._refreshIndicator()
                this._refreshMenu()
            })

            this._indicatorText = new St.Label({text: _('Loading...'), y_align: Clutter.ActorAlign.CENTER})
            this.add_child(this._indicatorText)

            // initializing the menu with demo item
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_('Loading...')))

            this._refreshIndicator()

            this.menu.connect('open-state-changed', (menu, open) => {
                if (open) {
                    this._refreshMenu()
                }
            })
        }

        _refreshIndicator() {
            const phpVersion = Utils.phpVersion()

            if (phpVersion) {
                this._settings.get_boolean('shorten-php-version') ?
                    this._indicatorText.set_text(phpVersion.replace(/^(\D*\d+\.\d+).*/, '$1')) :
                    this._indicatorText.set_text(phpVersion)
            } else {
                this._indicatorText.set_text(_('PHP not found'))
            }
        }

        _refreshMenu() {
            this.menu.removeAll()

            if (this.menuSection1() && (this.shouldShowMenuSection3() || this.shouldShowMenuSection4())) {
                this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            }

            if (this.menuSection2() && (this.shouldShowMenuSection3() || this.shouldShowMenuSection4())) {
                this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            }

            this.menuSection3()

            if (this.shouldShowMenuSection4()) {
                this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            }

            this.menuSection4()
        }

        _switchPhp(version) {
            const terminal = this._settings.get_string('default-shell').split(' ')
            try {
                let proc = Gio.Subprocess.new(
                    terminal.concat(['valet', 'use', version]),
                    Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
                )

                proc.communicate_utf8_async(null, null, (proc, res) => {
                    if (proc.get_successful()) {
                        this._refreshIndicator()
                    }
                })
            } catch (e) {
                logError(e)
            }
        }

        /**
         * @return {boolean}
         */
        menuSection1() {
            if (! this._settings.get_boolean('show-status')) {
                return false
            }

            const valetStatus = Utils.valetStatus()

            if (valetStatus.length > 0) {
                valetStatus.forEach(item => {
                    this.menu.addMenuItem(new PopupMenu.PopupMenuItem(item.replace(/\.\.\./g, '')))
                })
            } else {
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_('Valet not found')))
            }

            return true
        }

        /**
         * @return {boolean}
         */
        menuSection2() {
            let state = false

            // switch php sub menu
            if (this._settings.get_boolean('show-php-switcher')) {
                const phpSubMenu = new PopupMenu.PopupSubMenuMenuItem(_('Switch PHP'))
                const phpList = Utils.phpList()

                if (phpList.length > 0) {
                    phpList.forEach(item => {
                        const subMenu = new PopupMenu.PopupMenuItem(_('Switch to ') + item)
                        subMenu.connect('activate', () => this._switchPhp(item))
                        phpSubMenu.menu.addMenuItem(subMenu)
                    })
                } else {
                    phpSubMenu.menu.addMenuItem(new PopupMenu.PopupMenuItem(_('PHP not found')))
                }
                this.menu.addMenuItem(phpSubMenu)

                state = true
            }

            // valet start/restart menu
            if (this._settings.get_boolean('show-valet-restart')) {
                const valetRestart = new PopupMenu.PopupMenuItem(_('Valet start/restart'))
                valetRestart.connect('activate', () => Utils.valetRestart())
                this.menu.addMenuItem(valetRestart)

                state = true
            }

            // valet stop menu
            if (this._settings.get_boolean('show-valet-stop')) {
                const valetStop = new PopupMenu.PopupMenuItem(_('Valet stop'))
                valetStop.connect('activate', () => Utils.valetStop())
                this.menu.addMenuItem(valetStop)

                state = true
            }

            return state
        }

        menuSection3()
        {
            if (! this.shouldShowMenuSection3()) {
                return
            }

            const valetLinks = Utils.valetList()

            if (valetLinks.length < 1) {
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_('No Links Found')))

                return
            }

            const linksSubMenu = new PopupMenu.PopupSubMenuMenuItem(_('Valet Sites'))

            valetLinks.forEach(site => {
                const label = site.site + ' (PHP ' + site.php + ')'
                const siteItem = new PopupMenu.PopupMenuItem(label)
                siteItem.connect('activate', () => Gio.AppInfo.launch_default_for_uri(site.url, null))

                linksSubMenu.menu.addMenuItem(siteItem)
            })

            // Add submenu to main menu
            this.menu.addMenuItem(linksSubMenu)
        }

        menuSection4() {
            if (! this.shouldShowMenuSection4()) {
                return
            }

            // settings menu
            const settings = new PopupMenu.PopupMenuItem(_('Settings'))
            settings.connect('activate', () => this._extension.openPreferences())
            this.menu.addMenuItem(settings)
        }

        /**
         * @return {boolean}
         */
        shouldShowMenuSection3() {
            return this._settings.get_boolean('show-links')
        }

        /**
         * @return {boolean}
         */
        shouldShowMenuSection4() {
            return this._settings.get_boolean('show-settings')
        }
    }
)

export default class PhpLaravelValetExtension extends Extension {
    enable() {
        this._indicator = new PhpLaravelValet(this)
        Main.panel.addToStatusArea(this.uuid, this._indicator)
    }

    disable() {
        this._indicator.destroy()
        this._indicator = null
    }
}

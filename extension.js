import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Utils from './utils.js'

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const PhpLaravelValet = GObject.registerClass(
    class PhpLaravelValet extends PanelMenu.Button {
        _init(ext) {
            super._init(1.0, null, false);

            this._extension = ext;
            this._settings = ext.getSettings();
            this._settings.connect('changed', () => this._refreshIndicator());

            this._indicatorText = new St.Label({ text: _('Loading...'), y_align: Clutter.ActorAlign.CENTER });
            this.add_actor(this._indicatorText);

            // initializing the menu with demo item
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_('Loading...')));

            this._refreshIndicator();

            this.menu.connect('open-state-changed', (menu, open) => {
                if (open) this._refreshMenu();
            });
        }

        _refreshIndicator() {
            const phpVersion = Utils.phpVersion();
            if (phpVersion) {
                this._indicatorText.set_text(phpVersion);
            } else {
                this._indicatorText.set_text(_('PHP not found'));
            }
        }

        _refreshMenu() {
            this.menu.removeAll();

            // valet status menu
            const valetStatus = Utils.valetStatus();
            if (valetStatus.length > 0) {
                valetStatus.forEach(item => {
                    this.menu.addMenuItem(new PopupMenu.PopupMenuItem(item.replace(/\.\.\./g, '')));
                })
            } else {
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_('Valet not found')));
            }

            // menu separator
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            // switch php sub menu
            const phpSubMenu = new PopupMenu.PopupSubMenuMenuItem(_('Switch PHP'));
            const phpList = Utils.phpList();
            if (phpList.length > 0) {
                phpList.forEach(item => {
                    const subMenu = new PopupMenu.PopupMenuItem(_('Switch to ') + item);
                    subMenu.connect('activate', () => this._switchPhp(item));
                    phpSubMenu.menu.addMenuItem(subMenu);
                })
            } else {
                phpSubMenu.menu.addMenuItem(new PopupMenu.PopupMenuItem(_('PHP not found')));
            }
            this.menu.addMenuItem(phpSubMenu);

            // valet start/restart menu
            const valetRestart = new PopupMenu.PopupMenuItem(_('Valet start/restart'));
            valetRestart.connect('activate', () => Utils.valetRestart());
            this.menu.addMenuItem(valetRestart);

            // valet stop menu
            const valetStop = new PopupMenu.PopupMenuItem(_('Valet stop'));
            valetStop.connect('activate', () => Utils.valetStop());
            this.menu.addMenuItem(valetStop);


            if (this._settings.get_boolean('show-settings')) {
                // menu separator
                this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

                // settings menu
                const settings = new PopupMenu.PopupMenuItem(_('Settings'));
                settings.connect('activate', () => this._extension.openPreferences());
                this.menu.addMenuItem(settings);
            }
        }

        _switchPhp(version) {
            const terminal = this._settings.get_string('default-shell').split(' ');
            try {
                let proc = Gio.Subprocess.new(
                    terminal.concat(['valet', 'use', version]),
                    Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
                );

                proc.communicate_utf8_async(null, null, (proc, res) => {
                    if (proc.get_successful()) this._refreshIndicator();
                });
            } catch (e) {
                logError(e);
            }
        }
    }
);

export default class PhpLaravelValetExtension extends Extension {
    enable() {
        this._indicator = new PhpLaravelValet(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

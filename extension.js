'use strict';

const {GObject, GLib, Gio, St, Clutter} = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const PhpLaravelValet = GObject.registerClass(
    class PhpLaravelValet extends PanelMenu.Button {
        _init() {
            super._init(0.0, null, false);

            this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.php-laravel-valet');

            this._indicatorText = new St.Label({text: 'Loading...', y_align: Clutter.ActorAlign.CENTER});
            this.add_actor(this._indicatorText);

            // Initialising the menu with demo item
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem('Loading...'));

            this._refreshIndicator();

            this.menu.connect('open-state-changed', (menu, open) => {
                if (open) this._refreshMenu()
            });
        }

        _refreshIndicator() {
            const phpVersion = Utils.phpVersion();
            if (phpVersion) {
                this._indicatorText.set_text(phpVersion);
            } else {
                this._indicatorText.set_text('PHP not found');
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
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem('Valet not found'));
            }

            // menu separator
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            // switch php sub menu
            const phpSubMenu = new PopupMenu.PopupSubMenuMenuItem('Switch PHP');
            const phpList = Utils.phpList();
            if (phpList.length > 0) {
                phpList.forEach(item => {
                    const subMenu = new PopupMenu.PopupMenuItem('Switch to ' + item);
                    subMenu.connect('activate', () => this._switchPhp(item));
                    phpSubMenu.menu.addMenuItem(subMenu);
                })
            } else {
                phpSubMenu.menu.addMenuItem(new PopupMenu.PopupMenuItem('PHP not found'));
            }
            this.menu.addMenuItem(phpSubMenu);

            // valet start/restart menu
            const valetRestart = new PopupMenu.PopupMenuItem('Valet start');
            valetRestart.connect('activate', () => Utils.valetRestart());
            this.menu.addMenuItem(valetRestart);

            // valet stop menu
            const valetStop = new PopupMenu.PopupMenuItem('Valet stop');
            valetStop.connect('activate', () => Utils.valetStop());
            this.menu.addMenuItem(valetStop);
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
)

let phpLaravelValet = null;

function enable() {
    phpLaravelValet = new PhpLaravelValet();
    Main.panel.addToStatusArea('php-laravel-valet', phpLaravelValet);
}

function disable() {
    phpLaravelValet.destroy();
    phpLaravelValet = null;
}

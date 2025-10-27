import Gio from 'gi://Gio'
import Adw from 'gi://Adw'
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

export default class PhpLaravelValetPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic'
        })
        window.add(page)

        // create a preferences group, add to page
        const group = new Adw.PreferencesGroup({
            title: _('Settings'),
            description: _('Configure the settings of the extension')
        })
        page.add(group)

        // create a new preferences row
        const show_settings = new Adw.SwitchRow({
            title: _('Show Settings'),
            subtitle: _('Whether to show the settings in menu')
        })
        group.add(show_settings)

        // create a new preferences row
        const shorten_php_version = new Adw.SwitchRow({
            title: _('Shorten PHP Version in Top Bar'),
            subtitle: _('Shortens the displayed PHP version in the Ubuntu top bar, showing 8.4 instead of 8.4.13 for a cleaner appearance.')
        })
        group.add(shorten_php_version)

        // create a new preferences row
        const show_links = new Adw.SwitchRow({
            title: _('Display Links in Top Bar'),
            subtitle: _('Show Valet linked sites in the top bar.')
        })
        group.add(show_links)

        // create a settings object and bind inputs
        window._settings = this.getSettings()
        window._settings.bind('show-settings', show_settings, 'active', Gio.SettingsBindFlags.DEFAULT)
        window._settings.bind('shorten-php-version', shorten_php_version, 'active', Gio.SettingsBindFlags.DEFAULT)
        window._settings.bind('show-links', show_links, 'active', Gio.SettingsBindFlags.DEFAULT)

        window.set_default_size(620, 300)
    }
}
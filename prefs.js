import Gio from 'gi://Gio'
import Adw from 'gi://Adw'
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

export default class PhpLaravelValetPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create page
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        // Create group
        const group = new Adw.PreferencesGroup({
            title: _('Settings'),
            description: _('Configure the settings of the extension'),
        });
        page.add(group);

        // Define switchable boolean settings
        /** @type {Record<string, {title: string, subtitle: string}>} */
        const booleanRows = {
            'shorten-php-version': {
                title: _('Shorten PHP'),
                subtitle: _('Shortens the displayed PHP version in the Ubuntu top bar, showing 8.4 instead of 8.4.13 for a cleaner appearance.'),
            },
            'show-status': {
                title: _('Show Status'),
                subtitle: _('Whether to show the Valet status.'),
            },
            'show-php-switcher': {
                title: _('Show “Switch PHP”'),
                subtitle: _('Whether to show the PHP switcher.'),
            },
            'show-valet-restart': {
                title: _('Show “Valet Start/Restart”'),
                subtitle: _('Whether to show the option to start/restart Valet.'),
            },
            'show-valet-stop': {
                title: _('Show “Valet stop”'),
                subtitle: _('Whether to show the option to stop Valet.'),
            },
            'show-links': {
                title: _('Show Links'),
                subtitle: _('Whether to show the Valet linked sites.'),
            },
            'show-settings': {
                title: _('Show Settings'),
                subtitle: _('Whether to show the settings in menu.'),
            },
        };

        // Get extension settings object (GSettings)
        const settings = this.getSettings();

        // Generate rows and bind each to GSettings key
        for (const [key, { title, subtitle }] of Object.entries(booleanRows)) {
            const row = new Adw.SwitchRow({ title, subtitle });
            group.add(row);

            settings.bind(key, row, 'active', Gio.SettingsBindFlags.DEFAULT);
        }

        // Optional window sizing
        window.set_default_size(620, 560);
    }
}

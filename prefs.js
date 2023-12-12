import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PhpLaravelValetPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        // create a preferences group, add to page
        const group = new Adw.PreferencesGroup({
            title: _('Settings'),
            description: _('Configure the settings of the extension'),
        });
        page.add(group);

        // create a new preferences row
        const show_settings = new Adw.SwitchRow({
            title: _('Show Settings'),
            subtitle: _('Whether to show the settings in menu'),
        });
        group.add(show_settings);

        // create a settings object and bind inputs
        window._settings = this.getSettings();
        window._settings.bind('show-settings', show_settings, 'active', Gio.SettingsBindFlags.DEFAULT);

        window.set_default_size(620, 300);
    }
}
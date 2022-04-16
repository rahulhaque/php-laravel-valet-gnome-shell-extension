'use strict';

const Bytes = imports.byteArray;
const GLib = imports.gi.GLib;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const _settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.php-laravel-valet');

function safeSpawn(cmd) {
    try {
        return GLib.spawn_command_line_sync(cmd);
    } catch (e) {
        return [false, Bytes.fromString(''), null, null];
    }
}

function shellSpawn(cmd) {
    const terminal = _settings.get_string('default-shell');
    GLib.spawn_command_line_async(`${terminal} ${cmd}`);
}

function phpVersion() {
    const res = safeSpawn('/bin/bash -c "php -v | grep -Po \'PHP\\s+\\d+.\\d+(?:(.\\d+))?\'"');
    if (res[3] == 0) return Bytes.toString(res[1]).replace(/\n$/, '');
    return false;
}

function phpList() {
    const res = safeSpawn('ls /etc/php');
    if (res[3] == 0) return Bytes.toString(res[1]).split('\n').filter(item => !!item).reverse();
    return false;
}

function valetStatus() {
    const res = safeSpawn('/bin/bash -c "valet --version && valet status"');
    if (res[3] == 0) return Bytes.toString(res[1]).split('\n').filter(item => !!item);
    return false;
}

function valetRestart() {
    shellSpawn('valet restart');
}

function valetStop() {
    shellSpawn('valet stop');
}

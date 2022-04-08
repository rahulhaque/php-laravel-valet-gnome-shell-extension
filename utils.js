'use strict';

const Bytes = imports.byteArray;
const GLib = imports.gi.GLib;

function safeSpawn(cmd) {
    try {
        return GLib.spawn_command_line_sync(cmd);
    } catch (e) {
        return [false, Bytes.fromString(''), null, null];
    }
}

function valetStatus() {
    const res = safeSpawn('/bin/bash -c "valet --version && valet status"');
    if (res[3] == 0) return Bytes.toString(res[1]).split('\n').filter(item => !!item);
    return false;
}

function valetRestart() {
    GLib.spawn_command_line_async('x-terminal-emulator -e valet restart');
}

function valetStop() {
    GLib.spawn_command_line_async('x-terminal-emulator -e valet stop');
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

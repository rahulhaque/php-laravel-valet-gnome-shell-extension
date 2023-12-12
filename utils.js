import GLib from 'gi://GLib';
import Bytes from 'gi://GLib/Bytes';

export function safeSpawn(cmd) {
    try {
        return GLib.spawn_command_line_sync(cmd);
    } catch (e) {
        return [false, Bytes.fromString(''), null, null];
    }
}

export function shellSpawn(cmd) {
    const terminal = 'x-terminal-emulator -e';
    GLib.spawn_command_line_async(`${terminal} ${cmd}`);
}

export function phpVersion() {
    const res = safeSpawn('/bin/bash -c "php -v | grep -Po \'PHP\\s+\\d+.\\d+(?:(.\\d+))?\'"');
    if (res[3] == 0) return Bytes.toString(res[1]).replace(/\n$/, '');
    return false;
}

export function phpList() {
    const res = safeSpawn('ls /etc/php');
    if (res[3] == 0) return Bytes.toString(res[1]).split('\n').filter(item => !!item).reverse();
    return false;
}

export function valetStatus() {
    const res = safeSpawn('/bin/bash -c "valet --version && valet status"');
    if (res[3] == 0) return Bytes.toString(res[1]).split('\n').filter(item => !!item);
    return false;
}

export function valetRestart() {
    shellSpawn('valet restart');
}

export function valetStop() {
    shellSpawn('valet stop');
}
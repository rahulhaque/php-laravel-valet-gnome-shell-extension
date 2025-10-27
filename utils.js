import GLib from 'gi://GLib';

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

    if (res[3] == 0) {
        return String.fromCharCode(...res[1]).replace(/\n$/, '')
    }

    return false;
}

export function phpList() {
    const res = safeSpawn('ls /etc/php');

    if (res[3] == 0) {
        return String.fromCharCode(...res[1]).split('\n').filter(item => !!item).reverse()
    }

    return false;
}

/**
 * Retrieves and parses the output of `valet list`.
 *
 * @returns {Array<{site: string, ssl: boolean, url: string, path: string, php: string}>}
 */
export function valetList() {
    const res = safeSpawn('/bin/bash -c "valet links"');

    if (res[3] == 0) {
        const lines = String.fromCharCode(...res[1]).split('\n').filter(item => !!item)

        return lines
            .filter(line => line.startsWith('|') && !line.startsWith('| Site') && !line.startsWith('+'))
            .map(line => {
                const parts = line.split('|').map(item => item.trim()).slice(1, -1)
                return {
                    site: parts[0],
                    ssl: !!parts[1],
                    url: parts[2],
                    path: parts[3],
                    php: parts[4],
                };
            })
    }

    return []
}

export function valetStatus() {
    const res = safeSpawn('/bin/bash -c "valet --version && valet status"');

    if (res[3] == 0) {
        return String.fromCharCode(...res[1]).split('\n').filter(item => !!item)
    }

    return false;
}

export function valetRestart() {
    shellSpawn('valet restart');
}

export function valetStop() {
    shellSpawn('valet stop');
}
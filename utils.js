import GLib from 'gi://GLib'

export function safeSpawn(cmd) {
    try {
        return GLib.spawn_command_line_sync(cmd)
    } catch (e) {
        return [false, new Uint8Array(0), new Uint8Array(0), -1]
    }
}

export function shellSpawn(cmd) {
    const terminal = 'x-terminal-emulator -e'

    GLib.spawn_command_line_async(`${terminal} ${cmd}`)
}

/**
 * Retrieves and parses the output of `php -v`.
 *
 * @return {null|string}
 */
export function phpVersion() {
    const res = safeSpawn('/bin/bash -c "php -v | grep -Po \'PHP\\s+\\d+.\\d+(?:(.\\d+))?\'"')

    if (res[3] == 0) {
        let output = '';
        try {
            output = new TextDecoder().decode(res[1]);
        } catch (e) {
            output = String.fromCharCode(...res[1]);
        }
        return output.replace(/\n$/, '')
    }

    return null
}

/**
 * Retrieves and parses the output of `ls /etc/php`.
 *
 * @return {string[]}
 */
export function phpList() {
    const res = safeSpawn('ls /etc/php')

    if (res[3] == 0) {
        let output = '';
        try {
            output = new TextDecoder().decode(res[1]);
        } catch (e) {
            output = String.fromCharCode(...res[1]);
        }
        return output.split('\n').filter(item => !!item).reverse()
    }

    return []
}

/**
 * Retrieves and parses the output of `valet links`.
 *
 * @returns {Array<{site: string, ssl: boolean, url: string, path: string, php: string}>}
 */
export function valetList() {
    const res = safeSpawn('/bin/bash -c "valet links"')

    if (res[3] == 0) {
        let output = '';
        try {
            output = new TextDecoder().decode(res[1]);
        } catch (e) {
            output = String.fromCharCode(...res[1]);
        }

        // Remove ANSI color codes
        output = output.replace(/\x1B\[[0-9;]*[mGKHJK]/g, '');

        const lines = output.split('\n').filter(item => !!item)

        return lines
            .map(line => line.trim())
            .filter(line => line.startsWith('|') && !line.startsWith('| Site') && !line.startsWith('| URL') && !line.startsWith('+'))
            .map(line => {
                const parts = line.split('|').map(item => item.trim()).slice(1, -1)

                if (parts.length === 3) {
                    // Valet Linux Plus format: | URL | SSL | Path |
                    const url = parts[0];
                    const site = url.replace(/^https?:\/\//, '').replace(/\.[^/]+$/, '');
                    return {
                        site: site,
                        ssl: !!parts[1],
                        url: url,
                        path: parts[2],
                        php: 'Default'
                    }
                }

                if (parts.length >= 5) {
                    // Valet Linux format: | Site | SSL | URL | Path | PHP |
                    return {
                        site: parts[0],
                        ssl: !!parts[1],
                        url: parts[2],
                        path: parts[3],
                        php: parts[4]
                    }
                }

                return null;
            })
            .filter(item => item !== null)
    }

    return []
}

/**
 * Retrieves and parses the output of `valet status`.
 *
 * @return {string[]}
 */
export function valetStatus() {
    const res = safeSpawn('/bin/bash -c "valet --version && valet status"')

    if (res[3] == 0) {
        let output = '';
        try {
            output = new TextDecoder().decode(res[1]);
        } catch (e) {
            output = String.fromCharCode(...res[1]);
        }

        // Remove ANSI color codes
        output = output.replace(/\x1B\[[0-9;]*[mGKHJK]/g, '');

        return output.split('\n').filter(item => !!item)
    }

    return []
}

export function valetRestart() {
    shellSpawn('valet restart')
}

export function valetStop() {
    shellSpawn('valet stop')
}

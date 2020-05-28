const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error)
        process.exit(1)
    })

function getInstallerConfig() {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'release-builds/windows')

    return Promise.resolve({
        appDirectory: path.join(outPath, 'Customer-Discovery-Pro-win32-ia32/'),
        authors: 'Conner, Keivan, Nolan',
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: 'customer-discovery.exe',
        setupExe: 'CustomerDiscoveryProInstaller.exe',
        // setupIcon: path.join(rootPath, 'assets', 'icons', 'win', 'icon.ico')
    })
}
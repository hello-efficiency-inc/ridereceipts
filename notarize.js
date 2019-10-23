const electronNotarize = require('electron-notarize')

exports.default = async function notarizing(context) {
    const {
        electronPlatformName,
        appOutDir
    } = context
    if (electronPlatformName !== 'darwin') {
        return
    }

    const appName = context.packager.appInfo.productFilename

    const notarize = await electronNotarize.notarize({
        appBundleId: 'org.helloefficiency.ridereceiptspro',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: 'meet_godhani1@yahoo.com',
        appleIdPassword: 'knmo-ggpw-hyyd-tkbm'
    })
    return notarize
}

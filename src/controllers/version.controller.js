const { request, response } = require("express");

const versionGet = async (req = request, res = response) => {
    const { version, store } = req.body;
    let url_playstore = 'https://play.google.com/store/apps/details?id=com.muserpol.pvt';
    let url_appstore = 'https://apps.apple.com/app/id284815942';
    let url_appgallery = 'https://appgallery.huawei.com/app/C106440831';
    try {
        switch (store) {
            case 'playstore':
                if (version == '0.0.1' || version == '1.0.0') {
                    return res.json({
                        error: false,
                        msg: `Version correcta`,
                        store: url_playstore,
                    });
                } else {
                    return res.json({
                        error: true,
                        msg: `Actualiza la nueva versión`,
                        store: url_playstore,
                    });
                }
            case 'appstore':
                if (version == '0.0.1') {
                    return res.json({
                        error: false,
                        msg: `Version correcta`,
                        store: url_appstore,
                    });
                } else {
                    return res.json({
                        error: true,
                        msg: `Actualiza la nueva versión`,
                        store: url_appstore,
                    });
                }
            case 'appgallery':
                if (version == '0.0.1') {
                    return res.json({
                        error: false,
                        msg: `Version correcta`,
                        store: url_appgallery,
                    });
                } else {
                    return res.json({
                        error: true,
                        msg: `Actualiza la nueva versión`,
                        store: url_appgallery,
                    });
                }
            default:
                return res.status(500).json({
                    errors: [
                        {
                            msg: "Hable con el administrador",
                        }
                    ]

                });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            errors: [
                {
                    msg: "Hable con el administrador",
                }
            ]

        });
    }
};

module.exports = {
    versionGet
};
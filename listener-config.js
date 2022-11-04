// configuration
export const listenerConfig = {
    listeners: 
        [
            { 
                contentType: "street",
                fields: [
                    { 
                        sourceName: "germanName",
                        targetName: "germanName",
                        plugin: "default"
                    },
                    { 
                        sourceName: "polishNames",
                        targetName: "polishNames",
                        plugin: "default"
                    },
                    { 
                        sourceName: "images",
                        targetName: "images",
                        plugin: "aggregateReferences",
                        pluginProperties: {
                            "embedFields": [ "url" ]
                        }
                    }
                ],
                target: {
                    plugin: "algolia",
                    pluginProperties: {
                        "index": "preview_danzig"
                    }
                }
            }
        ]    
}

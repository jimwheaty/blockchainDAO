'use strict';

// AssetExists returns true when asset with given ID exists in world state.
module.exports.AssetExists = async(ctx, UID) => {
    const assetJSON = await ctx.stub.getState(UID);
    return assetJSON && assetJSON.length > 0;
}

// ReadAsset returns the asset stored in the world state with given id.
module.exports.ReadAsset = async(ctx, UID) => {
    const assetBuffer = await ctx.stub.getState(UID); // get the asset from chaincode state
    if (!assetBuffer || assetBuffer.length === 0) {
        throw new Error(`The asset ${UID} does not exist`);
    }
    return assetBuffer.toString()
}

// UpdateAsset updates an existing asset in the world state with provided parameters.
module.exports.UpdateAsset = async(ctx, UID, assetString) => {
    await ctx.stub.putState(UID, Buffer.from(assetString));
}

// GetAllAssets returns all assets found in the world state.
module.exports.GetAssetDataByRange = async(ctx, startUID, endUID) => {
    const allResults = {};
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange(startUID, endUID);
    let result = await iterator.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let asset;
        try {
            asset = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            asset = strValue;
        }
        allResults[asset.timestamp] = asset;
        result = await iterator.next();
    }
    return JSON.stringify(allResults);
}

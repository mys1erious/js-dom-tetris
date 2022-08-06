export const getCellIdAsTuple = (strId) => {
    let [rowInd, colInd] = strId.split('_');
    return [parseInt(rowInd), parseInt(colInd)];
};

export const getCellIdAsStr = (rowInd, colInd) => {
    return `${rowInd.toString()}_${colInd.toString()}`;
};

export const sleep = async(ms) => {
    await new Promise(r => setTimeout(r, ms));
};

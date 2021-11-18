

class CWorldBomb
{
    constructor(nNpc)
    {
        this.nNpc = nNpc;
        this.nOnlyID = 0;
        this.nChallenge = 0;
        this.vecApply = [];
    }

    Reset()
    {
        this.nChallenge = 0;
        this.vecApply = [];
    }
}

class CPos
{
    constructor(nMap, nX, nY)
    {
        this.map = nMap;
        this.x = nX;
        this.y = nY;
    }
}

module.exports.CWorldBomb = CWorldBomb;
module.exports.CPos = CPos;



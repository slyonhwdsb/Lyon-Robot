/**
 * Robot blocks
 */
//% weight=100 color=#6495ED icon="\uf0e7"
//% groups=['Setup', 'Movement', 'Obstacle', 'Beacon', 'White Lines', 'Black Lines']
namespace robot {
    const BLOCK_WHITE_PAINT = WHITE_CONCRETE    // block to use for white paint
    const BLOCK_BLACK_PAINT = BLACK_CONCRETE    // block to use for black paint
    const BLOCK_BEACON = BEACON                 // block to use for beacon
    const SLOT_WHITE_PAINT = 25                 // reserved slot for white paint
    const SLOT_BLACK_PAINT = 26                 // reserved slot for black paint
    const SLOT_BEACON = 27                      // reserved slot for beacons
    const SLOT_TEMP = 2                         // slot to store collected ground tiles
    const POOP_X = 6000                         // location to dump collected items
    const POOP_Y = 0
    const POOP_Z = 6000                         
    let paintWhite: boolean = false
    let paintBlack: boolean = false

    /**
    * Teleport your agent to the starting position and clears inventory
    * @param pos the starting world coordinates
    * @param dir the compass direction to face
    */
    //% block="Start at $pos facing $dir"
    //% pos.shadow=minecraftCreateWorldPosition
    //% dir.shadow=minecraftCompassDirection
    //% group="Setup"
    export function start(pos: Position, dir: CompassDirection) {
        poop(false, false)
        agent.teleport(pos, dir)
    }

    //% block
    //% group="Movement"
    export function forward() {
        if(paintWhite || paintBlack) {
            if(paintWhite) {
                agent.setSlot(SLOT_WHITE_PAINT)
            } else {
                agent.setSlot(SLOT_BLACK_PAINT)
            }
            agent.destroy(SixDirection.Down)
            agent.collectAll()
            agent.place(SixDirection.Down)
        }
        agent.move(FORWARD, 1)
    }
    //% block="Turn Left"
    //% group="Movement"
    export function turnLeft() {
        agent.turn(TurnDirection.Left)
    }
    //% block="Turn Right"
    //% group="Movement"
    export function turnRight() {
        agent.turn(TurnDirection.Right)
    }

    /**
     * Checks if the given direction has an obstacle next to you
     * @param dir the direction to check
     */
    //% block="$dir is obstacle"
    //% dir.shadow=minecraftFourDirection
    //% group="Obstacle"
    export function isObstacle(dir: FourDirection) {
        return agent.detect(AgentDetection.Block, dir)
    }
 
    //% block
    //% group="Beacon"
    export function frontIsBeacon() {
        return isBlock("front", BLOCK_BEACON, 0)
    }
    //% block
    //% group="Beacon"
    export function leftIsBeacon() {
        return isBlock("left", BLOCK_BEACON, 0)
    }
    //% block
    //% group="Beacon"
    export function rightIsBeacon() {
        return isBlock("right", BLOCK_BEACON, 0)
    }
    //% block="Pick up Beacon"
    //% group="Beacon"
    export function pickupBeacon() {
        // poop first to clear inventory so we can be sure the beacon will go in slot 1
        poop(true, true)
        agent.destroy(FORWARD)
        agent.collect(BLOCK_BEACON)
        agent.transfer(1, 1, SLOT_BEACON)
    }
    //% block="Put down Beacon"
    //% group="Beacon"
    export function putDownBeacon() {
        agent.setSlot(SLOT_BEACON)
        agent.place(FORWARD)
    }

    //% block
    //% group="White Lines"
    export function frontIsWhite() {
        return isBlock("front", BLOCK_WHITE_PAINT, -1)
    }
    //% block
    //% group="White Lines"
    export function leftIsWhite() {
        return isBlock("left", BLOCK_WHITE_PAINT, -1)
    }
    //% block
    //% group="White Lines"
    export function rightIsWhite() {
        return isBlock("right", BLOCK_WHITE_PAINT, -1)
    }
    //% block="Start painting white"
    //% group="White Lines"
    export function startPaintingWhite() {
        paintBlack = false
        paintWhite = true
    }
    //% block="Stop painting white"
    //% group="White Lines"
    export function stopPaintingWhite() {
        paintWhite = false
    }

    //% block
    //% group="Black Lines"
    export function frontIsBlack() {
        return isBlock("front", BLOCK_BLACK_PAINT, -1)
    }
    //% block
    //% group="Black Lines"
    export function leftIsBlack() {
        return isBlock("left", BLOCK_BLACK_PAINT, -1)
    }
    //% block
    //% group="Black Lines"
    export function rightIsBlack() {
        return isBlock("right", BLOCK_BLACK_PAINT, -1)
    }
    //% block="Start painting black"
    //% group="Black Lines"
    export function startPaintingBlack() {
        paintWhite = false
        paintBlack = true
    }
    //% block="Stop painting black"
    //% group="Black Lines"
    export function stopPaintingBlack() {
        paintBlack = false
    }

    // dump all unnecessary stuff in a given spot
    function poop(returnHere:boolean, keepBeacons:boolean) {
        let currPos: Position
        let currDir: number = agent.getOrientation()
        let numBeacons: number = 0
        
        if(keepBeacons) {
            numBeacons = agent.getItemCount(SLOT_BEACON)
        }
        
        player.say(numBeacons)

        if(returnHere) {
            currPos = agent.getPosition()
        }

        agent.teleport(world(POOP_X, POOP_Y, POOP_Z), positions.toCompassDirection(currDir))
        agent.dropAll(positions.toCompassDirection(currDir))
        
        // refill paint
        agent.setItem(BLOCK_WHITE_PAINT, 64, SLOT_WHITE_PAINT)
        agent.setItem(BLOCK_BLACK_PAINT, 64, SLOT_BLACK_PAINT)
        // put back any beacons
        if(numBeacons > 0) {
            agent.setItem(BLOCK_BEACON, numBeacons, SLOT_BEACON)
        }

        if (returnHere) {
            agent.teleport(currPos, positions.toCompassDirection(currDir))
        }
    }

    // check if the block with a given height offset in the given direction is the given block
    function isBlock(direction: string, block: number, zoffset: number) {
        let EW = 0
        let NS = 0
        let dir: Position = null

        if (direction == "front") {
            EW = 0
            NS = 1
        } else if (direction == "left") {
            EW = 1
            NS = 0
        } else if (direction == "right") {
            EW = -1
            NS = 0
        } else {
            return false
        }
        if (agent.getOrientation() == 0) {
            dir = pos(EW, zoffset, NS)
        } else if (agent.getOrientation() == -180) {
            dir = pos(-1 * EW, zoffset, -1 * NS)
        } else if (agent.getOrientation() == 90) {
            dir = pos(-1 * NS, zoffset, EW)
        } else {
            dir = pos(NS, zoffset, -1 * EW)
        }
        if (blocks.testForBlock(block, positions.add(agent.getPosition(),dir))) {
            return true
        }
        return false
    }
}

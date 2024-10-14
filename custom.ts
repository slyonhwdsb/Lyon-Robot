/**
 * Robot blocks
 */
//% weight=100 color=#6495ED icon="\uf0e7"
//% groups=['Setup', 'Movement', 'Obstacle', 'Beacon', 'White Lines', 'Black Lines']
namespace robot {
    let EW = 0
    let NS = 0
    let dir: Position = null

    /**
    * Teleport your agent to the starting position
    * @param x starting x world position
    * @param y starting y world position
    * @param z starting z world position
    * @param dir the compass direction to face
    */
    //% block="Start at $pos facing $dir"
    //% pos.shadow=minecraftCreateWorldPosition
    //% dir.shadow=minecraftCompassDirection
    //% group="Setup"
    export function start(pos: Position, dir: CompassDirection) {
        agent.teleport(world(6000, 0, 6000), dir)
        agent.dropAll(dir)
        agent.teleport(pos, dir)
    }

    //% block
    //% group="Movement"
    export function forward() {
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
    //% block="Is $dir obstacle"
    //% dir.shadow=minecraftCompassDirection
    //% group="Obstacle"
    export function isObstacle(dir: CompassDirection) {
        return true
        //agent.detect(AgentDetection.Block, dir)
    }
 
    //% block
    //% group="Beacon"
    export function frontIsBeacon() {
        return isBlock("front", BEACON, 0)
    }
    //% block
    //% group="Beacon"
    export function leftIsBeacon() {
        return isBlock("left", BEACON, 0)
    }
    //% block
    //% group="Beacon"
    export function rightIsBeacon() {
        return isBlock("right", BEACON, 0)
    }
    //% block="Pick up Beacon"
    //% group="Beacon"
    export function pickupBeacon() {
        agent.destroy(FORWARD)
        agent.collect(BEACON)
    }
    //% block="Put down Beacon"
    //% group="Beacon"
    export function putDownBeacon() {
        agent.setSlot(1)
        agent.place(FORWARD)
    }

    //% block
    //% group="White Lines"
    export function frontIsWhite() {
        return isBlock("front", WHITE_CONCRETE, -1)
    }
    //% block
    //% group="White Lines"
    export function leftIsWhite() {
        return isBlock("left", WHITE_CONCRETE, -1)
    }
    //% block
    //% group="White Lines"
    export function rightIsWhite() {
        return isBlock("right", WHITE_CONCRETE, -1)
    }

    //% block
    //% group="Black Lines"
    export function frontIsBlack() {
        return isBlock("front", BLACK_CONCRETE, -1)
    }
    //% block
    //% group="Black Lines"
    export function leftIsBlack() {
        return isBlock("left", BLACK_CONCRETE, -1)
    }
    //% block
    //% group="Black Lines"
    export function rightIsBlack() {
        return isBlock("right", BLACK_CONCRETE, -1)
    }

    function isBlock(direction: string, block: number, zoffset: number) {
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
        if (blocks.testForBlock(block, positions.add(
            agent.getPosition(),
            dir
        ))) {
            return true
        }
        return false
    }
}

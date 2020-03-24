import cloneDeep from 'lodash.clonedeep'
import sortBy from 'lodash.sortby'

type Position = [number, number]
type GridItem = {
  id: string
  type: number
  pos: Position
}

class Grid {
  types = [0, 1, 2, 3, 4]

  _grid: GridItem[] = []
  _width: number = 0
  _height: number = 0

  MAX_DISTANCE = 1
  MATCH_LENGTH = 3

  constructor(width: number, height: number) {
    this._width = width
    this._height = height
    this._grid = Array(width * height)
      .fill(null)
      .map((v, index) => {
        const indexX = index % width
        const indexY = Math.floor(index / width)
        return this._createItem(indexX, indexY)
      })
  }

  _createItem(x: number, y: number): GridItem {
    const type = Math.floor(Math.random() * this.types.length)
    const uuid = Math.floor(Math.random() * 1000000).toString()
    return {
      id: `${x}${y}${type}${uuid}`,
      type,
      pos: [x, y]
    }
  }

  get ArrayGrid(): GridItem[][] {
    return this.arrayGridFrom()
  }

  private arrayGridFrom = (grid?: GridItem[]) => {
    grid = grid || this._grid
    const arrayGrid = new Array(this._height).fill(null).map((_, indexY) =>
      new Array(this._width).fill(null).map((__, indexX) => {
        const item = grid.find(item => item.pos[0] === indexX && item.pos[1] === indexY)
        return item
      })
    )

    return arrayGrid
  }

  getItemAt([x, y]: Position) {
    return this._grid.find(item => item.pos[0] === x && item.pos[1] === y) || null
  }

  swapPositions(item1: GridItem, item2: GridItem) {
    const grid = cloneDeep(this._grid)
    const [x1, y1] = item1.pos
    const [x2, y2] = item2.pos

    if (Math.abs(x2 - x1) > this.MAX_DISTANCE || Math.abs(y2 - y1) > this.MAX_DISTANCE) {
      console.warn('too far away!')
      return
    }
    if (x1 === x2 && y1 === y2) {
      console.warn('The same component!')
      return
    }

    const index1 = grid.findIndex(item => item.id === item1.id)
    const index2 = grid.findIndex(item => item.id === item2.id)
    grid[index1].pos = [x2, y2]
    grid[index2].pos = [x1, y1]
    console.log("swapped ", [x2, y2], "with", [x1, y1])
    this._grid = grid
    return grid
  }

  findAllMatches(): Array<GridItem[]> {
    const marked: Array<String> = []
    const matches = this._grid.reduce((prev: Array<GridItem[]>, gridItem) => {
      // if this is already part of another match, skip
      if (marked.includes(gridItem.id)) return prev

      // expensive, check for match
      const match = this.findMatchForField(gridItem.pos)
      if (match) {
        const matchIds = match.map(m => m.id)
        marked.push(...matchIds)
        prev.push(match)
      } else {
        marked.push(gridItem.id)
      }
      return prev
    }, [])

    return matches
  }

  findMatchForField([x, y]: Position): GridItem[] {
    const grid = this.ArrayGrid
    const item = grid[y][x]
    const { type } = item

    let match: GridItem[] = []

    const checkNext = (incr: boolean, axis: 'x' | 'y') => {
      const recurseCheck = ([x, y]: Position) => {
        let item: GridItem
        try {
          item = grid[y][x]
        } catch (e) {
          // console.log(e, x, y)
          return
        }

        if (item && type === item.type) {
          if (!match.find(m => m.id === item.id)) {
            match.push(cloneDeep(item))
          }
          const newX = axis === 'x' ? (incr ? x + 1 : x - 1) : x
          const newY = axis === 'y' ? (incr ? y + 1 : y - 1) : y
          recurseCheck([newX, newY])
        }
        return
      }
      return recurseCheck
    }

    checkNext(true, 'x')([x, y])
    checkNext(false, 'x')([x, y])
    if (match.length <= 1) {
      checkNext(true, 'y')([x, y])
      checkNext(false, 'y')([x, y])
    }

    // Only match if it contains more than MATCH_LENGTH gems
    if (match.length > 0 && match.length >= this.MATCH_LENGTH) {
      // return match in normalized structure
      return sortBy(match, [match => match.pos[0], match => match.pos[1]])
    }
    return null
  }

  removeMatch(match: GridItem[]) {
    let grid = cloneDeep(this._grid)
    const ids = match.map(m => m.id)
    grid = grid.filter(item => !ids.includes(item.id))
    return grid
  }

  // Basically bubble sort, any ideas?
  moveDown(): GridItem[] {
    let grid = cloneDeep(this._grid)
    const cycle = () => {
      const arrayGrid = this.arrayGridFrom(grid)
      let clean = true
      arrayGrid.forEach((row, indexY) => {
        row.forEach((item, indexX) => {
          if (!item) {
            const oneUp = (arrayGrid[indexY + 1] && arrayGrid[indexY + 1][indexX]) || null
            if (oneUp) {
              const itemIndex = grid.findIndex(item => item.id === oneUp.id)
              grid[itemIndex].pos = [indexX, indexY]
              clean = false
            }
          }
        })
      })
      return clean
    }
    let i = 0
    while (cycle() === false) {
      i++
    }
    console.log('sorting took ', i, ' cycles')
    this._grid = grid
    return grid
  }

  /** Iterate over top row, figure out how much to add per column  */
  fill(): GridItem[] {
    let grid = cloneDeep(this._grid)
    const arrayGrid = this.arrayGridFrom(grid)

    const indexY = arrayGrid.length - 1
    arrayGrid[indexY].forEach((item, indexX) => {
      for (let y = indexY; typeof arrayGrid[y][indexX] === 'undefined'; y--) {
        const item = this._createItem(indexX, y)
        grid.push(item)
      }
    })
    this._grid = grid
    return grid
  }
}

export default Grid

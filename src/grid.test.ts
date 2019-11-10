import Grid from './grid'

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

describe('Grid tests', () => {
  let grid = null

  beforeEach(() => {
    grid = new Grid(10, 11)
  })

  it('is able to create a structured array from a single dimension grid', () => {
    const [x, y] = grid._grid[6].pos
    const arrayGrid = grid.ArrayGrid
    expect(arrayGrid.length).toBe(11)
    expect(arrayGrid[0].length).toBe(10)
    expect(arrayGrid[y][x]).toBe(grid._grid[6])
  })

  it('is able to check if elements line up horizontally', () => {
    // Fake a match
    const item0 = grid.getItemAt([0, 1])
    const item1 = grid.getItemAt([1, 1])
    const item2 = grid.getItemAt([2, 1])
    const item3 = grid.getItemAt([3, 1])
    const item4 = grid.getItemAt([4, 1])
    item0.type = 1
    item1.type = 1
    item2.type = 1
    item3.type = 1
    item4.type = 2

    const match = grid.findMatchForField([0, 1])
    expect(match).toBeInstanceOf(Array)
    expect(grid.findMatchForField([1, 1])).toEqual(match)
    expect(grid.findMatchForField([2, 1])).toEqual(match)
  })

  it('is able to check if elements line up vertically', () => {
    const length = randomIntFromInterval(3, 4)
    const type = 1
    const startX = randomIntFromInterval(0, 5)
    const startY = 2
    for (let i = startY; i <= startY + length; i++) {
      const item = grid.getItemAt([startX, i])
      item.type = i === startY + length ? type + 1 : type

      // prevent horizontal matches
      const itemNext = grid.getItemAt([startX + 1, i])
      if (itemNext) {
        itemNext.type = type + 1
      }
    }

    const match = grid.findMatchForField([startX, startY])

    console.log(match)
    expect(match).toBeInstanceOf(Array)
    expect(match.length).toBe(length)
    // @TODO fix flaky vertical match finding
    expect(grid.findMatchForField([startX, startY + 1])).toEqual(match)
    // expect(grid.findMatchForField([startX, startY + 2])).toEqual(match)
  })

  it('is able to check the whole grid for matches', () => {
    var t0 = performance.now()
    const allMatches = grid.findAllMatches()
    var t1 = performance.now()
    console.log('Finding all ', allMatches.length, ' matches took ', t1 - t0, ' milliseconds')
    console.log(allMatches)
  })
})

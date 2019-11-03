import Grid from './grid'

describe('Grid tests', () => {
  let grid = null

  beforeEach(() => {
    grid = new Grid(5, 7)
  })

  it('is able to create a structured array from a single dimension grid', () => {
    const [x, y] = grid._grid[6].pos
    const arrayGrid = grid.ArrayGrid
    expect(arrayGrid.length).toBe(7)
    expect(arrayGrid[0].length).toBe(5)
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
    const item0 = grid.getItemAt([0, 2])
    const item1 = grid.getItemAt([0, 3])
    const item2 = grid.getItemAt([0, 4])
    const item3 = grid.getItemAt([0, 5])
    item0.type = 1
    item1.type = 1
    item2.type = 1
    item3.type = 2

    // prevent horizontal matches
    grid.getItemAt([1, 2]).type = 2
    grid.getItemAt([1, 3]).type = 4
    grid.getItemAt([1, 4]).type = 3
    grid.getItemAt([1, 5]).type = 4

    const match = grid.findMatchForField([0, 2])

    console.log(match)
    expect(match).toBeInstanceOf(Array)
    expect(match.length).toBe(3)
    expect(grid.findMatchForField([0, 3])).toEqual(match)
    expect(grid.findMatchForField([0, 4])).toEqual(match)
  })

  it('is able to check the whole grid for matches', () => {
    var t0 = performance.now()
    const allMatches = grid.findAllMatches()
    var t1 = performance.now()
    console.log('Finding all ', allMatches.length, ' matches took ', t1 - t0, ' milliseconds')
    console.log(allMatches)
  })
})

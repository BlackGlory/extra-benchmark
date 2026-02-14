import { describe, test, expect, vi as vi } from 'vitest'
import { Benchmark } from '@src/benchmark.js'
import { toArrayAsync, toArray, takeRight } from 'iterable-operator'

describe('Benchmark', () => {
  describe('run', () => {
    test('iterate(): void', async () => {
      const bench = new Benchmark('benchmark')
      const iterate = vi.fn()
      const fn = vi.fn(() => iterate)
      bench.addCase('case', fn)

      const result = await toArrayAsync(bench.run())

      expect(fn).toBeCalledTimes(1)
      expect(iterate).toBeCalledTimes(100 + 100)
      expect(result).toStrictEqual([
        {
          name: 'case'
        , warms: 100
        , runs: 100
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })

    test('iterate(): afterEach', async () => {
      const bench = new Benchmark('benchmark')
      const orderOfCalls: string[] = []
      const iterate = vi.fn(() => {
        orderOfCalls.push('iterate')
        return afterEach
      })
      const afterEach = vi.fn(() => {
        orderOfCalls.push('afterEach')
      })
      const fn = vi.fn(() => iterate)
      bench.addCase('case', fn)

      const result = await toArrayAsync(bench.run())

      expect(fn).toBeCalledTimes(1)
      expect(iterate).toBeCalledTimes(100 + 100)
      expect(afterEach).toBeCalledTimes(100 + 100)
      expect(toArray(takeRight(orderOfCalls, 2))).toStrictEqual([
        'iterate', 'afterEach'
      ])
      expect(result).toStrictEqual([
        {
          name: 'case'
        , warms: 100
        , runs: 100
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })

    test('iterate(): afterEach, beforeEach, afterAll', async () => {
      const bench = new Benchmark('benchmark')
      const orderOfCalls: string[] = []
      const iterate = vi.fn(() => {
        orderOfCalls.push('iterate')
        return afterEach
      })
      const beforeEach = vi.fn(() => {
        orderOfCalls.push('beforeEach')
      })
      const afterEach = vi.fn(() => {
        orderOfCalls.push('afterEach')
      })
      const afterAll = vi.fn(() => {
        orderOfCalls.push('afterAll')
      })
      const fn = vi.fn(() => ({
        iterate
      , beforeEach
      , afterAll
      }))
      bench.addCase('case', fn)

      const result = await toArrayAsync(bench.run())

      expect(fn).toBeCalledTimes(1)
      expect(iterate).toBeCalledTimes(100 + 100)
      expect(beforeEach).toBeCalledTimes(100 + 100)
      expect(afterEach).toBeCalledTimes(100 + 100)
      expect(afterAll).toBeCalledTimes(1)
      expect(toArray(takeRight(orderOfCalls, 4))).toStrictEqual([
        'beforeEach', 'iterate', 'afterEach', 'afterAll'
      ])
      expect(result).toStrictEqual([
        {
          name: 'case'
        , warms: 100
        , runs: 100
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })
  })

  describe('options', () => {
    test('default options', async () => {
      const bench = new Benchmark('benchmark')
      const iterate1 = vi.fn()
      const iterate2 = vi.fn()
      const fn1 = vi.fn(() => iterate1)
      const fn2 = vi.fn(() => iterate2)
      bench.addCase('case-1', fn1)
      bench.addCase('case-2', fn2)

      const result = await toArrayAsync(bench.run())

      expect(fn1).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)
      expect(iterate1).toBeCalledTimes(100 + 100)
      expect(iterate2).toBeCalledTimes(100 + 100)
      expect(result).toStrictEqual([
        {
          name: 'case-1'
        , warms: 100
        , runs: 100
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      , {
          name: 'case-2'
        , warms: 100
        , runs: 100
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })

    test('custom options', async () => {
      const bench = new Benchmark('benchmark', {
        warms: 500
      , runs: 1000
      })
      const iterate1 = vi.fn()
      const iterate2 = vi.fn()
      const fn1 = vi.fn(() => iterate1)
      const fn2 = vi.fn(() => iterate2)
      bench.addCase('case-1', fn1)
      bench.addCase('case-2', fn2)

      const result = await toArrayAsync(bench.run())

      expect(fn1).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)
      expect(iterate1).toBeCalledTimes(500 + 1000)
      expect(iterate2).toBeCalledTimes(500 + 1000)
      expect(result).toStrictEqual([
        {
          name: 'case-1'
        , warms: 500
        , runs: 1000
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      , {
          name: 'case-2'
        , warms: 500
        , runs: 1000
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })

    test('custom case options', async () => {
      const bench = new Benchmark('benchmark', {
        warms: 500
      , runs: 1000
      })
      const iterate1 = vi.fn()
      const iterate2 = vi.fn()
      const fn1 = vi.fn(() => iterate1)
      const fn2 = vi.fn(() => iterate2)
      bench.addCase('case-1', fn1)
      bench.addCase('case-2', fn2, {
        warms: 1000
      , runs: 2000
      })

      const result = await toArrayAsync(bench.run())

      expect(fn1).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)
      expect(iterate1).toBeCalledTimes(500 + 1000)
      expect(iterate2).toBeCalledTimes(1000 + 2000)
      expect(result).toStrictEqual([
        {
          name: 'case-1'
        , warms: 500
        , runs: 1000
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      , {
          name: 'case-2'
        , warms: 1000
        , runs: 2000
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(Number)
        , minimumElapsedTime: expect.any(Number)
        , averageElapsedTime: expect.any(Number)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })
  })
})

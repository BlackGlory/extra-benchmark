import { Benchmark } from '@src/benchmark'
import { toArrayAsync } from 'iterable-operator'

describe('Benchmark', () => {
  test('run', async () => {
    const bench = new Benchmark('benchmark')
    const iterate = jest.fn()
    const fn = jest.fn(() => iterate)
    bench.addCase('case', fn)

    const result = await toArrayAsync(bench.run())

    expect(fn).toBeCalledTimes(1)
    expect(iterate).toBeCalledTimes(100 + 100)
    expect(result).toStrictEqual([
      {
        name: 'case'
      , warmUps: 100
      , runs: 100
      , operationsPerSecond: expect.any(Number)
      , operationsPerMillisecond: expect.any(Number)
      , operationsPerNanosecond: expect.any(Number)
      , maxiumElapsedTime: expect.any(BigInt)
      , minimumElapsedTime: expect.any(BigInt)
      , averageElapsedTime: expect.any(BigInt)
      , maximumMemoryIncrements: expect.any(Number)
      , minimumMemoryIncrements: expect.any(Number)
      , averageMemoryIncrements: expect.any(Number)
      }
    ])
  })

  describe('options', () => {
    test('default options', async () => {
      const bench = new Benchmark('benchmark')
      const iterate1 = jest.fn()
      const iterate2 = jest.fn()
      const fn1 = jest.fn(() => iterate1)
      const fn2 = jest.fn(() => iterate2)
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
        , warmUps: 100
        , runs: 100
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , operationsPerNanosecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(BigInt)
        , minimumElapsedTime: expect.any(BigInt)
        , averageElapsedTime: expect.any(BigInt)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      , {
          name: 'case-2'
        , warmUps: 100
        , runs: 100
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , operationsPerNanosecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(BigInt)
        , minimumElapsedTime: expect.any(BigInt)
        , averageElapsedTime: expect.any(BigInt)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })

    test('custom options', async () => {
      const bench = new Benchmark('benchmark', {
        warmUps: 500
      , runs: 1000
      })
      const iterate1 = jest.fn()
      const iterate2 = jest.fn()
      const fn1 = jest.fn(() => iterate1)
      const fn2 = jest.fn(() => iterate2)
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
        , warmUps: 500
        , runs: 1000
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , operationsPerNanosecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(BigInt)
        , minimumElapsedTime: expect.any(BigInt)
        , averageElapsedTime: expect.any(BigInt)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      , {
          name: 'case-2'
        , warmUps: 500
        , runs: 1000
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , operationsPerNanosecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(BigInt)
        , minimumElapsedTime: expect.any(BigInt)
        , averageElapsedTime: expect.any(BigInt)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })

    test('custom case options', async () => {
      const bench = new Benchmark('benchmark', {
        warmUps: 500
      , runs: 1000
      })
      const iterate1 = jest.fn()
      const iterate2 = jest.fn()
      const fn1 = jest.fn(() => iterate1)
      const fn2 = jest.fn(() => iterate2)
      bench.addCase('case-1', fn1)
      bench.addCase('case-2', fn2, {
        warmUps: 1000
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
        , warmUps: 500
        , runs: 1000
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , operationsPerNanosecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(BigInt)
        , minimumElapsedTime: expect.any(BigInt)
        , averageElapsedTime: expect.any(BigInt)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      , {
          name: 'case-2'
        , warmUps: 1000
        , runs: 2000
        , operationsPerSecond: expect.any(Number)
        , operationsPerMillisecond: expect.any(Number)
        , operationsPerNanosecond: expect.any(Number)
        , maxiumElapsedTime: expect.any(BigInt)
        , minimumElapsedTime: expect.any(BigInt)
        , averageElapsedTime: expect.any(BigInt)
        , maximumMemoryIncrements: expect.any(Number)
        , minimumMemoryIncrements: expect.any(Number)
        , averageMemoryIncrements: expect.any(Number)
        }
      ])
    })
  })
})

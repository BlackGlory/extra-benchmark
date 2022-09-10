import { go, Awaitable } from '@blackglory/prelude'

export interface IBenchmarkOptions {
  /* The number of times to warm up the benchmark test */
  warmUps?: number

  /* The number of times to run the benchmark test */
  runs?: number
}

export interface IBenchmarkCaseResult {
  name: string
  warmUps: number
  runs: number

  operationsPerSecond: number
  operationsPerMillisecond: number
  operationsPerNanosecond: number

  /* Nanoseconds */
  maxiumElapsedTime: bigint
  minimumElapsedTime: bigint
  averageElapsedTime: bigint

  /* Bytes */
  maximumMemoryIncrements: number
  minimumMemoryIncrements: number
  averageMemoryIncrements: number
}

interface IBenchmarkCase {
  name: string
  fn: () => Awaitable<() => Awaitable<void>>
  options: IBenchmarkOptions
}

interface ISample {
  // Nanoseconds
  elapsedTime: bigint
  memoryIncrements: number
}

export class Benchmark {
  private benchmarkCases: IBenchmarkCase[] = []
  private warmUps: number
  private runs: number

  constructor(public readonly name: string, options: IBenchmarkOptions = {}) {
    this.warmUps = options.warmUps ?? 100
    this.runs = options.runs ?? 100
  }

  addCase(
    name: string
  , fn: () => Awaitable<() => Awaitable<void>>
  , options: IBenchmarkOptions = {}
  ): void {
    this.benchmarkCases.push({ name, fn, options })
  }

  async * run(): AsyncIterable<IBenchmarkCaseResult> {
    for (const benchmarkCase of this.benchmarkCases) {
      const { fn, name, options } = benchmarkCase
      const iterate = await fn()
      const warmUps = options.warmUps ?? this.warmUps
      const runs = options.runs ?? this.runs

      // warm-up
      await sample(iterate, warmUps)

      // run
      const samples: ISample[] = await sample(iterate, runs)

      const elapsedTimes = samples.map(x => x.elapsedTime)
      const maxiumElapsedTime = elapsedTimes.reduce((max, cur) => cur > max ? cur : max)
      const minimumElapsedTime = elapsedTimes.reduce((min, cur) => cur > min ? min : cur)
      const totalElapsedTime = elapsedTimes.reduce((acc, cur) => acc + cur)
      const averageElapsedTime = totalElapsedTime / BigInt(runs)

      const {
        operationsPerNanosecond
      , operationsPerMillisecond
      , operationsPerSecond
      } = go(() => {
        if (totalElapsedTime <= Number.MAX_SAFE_INTEGER) {
          const operationsPerNanosecond = runs / Number(totalElapsedTime)
          const operationsPerMillisecond = runs / (Number(totalElapsedTime) / 1000000)
          const operationsPerSecond = runs / (Number(totalElapsedTime) / 1000000 / 1000)
          return { operationsPerSecond, operationsPerMillisecond, operationsPerNanosecond }
        } else {
          const operationsPerNanosecond = Number(BigInt(runs) / totalElapsedTime)
          const operationsPerMillisecond = runs / Number(totalElapsedTime / 1000000n)
          const operationsPerSecond = runs / (Number(totalElapsedTime / 1000000n) / 1000)
          return { operationsPerSecond, operationsPerMillisecond, operationsPerNanosecond }
        }
      })

      const memoryIncrments = samples.map(x => x.memoryIncrements)
      const maximumMemoryIncrements = memoryIncrments.reduce((max, cur) => {
        return cur > max ? cur : max
      })
      const minimumMemoryIncrements = memoryIncrments.reduce((min, cur) => {
        return cur > min ? min : cur
      })
      const averageMemoryIncrements = memoryIncrments.reduce((average, cur) => {
        return (average + cur) / 2
      })

      yield {
        name
      , warmUps
      , runs
      , operationsPerSecond
      , operationsPerMillisecond
      , operationsPerNanosecond
      , maxiumElapsedTime
      , minimumElapsedTime
      , averageElapsedTime
      , maximumMemoryIncrements
      , averageMemoryIncrements
      , minimumMemoryIncrements
      }

    }
  }
}

async function sample(iterate: () => Awaitable<void>, times: number): Promise<ISample[]> {
  const samples: ISample[] = []
  for (let i = times; i--;) {
    const startRSS = process.memoryUsage().rss
    const startTime = process.hrtime.bigint()
    await iterate()
    const endTime = process.hrtime.bigint()
    const elapsedTime = endTime - startTime
    const endRSS = process.memoryUsage().rss
    const memoryIncrements = endRSS - startRSS
    samples.push({
      elapsedTime
    , memoryIncrements
    })
  }
  return samples
}

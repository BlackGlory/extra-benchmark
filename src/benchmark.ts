import { Awaitable } from '@blackglory/prelude'

export interface IBenchmarkOptions {
  /* The number of times to warm up the benchmark test */
  warms?: number

  /* The number of times to run the benchmark test */
  runs?: number
}

export interface IBenchmarkCaseResult {
  name: string
  warms: number
  runs: number

  operationsPerSecond: number
  operationsPerMillisecond: number

  /* Milliseconds */
  maxiumElapsedTime: number
  minimumElapsedTime: number
  averageElapsedTime: number

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
  // Milliseconds
  elapsedTime: number
  memoryIncrements: number
}

export class Benchmark {
  private benchmarkCases: IBenchmarkCase[] = []
  private warms: number
  private runs: number

  constructor(public readonly name: string, options: IBenchmarkOptions = {}) {
    this.warms = options.warms ?? 100
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
      const warms = options.warms ?? this.warms
      const runs = options.runs ?? this.runs

      // warm-up
      await sample(iterate, warms)

      // run
      const samples: ISample[] = await sample(iterate, runs)

      const elapsedTimes = samples.map(x => x.elapsedTime)
      const maxiumElapsedTime = elapsedTimes.reduce((max, cur) => {
        return cur > max ? cur : max
      })
      const minimumElapsedTime = elapsedTimes.reduce((min, cur) => {
        return cur > min ? min : cur
      })
      const totalElapsedTime = elapsedTimes.reduce((acc, cur) => {
        return acc + cur
      })
      const averageElapsedTime = totalElapsedTime / runs

      const operationsPerMillisecond = runs / totalElapsedTime
      const operationsPerSecond = runs / (totalElapsedTime / 1000)

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
      , warms
      , runs
      , operationsPerSecond
      , operationsPerMillisecond
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

async function sample(
  iterate: () => Awaitable<void>
, times: number
): Promise<ISample[]> {
  const samples: ISample[] = []
  for (let i = times; i--;) {
    const startRSS = process.memoryUsage().rss
    const startTime = performance.now()

    await iterate()

    const endTime = performance.now()
    const endRSS = process.memoryUsage().rss

    const elapsedTime = endTime - startTime
    const memoryIncrements = endRSS - startRSS

    samples.push({ elapsedTime, memoryIncrements })
  }
  return samples
}

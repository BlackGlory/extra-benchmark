import { pass, Awaitable, isFunction, assert } from '@blackglory/prelude'
import { isntUndefined, max, min, sum } from 'extra-utils'
import { avg } from 'iterable-operator'
import { performance } from 'perf_hooks'

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
  fn: () => Awaitable<
  | (() => Awaitable<void | (() => Awaitable<void>)>) // iterate
  | {
      iterate: () => Awaitable<void | (() => Awaitable<void>)>
      beforeEach?: () => Awaitable<void>
      afterAll?: () => Awaitable<void>
    }
  >
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
    const warms = options.warms ?? 100
    validateWarms(warms)
    this.warms = warms

    const runs = options.runs ?? 100
    validateRuns(runs)
    this.runs = runs
  }

  addCase(
    name: string
  , fn: () => Awaitable<
      // iterate(): afterEach
    | (() => Awaitable<void | (() => Awaitable<void>)>)
    | {
        // iterate(): afterEach
        iterate: () => Awaitable<void | (() => Awaitable<void>)>
        beforeEach?: () => Awaitable<void>
        afterAll?: () => Awaitable<void>
      }
    >
  , options: IBenchmarkOptions = {}
  ): void {
    if (isntUndefined(options.warms)) validateWarms(options.warms)
    if (isntUndefined(options.runs)) validateRuns(options.runs)

    this.benchmarkCases.push({ name, fn, options })
  }

  async * run(): AsyncIterable<IBenchmarkCaseResult> {
    for (const benchmarkCase of this.benchmarkCases) {
      const { fn, name, options } = benchmarkCase
      const result = await fn()
      const iterate = isFunction(result)
                    ? result
                    : result.iterate
      const beforeEach = isFunction(result)
                       ? pass
                       : (result.beforeEach ?? pass)
      const afterAll = isFunction(result)
                     ? pass
                     : (result.afterAll ?? pass)
      const warms = options.warms
                 ?? this.warms
      const runs = options.runs
                ?? this.runs

      // warm-up
      await sample({
        iterate
      , beforeEach
      , times: warms
      })

      // run
      const samples: ISample[] = await sample({
        iterate
      , beforeEach
      , times: runs
      })

      await afterAll()

      const elapsedTimes = samples.map(x => x.elapsedTime)
      const maxiumElapsedTime = elapsedTimes.reduce(max)
      const minimumElapsedTime = elapsedTimes.reduce(min)
      const averageElapsedTime = avg(elapsedTimes)

      const totalElapsedTime = elapsedTimes.reduce(sum)
      const operationsPerMillisecond = runs / totalElapsedTime
      const operationsPerSecond = runs / (totalElapsedTime / 1000)

      const memoryIncrments = samples.map(x => x.memoryIncrements)
      const maximumMemoryIncrements = memoryIncrments.reduce(max)
      const minimumMemoryIncrements = memoryIncrments.reduce(min)
      const averageMemoryIncrements = avg(memoryIncrments)

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

async function sample({ iterate, beforeEach, times }: {
  // iterate(): afterEach
  iterate: () => Awaitable<void | (() => Awaitable<void>)>
, beforeEach: () => Awaitable<void>
, times: number
}): Promise<ISample[]> {
  const samples: ISample[] = []

  for (let i = 0; i < times; i++) {
    await beforeEach()

    const startRSS = process.memoryUsage().rss
    const startTime = performance.now()

    const afterEach = await iterate()

    const endTime = performance.now()
    const endRSS = process.memoryUsage().rss

    if (isFunction(afterEach)) {
      await afterEach()
    }

    const elapsedTime = endTime - startTime
    const memoryIncrements = endRSS - startRSS

    samples.push({ elapsedTime, memoryIncrements })
  }

  return samples
}

function validateWarms(warms: number): void {
  assert(Number.isInteger(warms), 'The parameter warms must be an integer')
  assert(warms >= 0, 'The parameter warms must be greater than or equal to zero')
}

function validateRuns(runs: number): void {
  assert(Number.isInteger(runs), 'The parameter options.warm must be an integer')
  assert(runs > 0, 'The parameter options.warm must be greater than zero')
}

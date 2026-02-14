# extra-benchmark
Lightweight benchmarking library.

## Install
```sh
npm install --save extra-benchmark
# or
yarn add extra-benchmark
```

## Usage
```ts
import { Benchmark } from 'extra-benchmark'

const benchmark = new Benchmark('Swap')

benchmark.addCase('Bit-based computing', () => {
  let a = 0
  let b = 1

  return () => {
    a = a ^ b
    b = a ^ b
    a = a ^ b
  }
})

benchmark.addCase('Use a temporary variable', () => {
  let a = 0
  let b = 1

  return () => {
    const temp = a
    a = b
    b = temp
  }
})

console.log(benchmark.name)
for await (const result of benchmark.run()) {
  console.log(result)
}
```

## API
```ts
interface IBenchmarkOptions {
  /* The number of times to warm up the benchmark test */
  warms?: number

  /* The number of times to run the benchmark test */
  runs?: number
}

interface IBenchmarkCaseResult {
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
```

### Benchmark
```ts
class Benchmark {
  readonly name: string

  constructor(
    name: string
  , {
      warms: 100
    , runs: 100
    }: IBenchmarkOptions = {}
  )

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
  , options?: IBenchmarkOptions
  ): void

  run(): AsyncIterable<IBenchmarkCaseResult>
}
```

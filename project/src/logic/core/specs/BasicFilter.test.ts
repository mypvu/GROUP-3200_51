import { expect, test } from 'vitest'
import BasicFilter from '../algorithms/BasicFilter'
import { ds,sample } from '../../utils/csvLoader'

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})


const bf = new BasicFilter(sample, ds)
// bf.extract()
console.log(bf.extract())

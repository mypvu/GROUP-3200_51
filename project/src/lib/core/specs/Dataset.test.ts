import { describe, it } from 'vitest';
import DataSets from '../models/datasets.model';
import sampleCompounds from '../../../../test/sample_compund.json';
import type {CompoundA, CompoundB } from '../models/compund.model';

describe('DataSets', () => {
  it('prints all compounds from sample_compund.json', () => {
    // Split sample compounds into A1, A2, B1, B2 arrays
    const isCompoundA1 = (c: any): c is CompoundA => c.db_label === 'A1'
    const isCompoundA2 = (c: any): c is CompoundA => c.db_label === 'A2'
    const isCompoundB1 = (c: any): c is CompoundB => c.db_label === 'B1'
    const isCompoundB2 = (c: any): c is CompoundB => c.db_label === 'B2'

    const A1: CompoundA[] = sampleCompounds.filter(isCompoundA1)
    const A2: CompoundA[] = sampleCompounds.filter(isCompoundA2)
    const B1: CompoundB[] = sampleCompounds.filter(isCompoundB1)
    const B2: CompoundB[] = sampleCompounds.filter(isCompoundB2)

    const datasets = new DataSets(A1, A2, B1, B2);

    // Print all compounds
    for (const compound of datasets) {
      console.log(compound);
    }
  });
});
import { describe, it } from 'vitest';
import DataSets from '../models/datasets.model';
import sampleCompounds from '../../../../test/sample_compund.json';
import type {CompoundN, CompoundV } from '../models/compund.model';

describe('DataSets', () => {
  it('prints all compounds from sample_compund.json', () => {
    // Split sample compounds into A1, A2, B1, B2 arrays
    const isCompoundA1 = (c: any): c is CompoundN => c.db_label === 'A1'
    const isCompoundA2 = (c: any): c is CompoundN => c.db_label === 'A2'
    const isCompoundB1 = (c: any): c is CompoundV => c.db_label === 'B1'
    const isCompoundB2 = (c: any): c is CompoundV => c.db_label === 'B2'

    const A1: CompoundN[] = sampleCompounds.filter(isCompoundA1)
    const A2: CompoundN[] = sampleCompounds.filter(isCompoundA2)
    const B1: CompoundV[] = sampleCompounds.filter(isCompoundB1)
    const B2: CompoundV[] = sampleCompounds.filter(isCompoundB2)

    const datasets = new DataSets(A1, A2, B1, B2);

    // Print all compounds
    for (const compound of datasets) {
      console.log(compound);
    }
  });
});
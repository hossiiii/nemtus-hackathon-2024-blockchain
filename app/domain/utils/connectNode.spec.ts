import { momijiNodeList, symbolNodeList } from '../../consts/consts';
import { connectNode } from './connectNode';

describe('connectNode', () => {
  it('momijiNodeList', async () => {
    const result = await connectNode(momijiNodeList);
    expect(typeof result).toBe('string');
  });
  it('symbolNodeList', async () => {
    const result = await connectNode(symbolNodeList);
    expect(typeof result).toBe('string');
  });
});

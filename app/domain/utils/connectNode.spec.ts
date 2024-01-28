import { momojiNodeList, symbolNodeList } from '../../consts/consts';
import { connectNode } from './connectNode';

describe('connectNode', () => {
  it('momojiNodeList', async () => {
    const result = await connectNode(momojiNodeList);
    expect(typeof result).toBe('string');
  });
  it('symbolNodeList', async () => {
    const result = await connectNode(symbolNodeList);
    expect(typeof result).toBe('string');
  });

});
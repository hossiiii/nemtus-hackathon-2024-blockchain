import axios from 'axios';

export const connectNode = async (nodeList: string[]): Promise<string> => {
  const node = nodeList[Math.floor(Math.random() * nodeList.length)];
  try {
    const response = await axios.get(node + '/node/health', { timeout: 1000 });
    if (response.data.status.apiNode == 'up' && response.data.status.db == 'up') {
      return node;
    } else {
      return '';
    }
  } catch (e) {
    return '';
  }
};
import { RepositoryFactoryHttp, MetadataTransactionService, TransactionRepository, TransactionStatusRepository, AccountRepository, MetadataRepository, Listener, NetworkType, MosaicId } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';
import { connectNode } from '../../domain/utils/connectNode';
import {
  momijiCurrencyMosaicId,
  momijiExplorer,
  momijiNodeList,
  symbolCurrencyMosaicId,
  symbolExplorer,
  symbolNodeList,
} from '../../consts/consts';
import { BlockChainType } from '../../domain/entities/blockChainType/blockChainType';

interface BlockChainSetup {
  txRepo: TransactionRepository;
  tsRepo: TransactionStatusRepository;
  accountRepo: AccountRepository;
  metaRepo: MetadataRepository;
  metaService: MetadataTransactionService;
  listener: any;
  networkType: NetworkType;
  epochAdjustment: number;
  generationHash: string;
  currencyMosaicId: string;
  explorerUrl: string;
}
export const setupBlockChain = async (blockChainType: BlockChainType): Promise<BlockChainSetup> => {
  const node = await connectNode(blockChainType == 'symbol' ? symbolNodeList : momijiNodeList);
  if (node === '') return undefined;
  const repo = new RepositoryFactoryHttp(node);
  const txRepo = repo.createTransactionRepository();
  const tsRepo = repo.createTransactionStatusRepository();
  const accountRepo = repo.createAccountRepository();
  const metaRepo = repo.createMetadataRepository();
  const metaService = new MetadataTransactionService(metaRepo);
  const listener = repo.createListener();
  const networkType = await firstValueFrom(repo.getNetworkType());
  const epochAdjustment = await firstValueFrom(repo.getEpochAdjustment());
  const generationHash = await firstValueFrom(repo.getGenerationHash());
  const currencyMosaicId =
    blockChainType == 'symbol' ? symbolCurrencyMosaicId : momijiCurrencyMosaicId;
  const explorerUrl = blockChainType == 'symbol' ? symbolExplorer : momijiExplorer;

  return {
    txRepo,
    tsRepo,
    accountRepo,
    metaRepo,
    metaService,
    listener,
    networkType,
    epochAdjustment,
    generationHash,
    currencyMosaicId,
    explorerUrl,
  };
};

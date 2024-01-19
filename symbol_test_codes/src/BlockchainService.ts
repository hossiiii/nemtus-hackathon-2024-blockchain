interface BlockchainService {
    getAlicePrivateKey(): string;
    getAlicePublicKey(): string;
    getAliceAddress(): string;
    getBobPrivateKey(): string;
    getBobPublicKey(): string;
    getBobAddress(): string;
    getNode(): string;
    getCurrencyMosaicId(): string;
    getExplorer(): string;
}

class SymbolService implements BlockchainService {
    constructor(private property: any) {}
  
    getAlicePrivateKey(): string {
      return this.property.aliceSymbolPrivateKey;
    }
  
    getAlicePublicKey(): string {
      return this.property.aliceSymbolPublicKey;
    }
  
    getAliceAddress(): string {
      return this.property.aliceSymbolAddress;
    }

    getBobPrivateKey(): string {
      return this.property.bobSymbolPrivateKey;
    }
  
    getBobPublicKey(): string {
      return this.property.bobSymbolPublicKey;
    }
  
    getBobAddress(): string {
      return this.property.bobSymbolAddress;
    }
      
    getNode(): string {
        return this.property.symbolNode;
    }

    getCurrencyMosaicId(): string {
      return this.property.symbolCurrencyMosaicId;
    }
    
    getExplorer(): string {
      return this.property.symbolExplorer;
    }
  }
  
  class MomijiService implements BlockchainService {
    constructor(private property: any) {}
  
    getAlicePrivateKey(): string {
      return this.property.aliceMomijiPrivateKey;
    }
  
    getAlicePublicKey(): string {
      return this.property.aliceMomijiPublicKey;
    }
  
    getAliceAddress(): string {
      return this.property.aliceMomijiAddress;
    }

    getBobPrivateKey(): string {
      return this.property.bobMomijiPrivateKey;
    }
  
    getBobPublicKey(): string {
      return this.property.bobMomijiPublicKey;
    }
  
    getBobAddress(): string {
      return this.property.bobMomijiAddress;
    }
  
    getNode(): string {
      return this.property.momijiNode;
    }

    getCurrencyMosaicId(): string {
      return this.property.momijiCurrencyMosaicId;
    }

    getExplorer(): string {
      return this.property.momijiExplorer;
    }
  }  
export { BlockchainService, SymbolService, MomijiService };
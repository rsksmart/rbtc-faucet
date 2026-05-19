import Web3 from 'web3';

class FrontendText {
  dispense(dispenseAddress: string, txHash: string): string {
    const message = 'Successfully sent test RBTC to ' + dispenseAddress;

    const withTransactionHash =
      message +
      '<br/> <a href="https://explorer.testnet.rsk.co/tx/' +
      txHash +
      '" target="_blank">View transaction on the explorer</a>';

    return withTransactionHash;
  }

  invalidTransaction(errorMessages: string[]): string {
    return errorMessages.join('<br/>');
  }

  async failedTransaction(txHash: string, web3: Web3): Promise<string> {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    if (receipt == null) {
      return (
        'Your transaction could not be broadcast to the network. ' +
        'No funds were sent. Please wait a moment and try again.'
      );
    }
    if (receipt.status === BigInt(0)) {
      return (
        'Your transaction was mined but reverted, so no test RBTC was transferred. ' +
        '<br/> <a href="https://explorer.testnet.rsk.co/tx/' +
        txHash +
        '" target="_blank">View transaction on the explorer</a>'
      );
    }
    return 'Something unexpected happened while confirming your transaction. Please try again.';
  }
}

export default FrontendText;

import Web3 from 'web3';

class FrontendText {
  dispense(dispenseAddress: string, txHash: string): string {
    const message = 'Successfully sent some RBTCs to ' + dispenseAddress;

    const withTransactionHash =
      message +
      '<br/> <a href="https://explorer.testnet.rsk.co/tx/' +
      txHash +
      '" target="_blank">Transaction hash</a>';

    return withTransactionHash;
  }
  invalidTransaction(errorMessages: string[]): string {
    return errorMessages.reduce((a, b) => '<br/>' + a + '<br/>' + b);
  }
  async failedTransaction(txHash: string, web3: Web3): Promise<string> {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    if (receipt == null) {
      return 'The transaction wasn\'t propagated due to internal problems. <br/> Please try again in a while';
    } else if (receipt.status == false) {
      return (
        'The transaction was reverted by the RVM. <br/> <a href="https://explorer.testnet.rsk.co/tx/' +
        txHash +
        '" target="_blank">Transaction hash</a>'
      );
    } else {
      return 'This is unexpected. <br/> Please try again in a while';
    }
  }
}

export default FrontendText;

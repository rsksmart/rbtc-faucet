import Store from '../../store/root-store';
import { NextApiRequest, NextApiResponse } from 'next';
import FaucetUtil from '../../utils/faucet-util';

const handleDispense = (req: NextApiRequest, res: NextApiResponse): void => {
    res.setHeader('Content-Type', 'application/json');

    const address: string = req.body.address;

    if(!Store.getInstance().alreadyDispensed(address)) {
        new FaucetUtil().dispense(address)
            .on('transactionHash', (txHash: string) => {
                Store.getInstance().saveDispensedAddress(address);
                res.status(200).json({ transactionHash: txHash });
            })
            .on('error', (e: Error) => res.status(400).json({ error: e }))
    } else {
        res.status(204).end() //if its already dispensed
    }
}

export default handleDispense;
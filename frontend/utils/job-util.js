import CronJob from  'cron'

class JobUtil {
    startedOneDayJob() { //Returns a new job wich is gonna be fired again in 24hs
        let job = new CronJob({
            cronTime: '* */59 * * * *',
            onTick: function() {
                for (const storeAddress in faucetHistory) {
                    if (faucetHistory.hasOwnProperty(storeAddress)) {
                        const now = new Date().getTime();
                        //86400000 = 1 day
                        if(now - faucetHistory[storeAddress].timestamp >= 86400000) {
                            delete faucetHistory[storeAddress];
                        }
                    }
                }
            }, 
            start: false, timeZone: 'America/Los_Angeles'
        });
        job.start();
        
        return job;
    }
}

export default JobUtil;
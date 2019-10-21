import chalk from 'chalk';

const logger = {
    info: (info: any): void => console.log('[ ' + chalk.cyan.dim('info') + ' ] ' + info),
    warning: (warn: any): void => console.log('[ ' + chalk.yellow('warning') + ' ] ' + warn),
    error: (error: any): void => console.log('[ ' + chalk.red('error') + ' ] ' + error),
    success: (success: any): void => console.log('[ ' + chalk.green('success') + ' ] ' + success),
    event: (event: any): void => console.log('[ ' + chalk.cyan.dim('event') + ' ] ' + event),
}

export default logger;
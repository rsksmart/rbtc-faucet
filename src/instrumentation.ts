export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    return;
  }

  const { logStartup } = await import('@/utils/logger');
  const { getStartupContext } = await import('@/utils/startup-context');
  logStartup(getStartupContext());
}

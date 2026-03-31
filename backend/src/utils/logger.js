const LOG_LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', DEBUG: 'DEBUG' };

const formatLog = (level, event, data = {}) => {
  const log = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...data,
  };
  return JSON.stringify(log);
};

const logger = {
  info: (event, data) => console.log(formatLog(LOG_LEVELS.INFO, event, data)),
  warn: (event, data) => console.warn(formatLog(LOG_LEVELS.WARN, event, data)),
  error: (event, data) => console.error(formatLog(LOG_LEVELS.ERROR, event, data)),
  debug: (event, data) => console.debug(formatLog(LOG_LEVELS.DEBUG, event, data)),
};

module.exports = logger;

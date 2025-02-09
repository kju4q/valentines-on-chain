import { EventEmitter } from "events";

class BotMonitor extends EventEmitter {
  private lastHeartbeat: Date = new Date();
  private tweetCount: number = 0;
  private errorCount: number = 0;

  recordTweet() {
    this.tweetCount++;
    this.lastHeartbeat = new Date();
  }

  recordError(error: Error) {
    this.errorCount++;
    this.emit("error", error);
  }

  getStats() {
    return {
      uptime: Date.now() - this.lastHeartbeat.getTime(),
      tweets: this.tweetCount,
      errors: this.errorCount,
    };
  }
}

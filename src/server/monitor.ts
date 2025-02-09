import { EventEmitter } from "events";

export class BotMonitor extends EventEmitter {
  private lastHeartbeat: Date = new Date();
  private tweetCount: number = 0;
  private errorCount: number = 0;
  private lastReset = new Date();

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

  trackTweet() {
    const now = new Date();
    // Reset at midnight UTC
    if (now.getUTCDate() !== this.lastReset.getUTCDate()) {
      this.tweetCount = 0;
      this.lastReset = now;
    }
    this.tweetCount++;
    return this.tweetCount;
  }

  canTweet() {
    return this.tweetCount < 15; // Keep safety margin
  }
}

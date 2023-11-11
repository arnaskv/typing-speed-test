export class Timer {
    constructor(duration, onChange, onComplete) {
        this.duration = duration;
        this.timeLeft = duration;
        this.onChange = onChange;
        this.onComplete = onComplete;
        this.timerId = null;
        this.timerActive = false;
        this.onChange(this.timeLeft);
    }
  
    start() {
        if (!this.timerActive) {
            this.timerId = setInterval(() => {
                this.timeLeft--;
    
                if (this.onChange) {
                    this.onChange(this.timeLeft);
                }
    
                if (this.timeLeft <= 0) {
                    this.stop();
                    if (this.onComplete) {
                    this.onComplete();
                    }
                }
            }, 1000);
            
            this.timerActive = true;
        }
}
  
    stop() {
        clearInterval(this.timerId);
        this.timerActive = false;
    }

    reset() {
        this.stop();
        this.timeLeft = this.duration;
        this.onChange(this.timeLeft);
    }
}

export default Timer;
